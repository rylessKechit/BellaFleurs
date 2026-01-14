// src/app/api/admin/invoices/[id]/route.ts - Gestion d'une facture (admin)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import CorporateInvoice from '@/models/CorporateInvoice';

// PATCH - Modifier le statut d'une facture (admin)
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

    const body = await req.json();
    const { status, paidDate, notes } = body;

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

    // Mettre à jour le statut
    if (status === 'paid') {
      invoice.markAsPaid(paidDate ? new Date(paidDate) : new Date());
    } else if (status) {
      invoice.status = status;
    }

    if (notes) {
      invoice.notes = notes;
    }

    await invoice.save();

    console.log('✅ Facture mise à jour:', {
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status
    });

    return NextResponse.json({
      success: true,
      data: { invoice },
      message: 'Facture mise à jour avec succès'
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
