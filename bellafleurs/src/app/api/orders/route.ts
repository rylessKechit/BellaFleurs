// src/app/api/orders/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { z } from 'zod';

// Schéma de validation pour la création de commande - CORRIGÉ
const createOrderSchema = z.object({
  items: z.array(z.object({
    product: z.string(),
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    image: z.string().optional()
  })).min(1, 'Au moins un article requis'),
  customerInfo: z.object({
    name: z.string().min(2, 'Nom requis'),
    email: z.string().email('Email invalide'),
    phone: z.string().min(10, 'Téléphone requis')
  }),
  deliveryInfo: z.object({
    type: z.enum(['delivery', 'pickup']),
    address: z.object({
      street: z.string().min(1, 'Adresse requise'),
      city: z.string().min(1, 'Ville requise'),
      zipCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
      complement: z.string().optional()
    }).optional(),
    date: z.string().or(z.date()),
    notes: z.string().optional()
  }),
  paymentMethod: z.enum(['card', 'paypal']).default('card'), // CORRIGÉ : 'paypal' au lieu de 'cash'
  totalAmount: z.number().positive()
});

// POST /api/orders - Créer une nouvelle commande
export async function POST(request: NextRequest) {
  try {
    // Connexion à la base de données
    await connectDB();

    // Vérifier l'authentification (optionnel pour les invités)
    const session = await getServerSession(authOptions);
    
    // Valider les données d'entrée
    const body = await request.json();
    console.log('📥 Données reçues:', body);
    
    const validationResult = createOrderSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('❌ Erreur de validation:', validationResult.error);
      return NextResponse.json({
        success: false,
        error: {
          message: 'Données invalides',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.errors
        }
      }, { status: 400 });
    }

    const { items, customerInfo, deliveryInfo, paymentMethod, totalAmount } = validationResult.data;

    // Vérifier que tous les produits existent et sont actifs
    const productIds = items.map(item => item.product);
    const products = await Product.find({ 
      _id: { $in: productIds }, 
      isActive: true 
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Certains produits ne sont plus disponibles',
          code: 'PRODUCTS_UNAVAILABLE'
        }
      }, { status: 400 });
    }

    // Vérifier les prix (sécurité)
    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.product);
      if (!product) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Produit introuvable',
            code: 'PRODUCT_NOT_FOUND'
          }
        }, { status: 400 });
      }
      
      if (Math.abs(product.price - item.price) > 0.01) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Les prix ont changé. Veuillez actualiser votre panier.',
            code: 'PRICE_MISMATCH'
          }
        }, { status: 400 });
      }
    }

    // Générer un numéro de commande unique
    const orderNumber = await generateOrderNumber();

    // Calculer le sous-total
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculer les frais de livraison
    const deliveryFee = deliveryInfo.type === 'delivery' ? (subtotal >= 50 ? 0 : 10) : 0;
    
    // Vérifier le montant total
    const expectedTotal = subtotal + deliveryFee;
    if (Math.abs(expectedTotal - totalAmount) > 0.01) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Montant total incorrect',
          code: 'TOTAL_MISMATCH'
        }
      }, { status: 400 });
    }

    // Créer la commande avec les bonnes valeurs d'enum
    const orderData = {
      orderNumber,
      user: session?.user?.id || null,
      items: items.map(item => ({
        product: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      customerInfo,
      deliveryInfo: {
        ...deliveryInfo,
        date: new Date(deliveryInfo.date)
      },
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod,
      status: 'payée', // CORRIGÉ : utiliser 'pending' au lieu de 'en_attente'
      paymentStatus: 'paid',
      timeline: [{
        status: 'pending', // CORRIGÉ : utiliser 'pending' au lieu de 'en_attente'
        date: new Date(),
        note: 'Commande créée en attente de paiement'
      }]
    };

    console.log('📝 Données de commande à créer:', orderData);

    const order = new Order(orderData);
    await order.save();

    console.log('✅ Commande créée:', {
      orderNumber: order.orderNumber,
      orderId: order._id,
      customerEmail: customerInfo.email,
      totalAmount: order.totalAmount
    });

    return NextResponse.json({
      success: true,
      message: 'Commande créée avec succès',
      data: {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          totalAmount: order.totalAmount,
          items: order.items,
          customerInfo: order.customerInfo,
          deliveryInfo: order.deliveryInfo,
          createdAt: order.createdAt
        }
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Order creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Données invalides',
          code: 'VALIDATION_ERROR',
          details: error.errors
        }
      }, { status: 400 });
    }

    // Erreur de validation Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message
      }));

      return NextResponse.json({
        success: false,
        error: {
          message: 'Erreur de validation des données',
          code: 'MONGOOSE_VALIDATION_ERROR',
          details: validationErrors
        }
      }, { status: 400 });
    }

    // Erreur de duplication (numéro de commande)
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Erreur de création de commande (duplication)',
          code: 'DUPLICATE_ORDER'
        }
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la création de la commande',
        code: 'ORDER_CREATION_ERROR'
      }
    }, { status: 500 });
  }
}

// GET /api/orders - Récupérer les commandes (admin ou utilisateur selon les droits)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Authentification requise',
          code: 'AUTH_REQUIRED'
        }
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    let query: any = {};

    // Si admin, peut voir toutes les commandes, sinon seulement les siennes
    if (session.user.role !== 'admin') {
      query = {
        $or: [
          { user: session.user.id },
          { 'customerInfo.email': session.user.email }
        ]
      };
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.product', 'name images')
        .lean(),
      Order.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Orders GET error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des commandes',
        code: 'ORDERS_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}

// Fonction utilitaire pour générer un numéro de commande unique
async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // Format: BF-YYYYMMDD-XXXX
  const datePrefix = `BF-${year}${month}${day}`;
  
  // Trouver le dernier numéro du jour
  const lastOrder = await Order.findOne({
    orderNumber: { $regex: `^${datePrefix}` }
  }).sort({ orderNumber: -1 });

  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `${datePrefix}-${String(sequence).padStart(4, '0')}`;
}