// src/app/api/corporate/invoices/[id]/payment-intent/route.ts - Récupérer le client secret pour paiement
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import CorporateInvoice from '@/models/CorporateInvoice';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Récupérer la facture (pas besoin d'auth pour payer une facture via le lien email)
    const invoice = await CorporateInvoice.findById(params.id);

    if (!invoice) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Facture introuvable',
          code: 'INVOICE_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Vérifier que la facture n'est pas déjà payée
    if (invoice.status === 'paid') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Cette facture a déjà été payée',
          code: 'ALREADY_PAID'
        }
      }, { status: 400 });
    }

    // Créer ou récupérer le Payment Intent
    let paymentIntent;

    if (invoice.stripePaymentIntentId) {
      // Récupérer le Payment Intent existant
      paymentIntent = await stripe.paymentIntents.retrieve(invoice.stripePaymentIntentId);
    } else {
      // Créer un nouveau Payment Intent
      paymentIntent = await invoice.createStripePaymentIntent();
    }

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        invoice: {
          _id: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          companyName: invoice.companyName,
          totalAmount: invoice.totalAmount,
          subtotal: invoice.subtotal,
          vatAmount: invoice.vatAmount,
          vatRate: invoice.vatRate,
          dueDate: invoice.dueDate
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Error getting payment intent:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération du paiement',
        code: 'PAYMENT_INTENT_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }, { status: 500 });
  }
}
