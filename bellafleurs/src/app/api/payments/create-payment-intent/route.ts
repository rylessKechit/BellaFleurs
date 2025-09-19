// src/app/api/payments/create-payment-intent/route.ts - Version avec support variants
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { createOrderSchema } from '@/lib/validations';

// Fonction d'aide pour gérer les erreurs Stripe
function handleStripeError(error: any) {
  const errorMessages: Record<string, string> = {
    'card_declined': 'Votre carte a été refusée',
    'insufficient_funds': 'Fonds insuffisants',
    'expired_card': 'Votre carte a expiré',
    'incorrect_cvc': 'Code de sécurité incorrect',
    'processing_error': 'Erreur de traitement, veuillez réessayer',
    'amount_too_large': 'Montant trop élevé',
    'amount_too_small': 'Montant trop faible'
  };

  return {
    message: errorMessages[error.code] || 'Erreur de paiement',
    code: error.code || 'STRIPE_ERROR'
  };
}

// POST /api/payments/create-payment-intent - Créer un Payment Intent avec variants
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    console.log('🔄 Création Payment Intent...');

    // Validation des données avec Zod
    const validationResult = createOrderSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.errors);
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

    // Calculs et validation
    const calculatedTotal = orderData.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );

    if (Math.abs(calculatedTotal - orderData.totalAmount) > 0.01) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Incohérence dans le total de la commande',
          code: 'AMOUNT_MISMATCH'
        }
      }, { status: 400 });
    }

    // Conversion pour Stripe (centimes)
    const amount = Math.round(orderData.totalAmount * 100);
    const currency = 'eur';
    const customerEmail = session?.user?.email;

    if (amount < 50) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Montant minimum : 0.50€',
          code: 'AMOUNT_TOO_SMALL'
        }
      }, { status: 400 });
    }

    if (amount > 999999) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Montant maximum dépassé',
          code: 'AMOUNT_TOO_LARGE'
        }
      }, { status: 400 });
    }

    // MÉTADONNÉES STRIPE AVEC SUPPORT VARIANTS
    const metadata: Record<string, string> = {
      // Informations client
      customer_name: orderData.customerInfo.name,
      customer_email: orderData.customerInfo.email,
      customer_phone: orderData.customerInfo.phone,
      
      // Informations livraison
      delivery_type: orderData.deliveryInfo.type,
      delivery_date: orderData.deliveryInfo.date.toISOString(),
      delivery_address: orderData.deliveryInfo.address 
        ? `${orderData.deliveryInfo.address.street}, ${orderData.deliveryInfo.address.city} ${orderData.deliveryInfo.address.zipCode}`.substring(0, 490)
        : '',
      
      // Informations commande
      total_amount: orderData.totalAmount.toString(),
      items_count: orderData.items.length.toString(),
      payment_method: orderData.paymentMethod,
      
      // Utilisateur connecté (si applicable)
      user_id: session?.user?.id || 'guest',
      
      // Notes
      delivery_notes: orderData.deliveryInfo.notes?.substring(0, 490) || ''
    };

    // NOUVEAU : Ajouter les items avec variants (format amélioré)
    const itemsWithVariants = orderData.items.map(item => {
      let itemString = `${item.name}:${item.quantity}x${item.price}€`;
      
      // AJOUT : Inclure les informations de variant si présentes
      if (item.variantId && item.variantName) {
        itemString += `[${item.variantName}]`;
      }
      
      return itemString;
    }).join('|');
    
    metadata.items = itemsWithVariants.substring(0, 490);

    // NOUVEAU : Métadonnées spécifiques aux variants (si présents)
    const hasVariants = orderData.items.some(item => item.variantId);
    if (hasVariants) {
      metadata.has_variants = 'true';
      
      // Compter les items avec variants
      const variantItems = orderData.items.filter(item => item.variantId);
      metadata.variant_items_count = variantItems.length.toString();
      
      // Liste des variants (format condensé)
      const variantsList = variantItems
        .map(item => `${item.variantId}:${item.variantName}`)
        .join('|');
      metadata.variants = variantsList.substring(0, 490);
    }

    // Créer le Payment Intent avec Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: customerEmail || orderData.customerInfo.email,
      metadata: metadata,
      description: `Commande Bella Fleurs - ${orderData.customerInfo.name}${hasVariants ? ' (avec variants)' : ''}`,
    });

    // Log pour le debug
    const variantItems = orderData.items.filter(item => item.variantId);
    console.log('✅ Payment Intent créé:', {
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency,
      customer: orderData.customerInfo.name,
      hasVariants: hasVariants,
      itemsWithVariants: variantItems.length || 0
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
          message: 'ID Payment Intent requis',
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
          client_secret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          metadata: paymentIntent.metadata
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