// src/app/api/corporate/invoices/route.ts - Liste des factures corporate
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import CorporateInvoice from '@/models/CorporateInvoice';

// GET /api/corporate/invoices - Liste des factures de l'utilisateur corporate
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // draft, sent, paid, overdue, cancelled
    const year = searchParams.get('year');

    // Construction de la query
    const query: any = { user: session.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
      query.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const skip = (page - 1) * limit;

    // Récupération des factures
    const [invoices, total] = await Promise.all([
      CorporateInvoice.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CorporateInvoice.countDocuments(query)
    ]);

    // Calcul des totaux avec la méthode calculateTotal
    const invoicesWithTotals = invoices.map(invoice => {
      const doc = new CorporateInvoice(invoice);
      return {
        ...invoice,
        totalHT: doc.calculateTotal().totalHT,
        totalTTC: doc.calculateTotal().totalTTC
      };
    });

    // Statistiques
    const allInvoices = await CorporateInvoice.find({ user: session.user.id }).lean();
    const stats = {
      total: allInvoices.length,
      draft: allInvoices.filter(i => i.status === 'draft').length,
      sent: allInvoices.filter(i => i.status === 'sent').length,
      paid: allInvoices.filter(i => i.status === 'paid').length,
      overdue: allInvoices.filter(i => i.status === 'overdue').length,
      totalAmount: allInvoices.reduce((sum, inv) => {
        const doc = new CorporateInvoice(inv);
        return sum + doc.calculateTotal().totalTTC;
      }, 0),
      totalPaid: allInvoices
        .filter(i => i.status === 'paid')
        .reduce((sum, inv) => {
          const doc = new CorporateInvoice(inv);
          return sum + doc.calculateTotal().totalTTC;
        }, 0),
      totalPending: allInvoices
        .filter(i => ['sent', 'overdue'].includes(i.status))
        .reduce((sum, inv) => {
          const doc = new CorporateInvoice(inv);
          return sum + doc.calculateTotal().totalTTC;
        }, 0)
    };

    return NextResponse.json({
      success: true,
      data: {
        invoices: invoicesWithTotals,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching corporate invoices:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des factures',
        code: 'INVOICES_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}
