// src/app/api/webhooks/stripe/route.ts - Version Production
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import CorporateInvoice from '@/models/CorporateInvoice';
import { sendOrderConfirmation, sendNewOrderNotification } from '@/lib/email';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    console.log('🎯 WEBHOOK STRIPE REÇU !');

    const body = await req.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    console.log('📨 Body length:', body.length);
    console.log('🔑 Signature présente:', !!signature);

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
      console.log('✅ Event Stripe validé:', event.type);
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

    try {
      console.log('🔍 Type d\'événement reçu:', event.type);

      if (event.type === 'payment_intent.succeeded') {
        console.log('💳 Traitement payment_intent.succeeded...');
        await handlePaymentIntentSucceeded(event.data.object);
        console.log('✅ payment_intent.succeeded traité avec succès');
      } else {
        console.log('ℹ️ Type d\'événement ignoré:', event.type);
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
    console.log('🔍 PaymentIntent reçu:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      metadata: paymentIntent.metadata
    });

    const metadata = paymentIntent.metadata;

    // 🆕 Vérifier si c'est un paiement de facture corporate
    if (metadata.invoiceId) {
      console.log('📄 Traitement paiement de facture corporate:', metadata.invoiceId);

      const invoice = await CorporateInvoice.findById(metadata.invoiceId);

      if (!invoice) {
        console.error('❌ Facture corporate introuvable:', metadata.invoiceId);
        return;
      }

      // Vérifier si déjà payée
      if (invoice.status === 'paid') {
        console.log('ℹ️ Facture déjà marquée comme payée, webhook déjà traité - skip');
        return;
      }

      // Marquer la facture comme payée
      await invoice.markAsPaid();

      console.log('✅ Facture corporate marquée comme payée:', {
        invoiceNumber: invoice.invoiceNumber,
        companyName: invoice.companyName,
        amount: invoice.totalAmount
      });

      return;
    }

    // 📦 Sinon, c'est un paiement de commande normale
    const orderId = metadata.order_id;

    if (!orderId) {
      console.error('❌ Order ID ou Invoice ID manquant dans les métadonnées:', metadata);
      return;
    }

    console.log('🔍 Recherche de la commande:', orderId);

    // Rechercher la commande existante
    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
      console.error('❌ Commande introuvable:', orderId);
      return;
    }

    console.log('✅ Commande trouvée:', {
      orderNumber: existingOrder.orderNumber,
      paymentStatus: existingOrder.paymentStatus
    });

    // ✅ CORRECTION : Vérifier si déjà traité pour éviter les doublons d'emails
    if (existingOrder.paymentStatus === 'paid') {
      console.log('ℹ️ Commande déjà marquée comme payée, webhook déjà traité - skip');
      return;
    }

    // MISE À JOUR : Confirmer le paiement
    const updatedOrder = await Order.findByIdAndUpdate(
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

    if (!updatedOrder) {
      console.error('❌ Erreur mise à jour commande');
      return;
    }

    // Vider le panier si l'utilisateur est connecté
    if (metadata.user_id && metadata.user_id !== 'guest') {
      try {
        await Cart.deleteOne({ user: metadata.user_id });
      } catch (error) {
        console.warn('⚠️ Erreur lors du vidage du panier:', error);
      }
    }

    // ENVOI DES EMAILS
    try {
      console.log('📧 Préparation envoi des emails...');

      // 1. Email de confirmation au client
      console.log('📧 Envoi email de confirmation client à:', updatedOrder.customerInfo.email);
      const confirmationSent = await sendOrderConfirmation(updatedOrder);
      if (confirmationSent) {
        console.log('✅ Email de confirmation client envoyé avec succès');
      } else {
        console.error('❌ Échec envoi email de confirmation');
      }

      // 2. Notification à l'admin
      console.log('📧 Envoi notification admin...');
      const adminNotificationSent = await sendNewOrderNotification(updatedOrder);
      if (adminNotificationSent) {
        console.log('✅ Notification admin envoyée avec succès');
      } else {
        console.error('❌ Échec notification admin');
      }

    } catch (emailError) {
      console.error('❌ Erreur envoi emails:', emailError);
      // Ne pas faire échouer le webhook pour autant
    }

  } catch (error: any) {
    console.error('❌ Erreur handlePaymentIntentSucceeded:', error);
    throw error;
  }
}