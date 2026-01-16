// src/app/api/corporate/invoices/[id]/route.ts - Détail d'une facture corporate
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import CorporateInvoice from '@/models/CorporateInvoice';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Récupérer la facture (pas besoin d'auth pour consulter une facture via le lien)
    const invoice = await CorporateInvoice.findById(params.id)
      .populate('corporateUser', 'name email company')
      .lean();

    if (!invoice) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Facture introuvable',
          code: 'INVOICE_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Les totaux sont déjà calculés dans le modèle
    return NextResponse.json({
      success: true,
      data: {
        ...invoice,
        subtotal: invoice.subtotal,
        vatAmount: invoice.vatAmount,
        totalAmount: invoice.totalAmount
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching invoice:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération de la facture',
        code: 'INVOICE_FETCH_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }, { status: 500 });
  }
}
