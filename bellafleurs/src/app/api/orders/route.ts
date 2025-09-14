// src/app/api/orders/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { z } from 'zod';

// Schéma de validation pour la création de commande
const createOrderSchema = z.object({
  items: z.array(z.object({
    product: z.string(),
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    image: z.string().optional()
  })).min(1),
  customerInfo: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10)
  }),
  deliveryInfo: z.object({
    type: z.enum(['delivery', 'pickup']),
    address: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      zipCode: z.string().regex(/^\d{5}$/),
      complement: z.string().optional()
    }).optional(),
    date: z.string().or(z.date()),
    notes: z.string().optional()
  }),
  paymentMethod: z.enum(['card', 'paypal']).default('card'),
  totalAmount: z.number().positive(),
  stripePaymentIntentId: z.string().optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed']).default('pending'),
  status: z.enum(['payée', 'en_creation', 'prête', 'en_livraison', 'livrée', 'annulée']).default('payée')
});

// POST /api/orders - Créer une commande (fallback)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Vérifier l'authentification (optionnel pour les invités)
    const session = await getServerSession(authOptions);
    
    const body = await request.json();
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

    const { items, customerInfo, deliveryInfo, paymentMethod, totalAmount, stripePaymentIntentId, paymentStatus, status } = validationResult.data;

    // Vérifier si une commande avec ce Payment Intent existe déjà
    if (stripePaymentIntentId) {
      const existingOrder = await Order.findOne({ stripePaymentIntentId });
      if (existingOrder) {
        return NextResponse.json({
          success: true,
          message: 'Commande déjà existante',
          data: { order: existingOrder }
        });
      }
    }

    // Générer le numéro de commande
    const orderNumber = await Order.generateOrderNumber();

    // Créer la commande
    const order = new Order({
      orderNumber,
      user: session?.user?.id || null,
      items,
      totalAmount,
      status,
      paymentStatus,
      paymentMethod,
      stripePaymentIntentId,
      deliveryInfo: {
        ...deliveryInfo,
        date: new Date(deliveryInfo.date)
      },
      customerInfo,
      timeline: [{
        status,
        date: new Date(),
        note: 'Commande créée'
      }]
    });

    await order.save();

    console.log('✅ Commande créée:', {
      id: order._id,
      orderNumber: order.orderNumber,
      via: 'API fallback'
    });

    return NextResponse.json({
      success: true,
      message: 'Commande créée avec succès',
      data: { order }
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

    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la création de la commande',
        code: 'ORDER_CREATION_ERROR'
      }
    }, { status: 500 });
  }
}

// GET /api/orders - Récupérer les commandes
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
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    let filters: any = {};

    if (session.user.role !== 'admin') {
      filters.user = session.user.id;
    }

    if (status && status !== 'all') {
      filters.status = status;
    }

    const orders = await Order.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .select('-__v');

    const total = await Order.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPrevPage ? page - 1 : null
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