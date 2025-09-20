// src/app/api/webhooks/stripe/route.ts - Solution Long Terme
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import { sendOrderConfirmation, sendNewOrderNotification } from '@/lib/email';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('❌ Signature Stripe manquante');
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error('❌ Erreur de signature webhook:', error.message);
    return NextResponse.json({ error: `Erreur de signature: ${error.message}` }, { status: 400 });
  }

  await connectDB();
  console.log(`🔔 Webhook reçu: ${event.type}`);

  try {
    if (event.type === 'payment_intent.succeeded') {
      await handlePaymentIntentSucceeded(event.data.object);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`❌ Erreur traitement webhook:`, error);
    return NextResponse.json({ error: 'Erreur traitement webhook' }, { status: 500 });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    console.log('✅ Paiement réussi, mise à jour de la commande...', paymentIntent.id);

    const metadata = paymentIntent.metadata;
    
    // NOUVEAU : Récupérer l'ID de commande depuis les métadonnées
    const orderId = metadata.order_id;
    
    if (!orderId) {
      console.error('❌ Order ID manquant dans les métadonnées');
      return;
    }

    // Rechercher la commande existante
    const existingOrder = await Order.findById(orderId);
    
    if (!existingOrder) {
      console.error('❌ Commande introuvable:', orderId);
      return;
    }

    // Vérifier si déjà traitée
    if (existingOrder.paymentStatus === 'paid') {
      console.log('⚠️ Commande déjà payée:', existingOrder.orderNumber);
      return;
    }

    // MISE À JOUR : Confirmer le paiement seulement
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        // Pas de changement de status car déjà 'payée'
        stripePaymentIntentId: paymentIntent.id, // Sécurité
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

      // Mettre à jour la commande avec le statut d'envoi des emails
      await Order.findByIdAndUpdate(orderId, {
        emailsSent: {
          confirmation: confirmationSent,
          adminNotification: adminNotificationSent,
          sentAt: new Date()
        }
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