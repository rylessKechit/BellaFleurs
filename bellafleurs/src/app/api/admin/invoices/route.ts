// src/app/api/admin/invoices/route.ts - Gestion des factures (admin)
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import CorporateInvoice from '@/models/CorporateInvoice';

// GET - Liste de toutes les factures (admin)
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    // Construction de la query
    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (userId) {
      query.user = userId;
    }

    const skip = (page - 1) * limit;

    // Récupération des factures
    const [invoices, total] = await Promise.all([
      CorporateInvoice.find(query)
        .populate('user', 'name email company')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CorporateInvoice.countDocuments(query)
    ]);

    // Calcul des totaux
    const invoicesWithTotals = invoices.map(invoice => {
      const doc = new CorporateInvoice(invoice);
      return {
        ...invoice,
        totalHT: doc.calculateTotal().totalHT,
        totalTTC: doc.calculateTotal().totalTTC
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        invoices: invoicesWithTotals,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching invoices:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des factures',
        code: 'INVOICES_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}
