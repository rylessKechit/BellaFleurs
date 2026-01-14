// src/app/api/admin/invoices/generate/route.ts - Génération manuelle des factures mensuelles (admin)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import CorporateInvoice from '@/models/CorporateInvoice';
import { sendMonthlyInvoiceEmail } from '@/lib/email/corporate';

// POST - Générer les factures mensuelles pour tous les comptes corporate
export async function POST(req: NextRequest) {
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
    const { year, month, userId } = body; // Optionnel: générer pour un utilisateur spécifique

    // Déterminer la période
    const targetDate = new Date(year || new Date().getFullYear(), (month !== undefined ? month : new Date().getMonth()) - 1, 1);
    const periodStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const periodEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);

    console.log('📅 Génération des factures pour la période:', {
      start: periodStart.toISOString(),
      end: periodEnd.toISOString()
    });

    // Récupérer les comptes corporate actifs
    const query: any = {
      accountType: 'corporate',
      'corporateSettings.activatedAt': { $exists: true }
    };

    if (userId) {
      query._id = userId;
    }

    const corporateUsers = await User.find(query);

    console.log(`👥 Génération pour ${corporateUsers.length} comptes corporate`);

    const results = {
      success: [] as any[],
      skipped: [] as any[],
      errors: [] as any[]
    };

    // Générer une facture pour chaque compte
    for (const corporateUser of corporateUsers) {
      try {
        // Vérifier si une facture existe déjà pour cette période
        const existingInvoice = await CorporateInvoice.findOne({
          user: corporateUser._id,
          'period.start': periodStart,
          'period.end': periodEnd
        });

        if (existingInvoice) {
          console.log(`⏭️ Facture déjà existante pour ${corporateUser.email}`);
          results.skipped.push({
            userId: corporateUser._id,
            email: corporateUser.email,
            reason: 'Facture déjà existante',
            invoiceId: existingInvoice._id
          });
          continue;
        }

        // Créer la facture mensuelle
        const invoice = await CorporateInvoice.createMonthlyInvoice(
          corporateUser._id.toString(),
          month,
          year
        );

        if (!invoice) {
          console.log(`⏭️ Aucune commande pour ${corporateUser.email}`);
          results.skipped.push({
            userId: corporateUser._id,
            email: corporateUser.email,
            reason: 'Aucune commande pour cette période'
          });
          continue;
        }

        // Envoyer l'email de facture
        try {
          const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                              'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

          await sendMonthlyInvoiceEmail({
            email: corporateUser.email,
            companyName: corporateUser.company?.name || 'Entreprise',
            invoiceNumber: invoice.invoiceNumber,
            totalAmount: invoice.totalAmount,
            dueDate: invoice.dueDate || new Date(),
            month: monthNames[month - 1],
            year: year,
            invoiceUrl: `${process.env.NEXTAUTH_URL}/corporate/invoices/${invoice._id}`
          });
          console.log(`✅ Facture créée et envoyée pour ${corporateUser.email}`);
        } catch (emailError) {
          console.error(`⚠️ Erreur envoi email pour ${corporateUser.email}:`, emailError);
        }

        results.success.push({
          userId: corporateUser._id,
          email: corporateUser.email,
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          total: invoice.totalAmount
        });

      } catch (error: any) {
        console.error(`❌ Erreur pour ${corporateUser.email}:`, error);
        results.errors.push({
          userId: corporateUser._id,
          email: corporateUser.email,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        period: {
          start: periodStart,
          end: periodEnd
        },
        results: {
          total: corporateUsers.length,
          success: results.success.length,
          skipped: results.skipped.length,
          errors: results.errors.length
        },
        details: results
      },
      message: `Génération terminée: ${results.success.length} factures créées, ${results.skipped.length} ignorées, ${results.errors.length} erreurs`
    });

  } catch (error: any) {
    console.error('❌ Error generating invoices:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la génération des factures',
        code: 'INVOICE_GENERATION_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }, { status: 500 });
  }
}
