// src/app/api/orders/by-payment-intent/[paymentIntentId]/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

interface RouteParams {
  params: {
    paymentIntentId: string;
  };
}

// GET /api/orders/by-payment-intent/[paymentIntentId] - Récupérer une commande par Payment Intent ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Optionnel : Vérifier l'authentification (selon vos besoins)
    // Pour le checkout success, on peut autoriser sans auth pour plus de flexibilité
    
    await connectDB();
    
    const { paymentIntentId } = params;
    
    if (!paymentIntentId) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Payment Intent ID requis',
          code: 'PAYMENT_INTENT_ID_REQUIRED'
        }
      }, { status: 400 });
    }

    // Rechercher la commande par stripePaymentIntentId
    const order = await Order.findOne({ 
      stripePaymentIntentId: paymentIntentId 
    })
    .populate('items.product', 'name images slug')
    .lean();
    
    if (!order) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Commande non trouvée pour ce Payment Intent',
          code: 'ORDER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Si on vérifie l'auth, s'assurer que l'utilisateur peut accéder à cette commande
    if (session?.user) {
      // Si l'utilisateur est connecté, vérifier qu'il est propriétaire de la commande ou admin
      const isOwner = order.user?.toString() === session.user.id;
      const isAdmin = session.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Accès non autorisé à cette commande',
            code: 'ACCESS_DENIED'
          }
        }, { status: 403 });
      }
    }

    // Retourner la commande avec toutes les informations nécessaires
    return NextResponse.json({
      success: true,
      data: {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          totalAmount: order.totalAmount,
          stripePaymentIntentId: order.stripePaymentIntentId,
          stripeReceiptUrl: order.stripeReceiptUrl,
          customerInfo: order.customerInfo,
          deliveryInfo: order.deliveryInfo,
          items: order.items,
          adminNotes: order.adminNotes,
          timeline: order.timeline,
          estimatedDelivery: order.estimatedDelivery,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          confirmedAt: order.confirmedAt,
          preparedAt: order.preparedAt,
          readyAt: order.readyAt,
          deliveredAt: order.deliveredAt
        }
      },
      message: 'Commande récupérée avec succès'
    });

  } catch (error: any) {
    console.error('❌ Get order by payment intent error:', error);
    
    // Gestion spécifique des erreurs MongoDB
    if (error.name === 'CastError') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Format de Payment Intent ID invalide',
          code: 'INVALID_PAYMENT_INTENT_FORMAT'
        }
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération de la commande',
        code: 'ORDER_FETCH_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }, { status: 500 });
  }
}

// POST /api/orders/by-payment-intent/[paymentIntentId] - Créer une commande depuis un Payment Intent (fallback)
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    await connectDB();
    
    const { paymentIntentId } = params;
    const body = await request.json();
    
    if (!paymentIntentId) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Payment Intent ID requis',
          code: 'PAYMENT_INTENT_ID_REQUIRED'
        }
      }, { status: 400 });
    }

    // Vérifier si une commande existe déjà pour ce Payment Intent
    const existingOrder = await Order.findOne({ 
      stripePaymentIntentId: paymentIntentId 
    });
    
    if (existingOrder) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Une commande existe déjà pour ce Payment Intent',
          code: 'ORDER_ALREADY_EXISTS'
        }
      }, { status: 409 });
    }

    // Valider les données requises
    const { orderData } = body;
    
    if (!orderData || !orderData.customerInfo || !orderData.deliveryInfo || !orderData.items) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Données de commande incomplètes',
          code: 'INCOMPLETE_ORDER_DATA'
        }
      }, { status: 400 });
    }

    // Générer un numéro de commande unique
    const generateOrderNumber = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      return `BF-${year}${month}${day}-${random}`;
    };

    // Créer la commande de fallback
    const newOrder = new Order({
      orderNumber: generateOrderNumber(),
      user: session?.user?.id || undefined,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      status: 'payée', // Le paiement a été confirmé par Stripe
      paymentStatus: 'paid',
      paymentMethod: 'card',
      stripePaymentIntentId: paymentIntentId,
      deliveryInfo: orderData.deliveryInfo,
      customerInfo: orderData.customerInfo,
      adminNotes: 'Commande créée via fallback après paiement Stripe réussi',
      timeline: [
        {
          status: 'payée',
          date: new Date(),
          note: 'Paiement confirmé par Stripe'
        }
      ],
      confirmedAt: new Date()
    });

    await newOrder.save();

    console.log('✅ Commande fallback créée:', newOrder.orderNumber);

    return NextResponse.json({
      success: true,
      data: {
        order: newOrder
      },
      message: 'Commande créée avec succès'
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Create fallback order error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la création de la commande fallback',
        code: 'FALLBACK_ORDER_CREATION_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }, { status: 500 });
  }
}

// PUT /api/orders/by-payment-intent/[paymentIntentId] - Mettre à jour une commande par Payment Intent (admin)
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Seuls les admins peuvent mettre à jour via cette route
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès refusé. Droits administrateur requis.',
          code: 'ACCESS_DENIED'
        }
      }, { status: 403 });
    }
    
    await connectDB();
    
    const { paymentIntentId } = params;
    const updateData = await request.json();
    
    const order = await Order.findOne({ 
      stripePaymentIntentId: paymentIntentId 
    });
    
    if (!order) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Commande non trouvée',
          code: 'ORDER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Mettre à jour les champs autorisés
    const allowedFields = ['status', 'adminNotes', 'deliveryInfo', 'estimatedDelivery'];
    const updates: any = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    }

    // Si on change le statut, ajouter une entrée dans la timeline
    if (updateData.status && updateData.status !== order.status) {
      updates.$push = {
        timeline: {
          status: updateData.status,
          date: new Date(),
          note: updateData.statusNote || `Statut mis à jour par ${session.user.name}`
        }
      };

      // Mettre à jour les timestamps spécifiques selon le statut
      switch (updateData.status) {
        case 'en_creation':
          updates.preparedAt = undefined;
          updates.readyAt = undefined;
          updates.deliveredAt = undefined;
          break;
        case 'prête':
          updates.readyAt = new Date();
          break;
        case 'en_livraison':
          if (!order.readyAt) updates.readyAt = new Date();
          break;
        case 'livrée':
          updates.deliveredAt = new Date();
          break;
        case 'annulée':
          updates.cancelledAt = new Date();
          break;
      }
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      updates,
      { new: true }
    ).populate('items.product', 'name images slug');

    return NextResponse.json({
      success: true,
      data: {
        order: updatedOrder
      },
      message: 'Commande mise à jour avec succès'
    });

  } catch (error: any) {
    console.error('❌ Update order by payment intent error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour de la commande',
        code: 'ORDER_UPDATE_ERROR'
      }
    }, { status: 500 });
  }
}