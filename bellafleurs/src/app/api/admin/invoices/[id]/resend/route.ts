// src/app/api/admin/invoices/[id]/resend/route.ts - Renvoyer une facture par email (admin)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import CorporateInvoice from '@/models/CorporateInvoice';
import User from '@/models/User';
import { sendMonthlyInvoiceEmail } from '@/lib/email/corporate';

// POST - Renvoyer une facture par email
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Vérifier que l'utilisateur est admin
    const user = session.user as any;
    if (user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès réservé aux administrateurs',
          code: 'FORBIDDEN'
        }
      }, { status: 403 });
    }

    await connectDB();

    // Récupérer la facture
    const invoice = await CorporateInvoice.findById(params.id).lean();

    if (!invoice) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Facture introuvable',
          code: 'INVOICE_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Récupérer l'utilisateur corporate
    const corporateUser = await User.findById(invoice.corporateUser);

    if (!corporateUser) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Utilisateur corporate introuvable',
          code: 'USER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Envoyer l'email
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    await sendMonthlyInvoiceEmail({
      email: corporateUser.email,
      companyName: corporateUser.company?.name || 'Entreprise',
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.totalAmount,
      dueDate: invoice.dueDate || new Date(),
      month: monthNames[invoice.billingPeriod.month - 1],
      year: invoice.billingPeriod.year,
      invoiceUrl: `${process.env.NEXTAUTH_URL}/corporate/invoices/${invoice._id}`
    });

    console.log('✅ Facture renvoyée:', {
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      email: corporateUser.email
    });

    return NextResponse.json({
      success: true,
      message: 'Facture renvoyée avec succès'
    });

  } catch (error: any) {
    console.error('❌ Error resending invoice:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de l\'envoi de la facture',
        code: 'INVOICE_RESEND_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }, { status: 500 });
  }
}
