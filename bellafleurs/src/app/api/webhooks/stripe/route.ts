// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, handleStripeError } from '@/lib/stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';

// Configuration pour désactiver le parsing automatique du body
export const runtime = 'nodejs';

// Fonction utilitaire pour construire le raw body
async function getRawBody(req: NextRequest): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader = req.body?.getReader();
  
  if (!reader) {
    throw new Error('No request body');
  }
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  // Convertir les chunks en Buffer
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const buffer = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }
  
  return Buffer.from(buffer);
}

// POST /api/webhooks/stripe - Traiter les événements Stripe
export async function POST(req: NextRequest) {
  try {
    // Vérifier que la clé webhook est configurée
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('❌ STRIPE_WEBHOOK_SECRET non configuré');
      return NextResponse.json({
        success: false,
        error: 'Webhook secret non configuré'
      }, { status: 500 });
    }

    // Récupérer la signature Stripe
    const headersList = headers();
    const signature = headersList.get('stripe-signature');
    
    if (!signature) {
      console.error('❌ Signature Stripe manquante');
      return NextResponse.json({
        success: false,
        error: 'Signature manquante'
      }, { status: 400 });
    }

    // Récupérer le raw body
    const rawBody = await getRawBody(req);

    // Vérifier et construire l'événement Stripe
    let event: any;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('❌ Erreur signature webhook:', err.message);
      return NextResponse.json({
        success: false,
        error: `Erreur signature webhook: ${err.message}`
      }, { status: 400 });
    }

    console.log('📨 Webhook Stripe reçu:', event.type);

    // Connecter à la base de données
    await connectDB();

    // Traiter l'événement selon son type
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object);
        break;

      case 'payment_intent.requires_action':
        await handlePaymentIntentRequiresAction(event.data.object);
        break;

      case 'payment_intent.processing':
        await handlePaymentIntentProcessing(event.data.object);
        break;

      case 'charge.dispute.created':
        await handleChargeDisputeCreated(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        // Pour les paiements récurrents (si implémentés plus tard)
        console.log('💰 Paiement récurrent réussi:', event.data.object.id);
        break;

      default:
        console.log(`🔄 Événement non traité: ${event.type}`);
    }

    // Répondre à Stripe que l'événement a été traité
    return NextResponse.json({
      success: true,
      message: 'Webhook traité avec succès',
      eventType: event.type
    });

  } catch (error: any) {
    console.error('❌ Erreur webhook Stripe:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors du traitement du webhook'
    }, { status: 500 });
  }
}

// Gestionnaire pour payment_intent.succeeded
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      console.warn('⚠️ OrderId manquant dans les métadonnées du Payment Intent');
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      console.warn(`⚠️ Commande ${orderId} introuvable`);
      return;
    }

    // Mettre à jour la commande seulement si elle n'est pas déjà payée
    if (order.paymentStatus !== 'paid') {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: 'paid',
          status: 'payée', // ← NOUVEAU: Statut initial après paiement
          stripePaymentIntentId: paymentIntent.id,
          $push: {
            timeline: {
              status: 'payée',
              date: new Date(),
              note: 'Commande payée - En attente de création'
            }
          }
        },
        { new: true }
      );

      // Vider le panier de l'utilisateur si possible
      if (order.user) {
        try {
          await Cart.findOneAndUpdate(
            { user: order.user },
            { $set: { items: [], totalItems: 0, totalAmount: 0 } }
          );
        } catch (cartError) {
          console.warn('⚠️ Erreur lors du vidage du panier:', cartError);
        }
      }

      console.log('✅ Paiement confirmé via webhook:', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: paymentIntent.amount_received / 100
      });

      // TODO: Envoyer email de confirmation
      // await sendOrderConfirmationEmail(updatedOrder);
    }

  } catch (error) {
    console.error('❌ Erreur handlePaymentIntentSucceeded:', error);
    throw error;
  }
}

// Gestionnaire pour payment_intent.payment_failed
async function handlePaymentIntentFailed(paymentIntent: any) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      console.warn('⚠️ OrderId manquant dans les métadonnées du Payment Intent');
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      console.warn(`⚠️ Commande ${orderId} introuvable`);
      return;
    }

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'failed',
      $push: {
        timeline: {
          status: 'payée',
          date: new Date(),
          note: `Paiement échoué - ${paymentIntent.last_payment_error?.message || 'Erreur inconnue'}`
        }
      }
    });

    console.log('❌ Paiement échoué via webhook:', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      error: paymentIntent.last_payment_error?.message
    });

    // TODO: Envoyer email d'échec de paiement
    // await sendPaymentFailedEmail(order, paymentIntent.last_payment_error);

  } catch (error) {
    console.error('❌ Erreur handlePaymentIntentFailed:', error);
    throw error;
  }
}

// Gestionnaire pour payment_intent.canceled
async function handlePaymentIntentCanceled(paymentIntent: any) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      console.warn('⚠️ OrderId manquant dans les métadonnées du Payment Intent');
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      console.warn(`⚠️ Commande ${orderId} introuvable`);
      return;
    }

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'failed',
      status: 'cancelled',
      $push: {
        timeline: {
          status: 'cancelled',
          date: new Date(),
          note: 'Paiement annulé'
        }
      }
    });

    console.log('🚫 Paiement annulé via webhook:', {
      orderId: order._id,
      orderNumber: order.orderNumber
    });

  } catch (error) {
    console.error('❌ Erreur handlePaymentIntentCanceled:', error);
    throw error;
  }
}

// Gestionnaire pour payment_intent.requires_action
async function handlePaymentIntentRequiresAction(paymentIntent: any) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      console.warn('⚠️ OrderId manquant dans les métadonnées du Payment Intent');
      return;
    }

    await Order.findByIdAndUpdate(orderId, {
      $push: {
        timeline: {
          status: 'payée',
          date: new Date(),
          note: 'Action requise pour le paiement (3D Secure, etc.)'
        }
      }
    });

    console.log('⏳ Action requise pour le paiement:', {
      orderId,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('❌ Erreur handlePaymentIntentRequiresAction:', error);
    throw error;
  }
}

// Gestionnaire pour payment_intent.processing
async function handlePaymentIntentProcessing(paymentIntent: any) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      console.warn('⚠️ OrderId manquant dans les métadonnées du Payment Intent');
      return;
    }

    await Order.findByIdAndUpdate(orderId, {
      $push: {
        timeline: {
          status: 'payée',
          date: new Date(),
          note: 'Paiement en cours de traitement'
        }
      }
    });

    console.log('🔄 Paiement en cours de traitement:', {
      orderId,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('❌ Erreur handlePaymentIntentProcessing:', error);
    throw error;
  }
}

// Gestionnaire pour charge.dispute.created (litige/chargeback)
async function handleChargeDisputeCreated(dispute: any) {
  try {
    console.log('⚠️ Litige créé:', {
      disputeId: dispute.id,
      chargeId: dispute.charge,
      amount: dispute.amount / 100,
      reason: dispute.reason
    });

    // TODO: Notifier les administrateurs
    // TODO: Mettre à jour la commande concernée si possible
    // await notifyAdminsOfDispute(dispute);

  } catch (error) {
    console.error('❌ Erreur handleChargeDisputeCreated:', error);
    throw error;
  }
}

// GET /api/webhooks/stripe - Endpoint de test (à supprimer en production)
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Webhook Stripe endpoint actif',
    timestamp: new Date().toISOString()
  });
}