// src/app/api/payments/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, formatAmountForStripe, handleStripeError, validateStripeMetadata } from '@/lib/stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { z } from 'zod';

// Schéma de validation pour la création du Payment Intent
const createPaymentIntentSchema = z.object({
  orderId: z.string().min(1, 'Order ID requis'),
  amount: z.number().min(50, 'Montant minimum: 0.50€').max(99999999, 'Montant trop élevé'),
  currency: z.string().default('eur'),
  customerEmail: z.string().email().optional(),
  metadata: z.record(z.string()).optional()
});

// POST /api/payments/create-payment-intent
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
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

    // Valider les données d'entrée
    const body = await req.json();
    const validationResult = createPaymentIntentSchema.safeParse(body);
    
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

    const { orderId, amount, currency, customerEmail, metadata } = validationResult.data;

    // Connecter à la base de données
    await connectDB();

    // Vérifier que la commande existe et appartient à l'utilisateur
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Commande introuvable',
          code: 'ORDER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Vérifier que l'utilisateur peut payer cette commande
    if (order.user?.toString() !== session.user.id && !customerEmail) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès refusé à cette commande',
          code: 'ACCESS_DENIED'
        }
      }, { status: 403 });
    }

    // Vérifier que la commande n'est pas déjà payée
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Commande déjà payée',
          code: 'ALREADY_PAID'
        }
      }, { status: 400 });
    }

    // Vérifier que le montant correspond à la commande
    const orderAmountInCents = formatAmountForStripe(order.totalAmount, currency);
    if (Math.abs(amount - orderAmountInCents) > 1) { // Tolérance de 1 centime
      return NextResponse.json({
        success: false,
        error: {
          message: 'Montant incorrect',
          code: 'AMOUNT_MISMATCH'
        }
      }, { status: 400 });
    }

    // Préparer les métadonnées pour Stripe
    const stripeMetadata = validateStripeMetadata({
      orderId: order.id.toString(),
      orderNumber: order.orderNumber,
      customerName: order.customerInfo.name,
      customerEmail: order.customerInfo.email,
      userId: session.user.id,
      ...metadata
    });

    // Créer le Payment Intent avec Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency.toLowerCase(),
      metadata: stripeMetadata,
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Paiement pour commande ${order.orderNumber}`,
      receipt_email: customerEmail || order.customerInfo.email,
      setup_future_usage: undefined, // Pas de réutilisation future par défaut
    });

    // Mettre à jour la commande avec l'ID du Payment Intent
    await Order.findByIdAndUpdate(orderId, {
      stripePaymentIntentId: paymentIntent.id,
      paymentStatus: 'pending',
      $push: {
        timeline: {
          status: 'pending',
          date: new Date(),
          note: 'Payment Intent créé'
        }
      }
    });

    // Log pour le debug (à retirer en production)
    console.log('✅ Payment Intent créé:', {
      paymentIntentId: paymentIntent.id,
      orderId: order._id,
      amount: amount,
      currency: currency
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentIntent: {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status
        },
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Create Payment Intent error:', error);

    // Gestion spécifique des erreurs Stripe
    if (error.type?.startsWith('Stripe')) {
      const stripeError = handleStripeError(error);
      return NextResponse.json({
        success: false,
        error: {
          message: stripeError.message,
          code: stripeError.code,
          type: 'stripe_error'
        }
      }, { status: 400 });
    }

    // Erreur générale
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la création du paiement',
        code: 'PAYMENT_INTENT_CREATION_ERROR'
      }
    }, { status: 500 });
  }
}

// GET /api/payments/create-payment-intent - Récupérer un Payment Intent existant
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

    const { searchParams } = new URL(req.url);
    const paymentIntentId = searchParams.get('payment_intent_id');

    if (!paymentIntentId) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Payment Intent ID requis',
          code: 'PAYMENT_INTENT_ID_REQUIRED'
        }
      }, { status: 400 });
    }

    // Récupérer le Payment Intent depuis Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Vérifier que l'utilisateur peut accéder à ce Payment Intent
    const orderId = paymentIntent.metadata.orderId;
    if (orderId) {
      await connectDB();
      const order = await Order.findById(orderId);
      if (order && order.user?.toString() !== session.user.id) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Accès refusé',
            code: 'ACCESS_DENIED'
          }
        }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          client_secret: paymentIntent.client_secret
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Get Payment Intent error:', error);

    if (error.type?.startsWith('Stripe')) {
      const stripeError = handleStripeError(error);
      return NextResponse.json({
        success: false,
        error: {
          message: stripeError.message,
          code: stripeError.code,
          type: 'stripe_error'
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération du paiement',
        code: 'PAYMENT_INTENT_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}