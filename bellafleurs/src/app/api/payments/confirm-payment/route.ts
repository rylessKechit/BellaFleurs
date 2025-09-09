// src/app/api/payments/confirm-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, handleStripeError } from '@/lib/stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import { z } from 'zod';

// Schéma de validation pour la confirmation du paiement
const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment Intent ID requis'),
  orderId: z.string().min(1, 'Order ID requis'),
  metadata: z.record(z.string()).optional()
});

// POST /api/payments/confirm-payment
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
    const validationResult = confirmPaymentSchema.safeParse(body);
    
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

    const { paymentIntentId, orderId, metadata } = validationResult.data;

    // Connecter à la base de données
    await connectDB();

    // Vérifier que la commande existe
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

    // Vérifier que l'utilisateur peut confirmer cette commande
    if (order.user?.toString() !== session.user.id) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès refusé à cette commande',
          code: 'ACCESS_DENIED'
        }
      }, { status: 403 });
    }

    // Vérifier que le Payment Intent correspond à la commande
    if (order.stripePaymentIntentId !== paymentIntentId) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Payment Intent ne correspond pas à la commande',
          code: 'PAYMENT_INTENT_MISMATCH'
        }
      }, { status: 400 });
    }

    // Récupérer le Payment Intent depuis Stripe pour vérifier son statut
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Vérifier le statut du paiement
    if (paymentIntent.status === 'succeeded') {
      // Paiement déjà confirmé avec succès
      
      // Mettre à jour la commande si ce n'est pas déjà fait
      if (order.paymentStatus !== 'paid') {
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          {
            paymentStatus: 'paid',
            status: 'confirmed',
            $push: {
              timeline: {
                status: 'confirmed',
                date: new Date(),
                note: 'Paiement confirmé avec succès'
              }
            }
          },
          { new: true }
        );

        // Vider le panier de l'utilisateur (pour les utilisateurs connectés)
        if (session.user.id) {
          try {
            await Cart.findOneAndUpdate(
              { user: session.user.id },
              { $set: { items: [], totalItems: 0, totalAmount: 0 } }
            );
          } catch (cartError) {
            console.warn('⚠️ Erreur lors du vidage du panier:', cartError);
            // Ne pas faire échouer la confirmation pour cette erreur
          }
        }

        // Log pour le debug
        console.log('✅ Paiement confirmé:', {
          paymentIntentId,
          orderId: order._id,
          orderNumber: order.orderNumber,
          amount: paymentIntent.amount
        });

        return NextResponse.json({
          success: true,
          data: {
            order: {
              id: updatedOrder?._id,
              orderNumber: updatedOrder?.orderNumber,
              status: updatedOrder?.status,
              paymentStatus: updatedOrder?.paymentStatus,
              totalAmount: updatedOrder?.totalAmount
            },
            payment: {
              id: paymentIntent.id,
              status: paymentIntent.status,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency
            },
            message: 'Paiement confirmé avec succès'
          }
        });
      } else {
        // Déjà traité
        return NextResponse.json({
          success: true,
          data: {
            order: {
              id: order._id,
              orderNumber: order.orderNumber,
              status: order.status,
              paymentStatus: order.paymentStatus,
              totalAmount: order.totalAmount
            },
            payment: {
              id: paymentIntent.id,
              status: paymentIntent.status,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency
            },
            message: 'Paiement déjà confirmé'
          }
        });
      }

    } else if (paymentIntent.status === 'requires_action') {
      // Le paiement nécessite une action supplémentaire (3D Secure, etc.)
      return NextResponse.json({
        success: false,
        error: {
          message: 'Action requise pour finaliser le paiement',
          code: 'REQUIRES_ACTION',
          data: {
            client_secret: paymentIntent.client_secret,
            next_action: paymentIntent.next_action
          }
        }
      }, { status: 402 });

    } else if (paymentIntent.status === 'processing') {
      // Paiement en cours de traitement
      return NextResponse.json({
        success: false,
        error: {
          message: 'Paiement en cours de traitement',
          code: 'PAYMENT_PROCESSING'
        }
      }, { status: 202 });

    } else if (paymentIntent.status === 'canceled') {
      // Paiement annulé
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed',
        $push: {
          timeline: {
            status: 'canceled',
            date: new Date(),
            note: 'Paiement annulé'
          }
        }
      });

      return NextResponse.json({
        success: false,
        error: {
          message: 'Paiement annulé',
          code: 'PAYMENT_CANCELED'
        }
      }, { status: 400 });

    } else {
      // Autres statuts (échec, etc.)
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed',
        $push: {
          timeline: {
            status: 'pending',
            date: new Date(),
            note: `Paiement échoué - Statut: ${paymentIntent.status}`
          }
        }
      });

      return NextResponse.json({
        success: false,
        error: {
          message: `Paiement non réussi - Statut: ${paymentIntent.status}`,
          code: 'PAYMENT_FAILED',
          details: {
            status: paymentIntent.status,
            last_payment_error: paymentIntent.last_payment_error
          }
        }
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Confirm Payment error:', error);

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
        message: 'Erreur lors de la confirmation du paiement',
        code: 'PAYMENT_CONFIRMATION_ERROR'
      }
    }, { status: 500 });
  }
}

// GET /api/payments/confirm-payment - Vérifier le statut d'un paiement
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
    const orderId = searchParams.get('order_id');

    if (!paymentIntentId || !orderId) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Payment Intent ID et Order ID requis',
          code: 'MISSING_PARAMETERS'
        }
      }, { status: 400 });
    }

    await connectDB();

    // Vérifier la commande
    const order = await Order.findById(orderId);
    if (!order || order.user?.toString() !== session.user.id) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Commande introuvable ou accès refusé',
          code: 'ORDER_ACCESS_DENIED'
        }
      }, { status: 404 });
    }

    // Récupérer le statut depuis Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return NextResponse.json({
      success: true,
      data: {
        payment: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          client_secret: paymentIntent.client_secret
        },
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Get Payment Status error:', error);

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
        message: 'Erreur lors de la vérification du paiement',
        code: 'PAYMENT_STATUS_ERROR'
      }
    }, { status: 500 });
  }
}