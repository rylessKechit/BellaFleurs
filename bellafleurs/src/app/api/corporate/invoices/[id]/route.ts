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

    // Vérifier que c'est un compte corporate
    const user = session.user as any;
    if (user.accountType !== 'corporate') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès réservé aux comptes corporate',
          code: 'FORBIDDEN'
        }
      }, { status: 403 });
    }

    await connectDB();

    // Récupérer la facture
    const invoice = await CorporateInvoice.findById(params.id)
      .populate('user', 'name email company')
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

    // Vérifier que l'utilisateur a accès à cette facture
    if (invoice.user._id.toString() !== session.user.id) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès non autorisé à cette facture',
          code: 'UNAUTHORIZED_ACCESS'
        }
      }, { status: 403 });
    }

    // Calculer les totaux
    const doc = new CorporateInvoice(invoice);
    const totals = doc.calculateTotal();

    return NextResponse.json({
      success: true,
      data: {
        invoice: {
          ...invoice,
          totalHT: totals.totalHT,
          totalTVA: totals.totalTVA,
          totalTTC: totals.totalTTC
        }
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
