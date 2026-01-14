// src/app/api/corporate/invoices/[id]/download/route.ts - Télécharger PDF facture
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import CorporateInvoice from '@/models/CorporateInvoice';
const htmlPdf = require('html-pdf-node');

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

    // Générer le HTML de la facture
    const html = generateInvoiceHTML(invoice, totals);

    // Options PDF
    const options = {
      format: 'A4',
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      printBackground: true
    };

    const file = { content: html };

    try {
      // Générer le PDF
      const pdfBuffer = await htmlPdf.generatePdf(file, options);

      // Retourner le PDF
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="facture-${invoice.invoiceNumber}.pdf"`
        }
      });
    } catch (pdfError: any) {
      console.error('❌ Erreur génération PDF:', pdfError);
      // Fallback: retourner le HTML si la génération PDF échoue
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="facture-${invoice.invoiceNumber}.html"`
        }
      });
    }

  } catch (error: any) {
    console.error('❌ Error downloading invoice:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors du téléchargement de la facture',
        code: 'INVOICE_DOWNLOAD_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }, { status: 500 });
  }
}

function generateInvoiceHTML(invoice: any, totals: any): string {
  const user = invoice.user;
  const company = user.company || {};

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 40px; color: #333; background: #f5f5f5; }
    .invoice { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 3px solid #16a34a; padding-bottom: 20px; }
    .header h1 { color: #16a34a; font-size: 32px; }
    .header .invoice-number { font-size: 14px; color: #666; }
    .company-info { text-align: right; }
    .company-info h2 { color: #16a34a; font-size: 20px; margin-bottom: 10px; }
    .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .info-box { width: 48%; }
    .info-box h3 { color: #16a34a; margin-bottom: 10px; font-size: 16px; }
    .info-box p { margin: 5px 0; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    thead { background: #16a34a; color: white; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { font-weight: bold; }
    tbody tr:hover { background: #f9f9f9; }
    .text-right { text-align: right; }
    .totals { margin-top: 20px; display: flex; justify-content: flex-end; }
    .totals-box { width: 300px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .total-row.final { border-top: 2px solid #16a34a; border-bottom: 2px solid #16a34a; font-weight: bold; font-size: 18px; margin-top: 10px; padding-top: 12px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .status-paid { background: #dcfce7; color: #166534; }
    .status-sent { background: #dbeafe; color: #1e40af; }
    .status-overdue { background: #fee2e2; color: #991b1b; }
    .status-draft { background: #f3f4f6; color: #4b5563; }
    @media print {
      body { background: white; }
      .invoice { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div>
        <h1>FACTURE</h1>
        <p class="invoice-number">N° ${invoice.invoiceNumber}</p>
        <p class="invoice-number">Date: ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
        <p class="invoice-number">Échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
        <p style="margin-top: 10px;">
          <span class="status-badge status-${invoice.status}">
            ${getStatusLabel(invoice.status)}
          </span>
        </p>
      </div>
      <div class="company-info">
        <h2>Bella Fleurs</h2>
        <p>30 Rue de la Paix</p>
        <p>91160 Longjumeau</p>
        <p>France</p>
        <p style="margin-top: 10px;">SIRET: 123 456 789 00012</p>
        <p>TVA: FR12345678900</p>
      </div>
    </div>

    <div class="info-section">
      <div class="info-box">
        <h3>Client</h3>
        <p><strong>${company.name || user.name}</strong></p>
        <p>${user.name}</p>
        <p>${user.email}</p>
        ${company.siret ? `<p>SIRET: ${company.siret}</p>` : ''}
        ${company.vatNumber ? `<p>TVA: ${company.vatNumber}</p>` : ''}
      </div>
      <div class="info-box">
        <h3>Période de facturation</h3>
        <p><strong>${new Date(invoice.period.start).toLocaleDateString('fr-FR')} - ${new Date(invoice.period.end).toLocaleDateString('fr-FR')}</strong></p>
        <p>Méthode de paiement: ${invoice.paymentTerm === 'monthly' ? 'Facturation mensuelle' : 'Paiement comptant'}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="text-right">Quantité</th>
          <th class="text-right">Prix unitaire HT</th>
          <th class="text-right">TVA</th>
          <th class="text-right">Total HT</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map((item: any) => `
          <tr>
            <td>${item.description}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">${item.unitPrice.toFixed(2)} €</td>
            <td class="text-right">${item.taxRate}%</td>
            <td class="text-right">${(item.quantity * item.unitPrice).toFixed(2)} €</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-box">
        <div class="total-row">
          <span>Total HT</span>
          <span>${totals.totalHT.toFixed(2)} €</span>
        </div>
        <div class="total-row">
          <span>TVA (${invoice.items[0]?.taxRate || 20}%)</span>
          <span>${totals.totalTVA.toFixed(2)} €</span>
        </div>
        <div class="total-row final">
          <span>Total TTC</span>
          <span>${totals.totalTTC.toFixed(2)} €</span>
        </div>
      </div>
    </div>

    ${invoice.notes ? `
      <div style="margin-top: 30px; padding: 15px; background: #f9fafb; border-left: 3px solid #16a34a;">
        <strong>Notes:</strong>
        <p style="margin-top: 5px;">${invoice.notes}</p>
      </div>
    ` : ''}

    <div class="footer">
      <p>Bella Fleurs - 30 Rue de la Paix, 91160 Longjumeau, France</p>
      <p>Email: contact@bellafleurs.fr | Téléphone: 07 80 66 27 32</p>
      <p style="margin-top: 10px;">SIRET: 123 456 789 00012 | TVA: FR12345678900</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    overdue: 'En retard',
    cancelled: 'Annulée'
  };
  return labels[status] || status;
}
