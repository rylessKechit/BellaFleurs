// src/app/api/orders/route.ts - Version avec emails
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import { sendOrderConfirmation, sendNewOrderNotification } from '@/lib/email';
import { z } from 'zod';

const createOrderSchema = z.object({
  items: z.array(z.object({
    product: z.string(),
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    image: z.string().optional()
  })).min(1, 'Au moins un article requis'),
  customerInfo: z.object({
    name: z.string().min(1, 'Nom requis'),
    email: z.string().email('Email invalide'),
    phone: z.string().min(1, 'Téléphone requis')
  }),
  deliveryInfo: z.object({
    type: z.enum(['delivery', 'pickup']),
    address: z.object({
      street: z.string(),
      city: z.string(),
      zipCode: z.string(),
      complement: z.string().optional()
    }).optional(),
    date: z.date().or(z.string()),
    notes: z.string().optional()
  }),
  totalAmount: z.number().positive(),
  paymentMethod: z.string().default('card'),
  paymentStatus: z.enum(['pending', 'paid']).default('pending'),
  status: z.enum(['payée', 'en_creation', 'prête', 'en_livraison', 'livrée']).default('payée'),
  stripePaymentIntentId: z.string().optional()
});

// POST - Créer une nouvelle commande
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    await connectDB();

    // Valider les données
    const body = await req.json();
    const validationResult = createOrderSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Données invalides',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.errors
        }
      }, { status: 400 });
    }

    const orderData = validationResult.data;

    // Vérifier si une commande avec ce Payment Intent existe déjà
    if (orderData.stripePaymentIntentId) {
      const existingOrder = await Order.findOne({ 
        stripePaymentIntentId: orderData.stripePaymentIntentId 
      });
      
      if (existingOrder) {
        console.log('⚠️ Commande déjà existante via Payment Intent:', existingOrder.orderNumber);
        return NextResponse.json({
          success: true,
          data: { order: existingOrder },
          message: 'Commande déjà existante'
        });
      }
    }

    // Générer le numéro de commande
    const orderNumber = await Order.generateOrderNumber();

    // Créer la commande
    const newOrder = new Order({
      ...orderData,
      orderNumber,
      user: session?.user?.id || null,
      deliveryInfo: {
        ...orderData.deliveryInfo,
        date: new Date(orderData.deliveryInfo.date)
      },
      timeline: [
        {
          status: orderData.status || 'payée',
          date: new Date(),
          note: 'Commande créée'
        }
      ]
    });

    await newOrder.save();
    
    console.log('✅ Commande créée côté client:', newOrder.orderNumber);

    // Vider le panier si l'utilisateur est connecté
    if (session?.user?.id) {
      try {
        await Cart.deleteOne({ user: session.user.id });
        console.log('🛒 Panier vidé');
      } catch (error) {
        console.warn('⚠️ Erreur vidage panier:', error);
      }
    }

    // ✅ ENVOYER LES EMAILS - NOUVELLEMENT AJOUTÉ
    try {
      // Email de confirmation au client
      console.log('📧 Envoi email de confirmation (fallback)...');
      const confirmationSent = await sendOrderConfirmation(newOrder);
      
      // Notification à l'admin
      console.log('📧 Envoi notification admin (fallback)...');
      const adminNotificationSent = await sendNewOrderNotification(newOrder);

      // Mettre à jour les statuts d'email
      await Order.findByIdAndUpdate(newOrder._id, {
        emailsSent: {
          confirmation: confirmationSent,
          adminNotification: adminNotificationSent,
          sentAt: new Date()
        }
      });

      console.log(`📧 Emails envoyés - Confirmation: ${confirmationSent}, Admin: ${adminNotificationSent}`);

    } catch (emailError) {
      console.error('❌ Erreur envoi emails (fallback):', emailError);
      // Ne pas faire échouer la création de commande pour autant
    }

    return NextResponse.json({
      success: true,
      data: { order: newOrder },
      message: 'Commande créée avec succès'
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Orders POST error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la création de la commande',
        code: 'ORDER_CREATION_ERROR'
      }
    }, { status: 500 });
  }
}

// GET - Récupérer les commandes de l'utilisateur connecté
export async function GET(req: NextRequest) {
  try {
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

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const query: any = { user: session.user.id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

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