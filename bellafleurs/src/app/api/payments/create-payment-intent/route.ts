// src/app/api/payments/create-payment-intent/route.ts - Solution Long Terme
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import { sendOrderConfirmation, sendNewOrderNotification } from '@/lib/email';

// POST /api/payments/create-payment-intent - Créer Payment Intent + Commande en attente
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const orderData = body;

    // Correction : Convertir la date string en Date
    if (orderData.deliveryInfo?.date && typeof orderData.deliveryInfo.date === 'string') {
      orderData.deliveryInfo.date = new Date(orderData.deliveryInfo.date);
    }

    // Validation des données de base
    if (!orderData.items || !orderData.customerInfo || !orderData.deliveryInfo) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Données de commande incomplètes',
          code: 'INCOMPLETE_ORDER_DATA'
        }
      }, { status: 400 });
    }orderData.totalAmount

    // Conversion pour Stripe (centimes)
    const amount = Math.round(orderData.totalAmount * 100);
    const currency = 'eur';
    const customerEmail = session?.user?.email || orderData.customerInfo.email;

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

    await connectDB();

    // ÉTAPE 1 : Créer la commande avec statut "pending_payment"
    const orderNumber = await Order.generateOrderNumber();
    
    const newOrder = new Order({
      orderNumber,
      user: session?.user?.id || null,
      items: orderData.items,
      customerInfo: orderData.customerInfo,
      deliveryInfo: {
        type: orderData.deliveryInfo.type,
        address: orderData.deliveryInfo.address,
        date: orderData.deliveryInfo.date,
        timeSlot: orderData.deliveryInfo.timeSlot, // ✅ AJOUTER
        notes: orderData.deliveryInfo.notes
      },
      isGift: orderData.deliveryInfo.isGift || false,           // ✅ AJOUTER
      giftInfo: orderData.deliveryInfo.giftInfo || undefined, // ✅ AJOUTER
      paymentMethod: orderData.paymentMethod,
      totalAmount: orderData.totalAmount,
      status: 'payée', // Utiliser directement 'payée' au lieu de 'pending_payment'
      paymentStatus: 'pending',
      timeline: [
        {
          status: 'payée',
          date: new Date(),
          note: 'Commande créée, en attente de confirmation du paiement'
        }
      ]
    });

    const savedOrder = await newOrder.save();

    // ÉTAPE 2 : Créer le Payment Intent avec l'ID de commande dans les métadonnées
    const metadata: Record<string, string> = {
      // NOUVEAU : ID de commande pour mise à jour directe
      order_id: savedOrder.id.toString(),
      order_number: savedOrder.orderNumber,
      
      // Informations client
      customer_name: orderData.customerInfo.name,
      customer_email: orderData.customerInfo.email,
      customer_phone: orderData.customerInfo.phone,
      
      // Informations livraison
      delivery_type: orderData.deliveryInfo.type,
      delivery_date: orderData.deliveryInfo.date instanceof Date 
        ? orderData.deliveryInfo.date.toISOString()
        : new Date(orderData.deliveryInfo.date).toISOString(),
      delivery_time_slot: orderData.deliveryInfo.timeSlot || '',
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

    // Ajouter les items avec variants
    const hasVariants = orderData.items.some((item: any) => item.variantId);
    const itemsWithVariants = orderData.items.map((item: any) => {
      let itemString = `${item.name}:${item.quantity}x${item.price}€`;
      if (item.variantId && item.variantName) {
        itemString += `[${item.variantName}]`;
      }
      return itemString;
    }).join('|');
    
    metadata.items = itemsWithVariants.substring(0, 490);

    if (hasVariants) {
      metadata.has_variants = 'true';
      const variantItems = orderData.items.filter((item: any) => item.variantId);
      metadata.variant_items_count = variantItems.length.toString();
    }

    // Créer le Payment Intent avec Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: customerEmail,
      metadata: metadata,
      description: `Commande Bella Fleurs - ${orderData.customerInfo.name} - ${savedOrder.orderNumber}`,
    });

    // ÉTAPE 3 : Mettre à jour la commande avec le Payment Intent ID
    await Order.findByIdAndUpdate(savedOrder._id, {
      stripePaymentIntentId: paymentIntent.id,
      $push: {
        timeline: {
          status: 'payée',
          date: new Date(),
          note: `Payment Intent créé: ${paymentIntent.id}`
        }
      }
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
          id: savedOrder._id,
          orderNumber: savedOrder.orderNumber
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