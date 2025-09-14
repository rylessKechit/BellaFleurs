// src/app/api/payments/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, formatAmountForStripe, handleStripeError } from '@/lib/stripe';
import { z } from 'zod';

// Schéma de validation pour la création du Payment Intent
const createPaymentIntentSchema = z.object({
  amount: z.number().min(50, 'Montant minimum: 0.50€').max(99999999, 'Montant trop élevé'),
  currency: z.string().default('eur'),
  customerEmail: z.string().email().optional(),
  orderData: z.object({
    items: z.array(z.object({
      product: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
      image: z.string().optional()
    })),
    customerInfo: z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string()
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
    paymentMethod: z.string(),
    totalAmount: z.number()
  })
});

// POST /api/payments/create-payment-intent
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification (optionnel pour les invités)
    const session = await getServerSession(authOptions);

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

    const { amount, currency, customerEmail, orderData } = validationResult.data;

    // Préparer les métadonnées pour Stripe (limité à 500 caractères par clé)
    const metadata: Record<string, string> = {
      // Informations client
      customer_name: orderData.customerInfo.name.substring(0, 490),
      customer_email: orderData.customerInfo.email.substring(0, 490),
      customer_phone: orderData.customerInfo.phone.substring(0, 490),
      
      // Informations livraison
      delivery_type: orderData.deliveryInfo.type,
      delivery_date: new Date(orderData.deliveryInfo.date).toISOString(),
      delivery_address: orderData.deliveryInfo.address ? 
        `${orderData.deliveryInfo.address.street}, ${orderData.deliveryInfo.address.city} ${orderData.deliveryInfo.address.zipCode}`.substring(0, 490) : '',
      
      // Informations commande
      total_amount: orderData.totalAmount.toString(),
      items_count: orderData.items.length.toString(),
      payment_method: orderData.paymentMethod,
      
      // Utilisateur connecté (si applicable)
      user_id: session?.user?.id || 'guest',
      
      // Notes
      delivery_notes: orderData.deliveryInfo.notes?.substring(0, 490) || ''
    };

    // Ajouter les items (format condensé)
    const itemsMetadata = orderData.items.map(item => 
      `${item.name}:${item.quantity}x${item.price}€`
    ).join('|');
    metadata.items = itemsMetadata.substring(0, 490);

    // Créer le Payment Intent avec Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Déjà en centimes
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: customerEmail || orderData.customerInfo.email,
      metadata: metadata,
      description: `Commande Bella Fleurs - ${orderData.customerInfo.name}`,
    });

    // Log pour le debug (à retirer en production)
    console.log('✅ Payment Intent créé:', {
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency,
      customer: orderData.customerInfo.name
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
          code: 'MISSING_PAYMENT_INTENT_ID'
        }
      }, { status: 400 });
    }

    // Récupérer le Payment Intent depuis Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

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
        code: 'PAYMENT_INTENT_GET_ERROR'
      }
    }, { status: 500 });
  }
}