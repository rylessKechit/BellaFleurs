// src/lib/email/corporate.ts - Emails pour comptes B2B
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
const htmlPdf = require('html-pdf-node');

// ✅ CORRECTION : Utiliser la même configuration Gmail que le fichier email.ts principal
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_CLIENT_USER,
    pass: process.env.EMAIL_CLIENT_PASS,
  },
});

export interface CorporateInvitationEmailData {
  email: string;
  name: string;
  companyName: string;
  activationToken: string;
  adminName: string;
}

export async function sendCorporateInvitationEmail(data: CorporateInvitationEmailData) {
  const { email, name, companyName, activationToken, adminName } = data;

  const activationUrl = `${process.env.NEXTAUTH_URL}/corporate/activate?token=${activationToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invitation Bella Fleurs Corporate</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px 20px; border: 1px solid #e5e5e5; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        .btn { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .company-info { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .highlight { color: #059669; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌸 Bella Fleurs Corporate</h1>
          <p>Bienvenue dans notre programme entreprise</p>
        </div>

        <div class="content">
          <h2>Bonjour ${name},</h2>

          <p>${adminName} de Bella Fleurs vous a créé un compte corporate pour <span class="highlight">${companyName}</span>.</p>

          <div class="company-info">
            <h3>Avantages de votre compte corporate :</h3>
            <ul>
              <li>🧾 <strong>Facturation mensuelle</strong> - Toutes vos commandes regroupées</li>
              <li>📊 <strong>Suivi détaillé</strong> - Dashboard dédié à votre entreprise</li>
              <li>💰 <strong>Budget mensuel</strong> - Contrôle et limites personnalisées</li>
              <li>📈 <strong>Rapports détaillés</strong> - Historique et statistiques</li>
              <li>🎯 <strong>Tarifs préférentiels</strong> - Conditions avantageuses</li>
            </ul>
          </div>

          <p>Pour activer votre compte et définir votre mot de passe, cliquez sur le bouton ci-dessous :</p>

          <div style="text-align: center;">
            <a href="${activationUrl}" class="btn">Activer mon compte corporate</a>
          </div>

          <p><small>Ce lien d'activation est valide pendant 7 jours.</small></p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

          <p>Si vous avez des questions, n'hésitez pas à nous contacter :</p>
          <ul>
            <li>📧 Email : contact@bella-fleurs.fr</li>
            <li>📞 Téléphone : 01 60 84 75 68</li>
            <li>🌐 Site web : <a href="${process.env.NEXTAUTH_URL}">bella-fleurs.fr</a></li>
          </ul>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} Bella Fleurs - Fleuriste à Brétigny-sur-Orge</p>
          <p>Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Bella Fleurs Corporate - Activation de votre compte

    Bonjour ${name},

    ${adminName} de Bella Fleurs vous a créé un compte corporate pour ${companyName}.

    Avantages de votre compte corporate :
    • Facturation mensuelle - Toutes vos commandes regroupées
    • Suivi détaillé - Dashboard dédié à votre entreprise
    • Budget mensuel - Contrôle et limites personnalisées
    • Rapports détaillés - Historique et statistiques
    • Tarifs préférentiels - Conditions avantageuses

    Pour activer votre compte, visitez : ${activationUrl}

    Ce lien d'activation est valide pendant 7 jours.

    Questions ? Contactez-nous :
    Email : contact@bella-fleurs.fr
    Téléphone : 01 60 84 75 68
    Site web : ${process.env.NEXTAUTH_URL}

    © ${new Date().getFullYear()} Bella Fleurs - Fleuriste à Brétigny-sur-Orge
  `;

  const mailOptions = {
    from: `"Bella Fleurs Corporate" <${process.env.EMAIL_CLIENT_USER}>`,
    to: email,
    subject: `🌸 Activation de votre compte Bella Fleurs Corporate - ${companyName}`,
    text: textContent,
    html: htmlContent,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email corporate invitation envoyé:', email);
    return result;
  } catch (error) {
    console.error('❌ Erreur envoi email corporate invitation:', error);
    throw error;
  }
}

export interface MonthlyInvoiceEmailData {
  email: string;
  companyName: string;
  invoiceNumber: string;
  totalAmount: number;
  dueDate: Date;
  month: string;
  year: number;
  invoiceUrl: string;
  invoiceId: string; // ID pour récupérer la facture complète
  paymentUrl?: string; // URL pour payer la facture via Stripe
}

export async function sendMonthlyInvoiceEmail(data: MonthlyInvoiceEmailData) {
  const { email, companyName, invoiceNumber, totalAmount, dueDate, month, year, invoiceId, paymentUrl } = data;

  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(totalAmount);

  const formattedDueDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dueDate);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Facture Mensuelle Bella Fleurs</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px 20px; border: 1px solid #e5e5e5; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        .invoice-summary { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981; }
        .amount { font-size: 24px; font-weight: bold; color: #059669; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🧾 Facture Mensuelle</h1>
          <p>Bella Fleurs Corporate</p>
        </div>

        <div class="content">
          <h2>Facture ${invoiceNumber}</h2>

          <p>Bonjour,</p>

          <p>Votre facture mensuelle pour <strong>${companyName}</strong> est maintenant disponible en pièce jointe.</p>

          <div class="invoice-summary">
            <h3>Résumé de la facture :</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Période :</strong> ${month} ${year}</li>
              <li><strong>Montant total :</strong> <span class="amount">${formattedAmount}</span></li>
              <li><strong>À régler avant le :</strong> ${formattedDueDate}</li>
            </ul>
          </div>

          <p>📎 Vous trouverez votre facture détaillée en pièce jointe (format PDF).</p>

          ${paymentUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${paymentUrl}" style="display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                💳 Payer la facture
              </a>
              <p style="margin-top: 10px; font-size: 14px; color: #666;">Paiement sécurisé par Stripe</p>
            </div>
          ` : ''}

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

          <p>Questions sur votre facture ? Contactez-nous :</p>
          <ul>
            <li>📧 Email : comptabilite@bella-fleurs.fr</li>
            <li>📞 Téléphone : 01 60 84 75 68</li>
          </ul>

          ${paymentUrl ?
            '<p><small>Vous pouvez régler cette facture en cliquant sur le bouton ci-dessus ou depuis votre espace corporate.</small></p>' :
            '<p><small>Le paiement sera automatiquement prélevé selon vos conditions contractuelles.</small></p>'
          }
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} Bella Fleurs - Fleuriste à Brétigny-sur-Orge</p>
          <p>SIRET : 123 456 789 00012 - TVA : FR12345678901</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    // Charger la facture complète depuis la DB
    const CorporateInvoice = mongoose.model('CorporateInvoice');
    const User = mongoose.model('User');

    const invoice = await CorporateInvoice.findById(invoiceId)
      .populate('corporateUser', 'name email company')
      .lean();

    if (!invoice) {
      throw new Error(`Facture ${invoiceId} introuvable`);
    }

    // Générer le HTML de la facture pour le PDF
    const invoiceHTML = generateInvoicePDFHTML(invoice);

    // Générer le PDF
    const options = {
      format: 'A4',
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      printBackground: true
    };

    const file = { content: invoiceHTML };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);

    // Envoyer l'email avec le PDF en pièce jointe
    const mailOptions = {
      from: `"Bella Fleurs Comptabilité" <${process.env.EMAIL_CLIENT_USER}>`,
      to: email,
      subject: `🧾 Facture ${invoiceNumber} - ${companyName} - ${month} ${year}`,
      html: htmlContent,
      attachments: [
        {
          filename: `Facture-${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email facture mensuelle envoyé avec PDF:', email);
    return result;
  } catch (error) {
    console.error('❌ Erreur envoi email facture:', error);
    throw error;
  }
}

// Fonction pour générer le HTML de la facture pour PDF
function generateInvoicePDFHTML(invoice: any): string {
  const user = invoice.corporateUser;
  const company = user?.company || {};

  const items = invoice.items || [];
  const subtotal = invoice.subtotal || 0;
  const vatAmount = invoice.vatAmount || 0;
  const totalAmount = invoice.totalAmount || 0;
  const vatRate = invoice.vatRate || 20;

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      sent: 'Envoyée',
      paid: 'Payée',
      overdue: 'En retard',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  };

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
    .company-info h2 { color: #16a34a; font-size: 20px; margin-bottom: 10px; display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
    .logo { width: 40px; height: 40px; }
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
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div>
        <h1>FACTURE</h1>
        <p class="invoice-number">N° ${invoice.invoiceNumber}</p>
        <p class="invoice-number">Date: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</p>
        <p class="invoice-number">Échéance: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-FR') : 'N/A'}</p>
        <p style="margin-top: 10px;">
          <span class="status-badge status-${invoice.status}">
            ${getStatusLabel(invoice.status)}
          </span>
        </p>
      </div>
      <div class="company-info">
        <h2>
          <svg class="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="#16a34a" opacity="0.1"/>
            <path d="M50 20 L60 35 L75 35 L62 45 L67 60 L50 50 L33 60 L38 45 L25 35 L40 35 Z" fill="#16a34a"/>
            <circle cx="50" cy="50" r="8" fill="#fbbf24"/>
            <path d="M50 58 Q45 65, 45 75" stroke="#16a34a" stroke-width="2" fill="none"/>
            <path d="M50 58 Q55 65, 55 75" stroke="#16a34a" stroke-width="2" fill="none"/>
          </svg>
          Bella Fleurs
        </h2>
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
        <p><strong>${company.name || user?.name || 'N/A'}</strong></p>
        <p>${user?.name || 'N/A'}</p>
        <p>${user?.email || 'N/A'}</p>
        ${company.siret ? `<p>SIRET: ${company.siret}</p>` : ''}
        ${company.vatNumber ? `<p>TVA: ${company.vatNumber}</p>` : ''}
      </div>
      <div class="info-box">
        <h3>Période de facturation</h3>
        <p><strong>${new Date(invoice.billingPeriod.startDate).toLocaleDateString('fr-FR')} - ${new Date(invoice.billingPeriod.endDate).toLocaleDateString('fr-FR')}</strong></p>
        <p>Mois: ${invoice.billingPeriod.month}/${invoice.billingPeriod.year}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>N° Commande</th>
          <th>Date</th>
          <th>Description</th>
          <th class="text-right">Montant HT</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item: any) => `
          <tr>
            <td>${item.orderNumber}</td>
            <td>${new Date(item.orderDate).toLocaleDateString('fr-FR')}</td>
            <td>${item.description}</td>
            <td class="text-right">${item.amount.toFixed(2)} €</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-box">
        <div class="total-row">
          <span>Total HT</span>
          <span>${subtotal.toFixed(2)} €</span>
        </div>
        <div class="total-row">
          <span>TVA (${vatRate}%)</span>
          <span>${vatAmount.toFixed(2)} €</span>
        </div>
        <div class="total-row final">
          <span>Total TTC</span>
          <span>${totalAmount.toFixed(2)} €</span>
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

// ✨ NOUVEAU : Email de confirmation de commande corporate
export async function sendCorporateOrderConfirmation(order: any): Promise<boolean> {
  try {
    const textContent = `
Bonjour ${order.customerInfo.name},

Votre commande corporate a été confirmée avec succès !

Détails de la commande :
- Numéro : ${order.orderNumber}
- Entreprise : ${order.corporateData?.companyName || order.customerInfo.company}
- Montant : ${order.totalAmount.toFixed(2)} €
- Date de livraison : ${new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')}
- Adresse : ${order.deliveryInfo.address.street}, ${order.deliveryInfo.address.zipCode} ${order.deliveryInfo.address.city}

Cette commande sera incluse dans votre facture mensuelle selon vos conditions de paiement corporate.

Cordialement,
L'équipe Bella Fleurs
`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Commande Corporate Confirmée - ${order.orderNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .corporate-badge { background: #dbeafe; color: #1d4ed8; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin-bottom: 20px; }
        .order-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .billing-info { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; border-radius: 0 0 8px 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌸 Bella Fleurs</h1>
            <h2>Commande Corporate Confirmée</h2>
        </div>

        <div class="content">
            <div class="corporate-badge">🏢 Compte Corporate</div>

            <p>Bonjour <strong>${order.customerInfo.name}</strong>,</p>

            <p>Votre commande corporate a été confirmée avec succès pour <strong>${order.corporateData?.companyName || order.customerInfo.company}</strong> !</p>

            <div class="order-details">
                <h3>📋 Détails de la commande</h3>
                <div class="detail-row">
                    <span>Numéro de commande :</span>
                    <strong>${order.orderNumber}</strong>
                </div>
                <div class="detail-row">
                    <span>Entreprise :</span>
                    <strong>${order.corporateData?.companyName || order.customerInfo.company}</strong>
                </div>
                <div class="detail-row">
                    <span>Montant total :</span>
                    <strong>${order.totalAmount.toFixed(2)} €</strong>
                </div>
                <div class="detail-row">
                    <span>Date de livraison :</span>
                    <strong>${new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')}</strong>
                </div>
                <div class="detail-row">
                    <span>Créneau :</span>
                    <strong>${order.deliveryInfo.timeSlot}</strong>
                </div>
            </div>

            <div class="order-details">
                <h3>📍 Adresse de livraison</h3>
                <p>
                    ${order.deliveryInfo.address.street}<br>
                    ${order.deliveryInfo.address.zipCode} ${order.deliveryInfo.address.city}<br>
                    ${order.deliveryInfo.address.country}
                </p>
                ${order.deliveryInfo.notes ? `<p><strong>Instructions :</strong> ${order.deliveryInfo.notes}</p>` : ''}
            </div>

            <div class="billing-info">
                <h3>💳 Facturation Corporate</h3>
                <p>
                    <strong>Cette commande sera incluse dans votre facture mensuelle</strong> selon vos conditions de paiement corporate.
                    Vous recevrez votre facture détaillée en fin de mois.
                </p>
                <p>Mode de paiement : <strong>${order.corporateData?.paymentTerm === 'monthly' ? 'Facturation mensuelle' : 'Paiement immédiat'}</strong></p>
            </div>

            <p>Vous pouvez suivre l'avancement de votre commande dans votre <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/corporate/dashboard">dashboard corporate</a>.</p>

            <p>Cordialement,<br><strong>L'équipe Bella Fleurs</strong></p>
        </div>

        <div class="footer">
            <p>Bella Fleurs | contact@bellafleurs.fr | 01 23 45 67 89</p>
            <p>Spécialiste en compositions florales à Brétigny-sur-Orge</p>
        </div>
    </div>
</body>
</html>`;

    const mailOptions = {
      from: `"Bella Fleurs" <${process.env.EMAIL_CLIENT_USER}>`,
      to: order.customerInfo.email,
      subject: `🌸 Commande Corporate Confirmée - ${order.orderNumber}`,
      text: textContent,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email confirmation commande corporate envoyé:', order.customerInfo.email);
    return true;

  } catch (error) {
    console.error('❌ Erreur envoi confirmation commande corporate:', error);
    return false;
  }
}

// ✨ NOUVEAU : Notification admin pour nouvelle commande corporate
export async function sendCorporateOrderNotification(order: any): Promise<boolean> {
  try {
    // ✅ CORRECTION : Utiliser l'email admin depuis les variables d'environnement
    const adminEmail = process.env.EMAIL_ADMIN_USER || process.env.EMAIL_CLIENT_USER || 'bellafleurs30@gmail.com';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Nouvelle Commande Corporate - ${order.orderNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1d4ed8; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-top: none; }
        .corporate-info { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .order-details { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { background: #f3f4f6; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏢 Nouvelle Commande Corporate</h1>
            <h2>${order.orderNumber}</h2>
        </div>

        <div class="content">
            <div class="corporate-info">
                <h3>🏢 Informations Entreprise</h3>
                <p><strong>Entreprise :</strong> ${order.corporateData?.companyName || order.customerInfo.company}</p>
                <p><strong>Contact :</strong> ${order.customerInfo.name}</p>
                <p><strong>Email :</strong> ${order.customerInfo.email}</p>
                <p><strong>Téléphone :</strong> ${order.customerInfo.phone}</p>
                <p><strong>Mode paiement :</strong> ${order.corporateData?.paymentTerm === 'monthly' ? 'Facturation mensuelle' : 'Paiement immédiat'}</p>
            </div>

            <div class="order-details">
                <h3>📋 Détails Commande</h3>
                <p><strong>Numéro :</strong> ${order.orderNumber}</p>
                <p><strong>Montant :</strong> ${order.totalAmount.toFixed(2)} €</p>
                <p><strong>Date livraison :</strong> ${new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')} (${order.deliveryInfo.timeSlot})</p>
                <p><strong>Adresse :</strong> ${order.deliveryInfo.address.street}, ${order.deliveryInfo.address.zipCode} ${order.deliveryInfo.address.city}</p>
                ${order.deliveryInfo.notes ? `<p><strong>Instructions :</strong> ${order.deliveryInfo.notes}</p>` : ''}
            </div>

            <p>⚠️ <strong>Commande corporate - Facturation mensuelle</strong><br>
            Cette commande sera incluse dans la facture mensuelle de l'entreprise.</p>

            <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/commandes">Voir dans l'interface admin</a></p>
        </div>

        <div class="footer">
            <p>Notification automatique Bella Fleurs</p>
        </div>
    </div>
</body>
</html>`;

    const mailOptions = {
      from: `"Bella Fleurs" <${process.env.EMAIL_CLIENT_USER}>`,
      to: adminEmail,
      subject: `🏢 Nouvelle Commande Corporate - ${order.corporateData?.companyName} - ${order.totalAmount.toFixed(2)}€`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Notification admin commande corporate envoyée');
    return true;

  } catch (error) {
    console.error('❌ Erreur notification admin commande corporate:', error);
    return false;
  }
}
