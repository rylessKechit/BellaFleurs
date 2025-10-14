// src/app/api/webhooks/stripe/route.ts - Version Production
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import { sendOrderConfirmation, sendNewOrderNotification } from '@/lib/email';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    // PRODUCTION : Logs de debug
    console.log('🔔 Webhook reçu en production');
    console.log('📋 Headers disponibles:', Object.fromEntries(headersList.entries()));
    console.log('🔑 Webhook secret configuré:', webhookSecret ? 'OUI' : 'NON');
    console.log('✍️ Signature présente:', signature ? 'OUI' : 'NON');

    if (!signature) {
      console.error('❌ Signature Stripe manquante');
      console.error('📋 Headers reçus:', Object.fromEntries(headersList.entries()));
      return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
    }

    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET non configuré');
      return NextResponse.json({ error: 'Webhook secret non configuré' }, { status: 500 });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('✅ Signature webhook validée');
    } catch (error: any) {
      console.error('❌ Erreur de signature webhook:', {
        message: error.message,
        type: error.type,
        webhookSecretLength: webhookSecret?.length,
        signatureLength: signature?.length
      });
      return NextResponse.json({ 
        error: `Erreur de signature: ${error.message}` 
      }, { status: 400 });
    }

    await connectDB();
    console.log(`🔔 Webhook reçu: ${event.type}`);

    try {
      if (event.type === 'payment_intent.succeeded') {
        await handlePaymentIntentSucceeded(event.data.object);
      }
      return NextResponse.json({ received: true });
    } catch (error: any) {
      console.error(`❌ Erreur traitement webhook:`, error);
      return NextResponse.json({ 
        error: 'Erreur traitement webhook',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Erreur générale webhook:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur webhook',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    console.log('✅ Paiement réussi, mise à jour de la commande...', paymentIntent.id);

    const metadata = paymentIntent.metadata;
    
    // Récupérer l'ID de commande depuis les métadonnées
    const orderId = metadata.order_id;
    
    if (!orderId) {
      console.error('❌ Order ID manquant dans les métadonnées:', metadata);
      return;
    }

    // Rechercher la commande existante
    const existingOrder = await Order.findById(orderId);
    
    if (!existingOrder) {
      console.error('❌ Commande introuvable:', orderId);
      return;
    }

    // CHANGEMENT : On enlève le return qui empêchait l'envoi des emails
    if (existingOrder.paymentStatus === 'paid') {
      console.log('⚠️ Commande déjà payée, mais on continue pour les emails:', existingOrder.orderNumber);
      // Pas de return ici !
    }

    // MISE À JOUR : Confirmer le paiement seulement si pas encore fait
    let updatedOrder;
    
    if (existingOrder.paymentStatus !== 'paid') {
      updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: 'paid',
          stripePaymentIntentId: paymentIntent.id,
          $push: {
            timeline: {
              status: 'payée',
              date: new Date(),
              note: 'Paiement confirmé via webhook Stripe'
            }
          }
        },
        { new: true }
      ).populate('items.product', 'name images');
    } else {
      // Si déjà payé, on récupère juste la commande avec populate
      updatedOrder = await Order.findById(orderId).populate('items.product', 'name images');
    }

    if (!updatedOrder) {
      console.error('❌ Erreur mise à jour commande');
      return;
    }

    console.log('✅ Commande mise à jour:', updatedOrder.orderNumber);

    // Vider le panier si l'utilisateur est connecté
    if (metadata.user_id && metadata.user_id !== 'guest') {
      try {
        await Cart.deleteOne({ user: metadata.user_id });
        console.log('🛒 Panier vidé pour l\'utilisateur:', metadata.user_id);
      } catch (error) {
        console.warn('⚠️ Erreur lors du vidage du panier:', error);
      }
    }

    // ENVOI DES EMAILS
    try {
      console.log('📧 Début envoi des emails...');

      // 1. Email de confirmation au client
      console.log('📧 Envoi email de confirmation...');
      const confirmationSent = await sendOrderConfirmation(updatedOrder);
      if (confirmationSent) {
        console.log('✅ Email de confirmation envoyé au client');
      } else {
        console.error('❌ Échec envoi email de confirmation');
      }

      // 2. Notification à l'admin
      console.log('📧 Envoi notification admin...');
      const adminNotificationSent = await sendNewOrderNotification(updatedOrder);
      if (adminNotificationSent) {
        console.log('✅ Notification admin envoyée');
      } else {
        console.error('❌ Échec notification admin');
      }

      console.log('📊 Résultat envoi emails:', {
        confirmation: confirmationSent,
        adminNotification: adminNotificationSent
      });

    } catch (emailError) {
      console.error('❌ Erreur envoi emails:', emailError);
      // Ne pas faire échouer le webhook pour autant
    }

    console.log('🎉 Traitement webhook terminé avec succès:', {
      orderNumber: updatedOrder.orderNumber,
      paymentIntentId: paymentIntent.id,
      status: updatedOrder.status
    });

  } catch (error: any) {
    console.error('❌ Erreur handlePaymentIntentSucceeded:', error);
    throw error;
  }
}