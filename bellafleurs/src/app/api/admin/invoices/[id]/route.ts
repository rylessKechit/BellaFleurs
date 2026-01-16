// src/app/api/admin/invoices/[id]/route.ts - API pour marquer une facture comme payée
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import CorporateInvoice from '@/models/CorporateInvoice';

export async function PATCH(
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

    // Vérifier que c'est un admin
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

    // Récupérer les données de la requête
    const body = await req.json();
    const { status, paidDate } = body;

    // Récupérer la facture
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

    // Marquer comme payée
    if (status === 'paid') {
      await invoice.markAsPaid();
      console.log('✅ Facture marquée comme payée manuellement par admin:', {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber
      });
    }

    return NextResponse.json({
      success: true,
      data: invoice
    });

  } catch (error: any) {
    console.error('❌ Error updating invoice:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour de la facture',
        code: 'INVOICE_UPDATE_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }, { status: 500 });
  }
}
