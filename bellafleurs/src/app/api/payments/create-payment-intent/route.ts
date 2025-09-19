// src/app/api/payments/create-payment-intent/route.ts - Correction date
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

// POST /api/payments/create-payment-intent - Créer un Payment Intent avec conversion date
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    console.log('🔄 Création Payment Intent...');

    const orderData = body;

    // 🔧 CORRECTION : Convertir la date string en Date
    if (orderData.deliveryInfo?.date && typeof orderData.deliveryInfo.date === 'string') {
      orderData.deliveryInfo.date = new Date(orderData.deliveryInfo.date);
    }

    console.log('Order Data reçue:', orderData);

    // Validation des données de base
    if (!orderData.items || !orderData.customerInfo || !orderData.deliveryInfo) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Données de commande incomplètes',
          code: 'INCOMPLETE_ORDER_DATA'
        }
      }, { status: 400 });
    }

    // Calculs et validation
    const calculatedTotal = orderData.items.reduce(
      (sum: number, item: any) => sum + (item.price * item.quantity), 0
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
      // 🔧 CORRECTION : S'assurer que la date est un objet Date
      delivery_date: orderData.deliveryInfo.date instanceof Date 
        ? orderData.deliveryInfo.date.toISOString()
        : new Date(orderData.deliveryInfo.date).toISOString(),
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
    const itemsWithVariants = orderData.items.map((item: any) => {
      let itemString = `${item.name}:${item.quantity}x${item.price}€`;
      
      // AJOUT : Inclure les informations de variant si présentes
      if (item.variantId && item.variantName) {
        itemString += `[${item.variantName}]`;
      }
      
      return itemString;
    }).join('|');
    
    metadata.items = itemsWithVariants.substring(0, 490);

    // NOUVEAU : Métadonnées spécifiques aux variants (si présents)
    const hasVariants = orderData.items.some((item: any) => item.variantId);
    if (hasVariants) {
      metadata.has_variants = 'true';
      
      // Compter les items avec variants
      const variantItems = orderData.items.filter((item: any) => item.variantId);
      metadata.variant_items_count = variantItems.length.toString();
      
      // Liste des variants (format condensé)
      const variantsList = variantItems
        .map((item: any) => `${item.variantId}:${item.variantName}`)
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
    const variantItems = orderData.items.filter((item: any) => item.variantId);
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
      return NextResponse.json({
        success: false,
        error: {
          message: 'Erreur de paiement Stripe',
          code: 'STRIPE_ERROR'
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