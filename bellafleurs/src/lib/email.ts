// src/lib/email.ts - Version avec design moderne et couleurs Bella Fleurs
import nodemailer from 'nodemailer';

// Interface pour les options d'email
interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

// Type de compte email
type EmailAccountType = 'client' | 'admin';

// Configuration du transporteur email avec double compte
const createTransporter = (type: EmailAccountType = 'client') => {
  let envVars: string[];
  
  if (type === 'admin') {
    // Configuration pour les emails ADMIN (notifications)
    envVars = [
      'EMAIL_ADMIN_HOST',
      'EMAIL_ADMIN_PORT', 
      'EMAIL_ADMIN_USER',
      'EMAIL_ADMIN_PASSWORD'
    ];
  } else {
    // Configuration pour les emails CLIENT (confirmations)
    envVars = [
      'EMAIL_CLIENT_HOST',
      'EMAIL_CLIENT_PORT', 
      'EMAIL_CLIENT_USER',
      'EMAIL_CLIENT_PASSWORD'
    ];
  }

  const missingVars = envVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️ Variables d'environnement manquantes pour l'email ${type}: ${missingVars.join(', ')}`);
    return null;
  }

  const config = type === 'admin' ? {
    host: process.env.EMAIL_ADMIN_HOST,
    port: parseInt(process.env.EMAIL_ADMIN_PORT || '587'),
    secure: process.env.EMAIL_ADMIN_PORT === '465',
    auth: {
      user: process.env.EMAIL_ADMIN_USER,
      pass: process.env.EMAIL_ADMIN_PASSWORD,
    }
  } : {
    host: process.env.EMAIL_CLIENT_HOST,
    port: parseInt(process.env.EMAIL_CLIENT_PORT || '587'),
    secure: process.env.EMAIL_CLIENT_PORT === '465',
    auth: {
      user: process.env.EMAIL_CLIENT_USER,
      pass: process.env.EMAIL_CLIENT_PASSWORD,
    }
  };

  return nodemailer.createTransport({
    ...config,
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Fonction principale d'envoi d'email avec type de compte
export async function sendEmail(options: EmailOptions, accountType: EmailAccountType = 'client'): Promise<boolean> {
  try {
    const transporter = createTransporter(accountType);
    
    if (!transporter) {
      console.error(`❌ Impossible de créer le transporteur email ${accountType} - variables d'environnement manquantes`);
      return false;
    }

    // Définir l'expéditeur selon le type de compte
    const defaultFrom = accountType === 'admin' 
      ? process.env.EMAIL_ADMIN_FROM || process.env.EMAIL_ADMIN_USER
      : process.env.EMAIL_CLIENT_FROM || process.env.EMAIL_CLIENT_USER;

    const emailOptions = {
      from: options.from || defaultFrom,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || (accountType === 'admin' ? generateAdminHTML(options.subject, options.text || '') : generateClientHTML(options.subject, options.text || ''))
    };

    const info = await transporter.sendMail(emailOptions);
    
    console.log(`✅ Email ${accountType} envoyé:`, {
      to: options.to,
      subject: options.subject,
      messageId: info.messageId,
      account: accountType
    });
    
    return true;

  } catch (error: any) {
    console.error(`❌ Erreur envoi email ${accountType}:`, {
      error: error.message,
      code: error.code,
      to: options.to,
      subject: options.subject,
      account: accountType
    });
    return false;
  }
}

// Template HTML moderne pour les CLIENTS (design chaleureux)
function generateClientHTML(subject: string, text: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }
        .header {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 0;
            right: 0;
            height: 20px;
            background: white;
            border-radius: 20px 20px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .tagline {
            margin-top: 8px;
            opacity: 0.95;
            font-size: 16px;
            font-weight: 300;
        }
        .emoji {
            font-size: 24px;
            margin: 0 8px;
        }
        .content {
            padding: 50px 40px 40px;
        }
        .content p {
            margin: 0 0 18px 0;
            font-size: 16px;
            line-height: 1.7;
            color: #374151;
        }
        .highlight-box {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 2px solid #22c55e;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            position: relative;
        }
        .highlight-box::before {
            content: '✨';
            position: absolute;
            top: -12px;
            left: 20px;
            background: white;
            padding: 0 8px;
            font-size: 20px;
        }
        .order-details {
            background: #f9fafb;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #22c55e;
        }
        .footer {
            background: #f8fafc;
            padding: 40px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer-logo {
            font-size: 28px;
            font-weight: 700;
            color: #16a34a;
            margin-bottom: 12px;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            color: #22c55e;
            text-decoration: none;
            margin: 0 12px;
            font-weight: 500;
            transition: color 0.3s;
        }
        .social-links a:hover {
            color: #16a34a;
        }
        .contact-info {
            margin-top: 24px;
            font-size: 14px;
            color: #6b7280;
            line-height: 1.6;
        }
        
        @media (max-width: 600px) {
            .container { margin: 10px; border-radius: 12px; }
            .header, .content, .footer { padding: 30px 20px; }
            .header h1 { font-size: 26px; }
            .content { padding: 40px 20px 30px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><span class="emoji">🌸</span>Bella Fleurs</h1>
            <div class="tagline">Créations florales d'exception</div>
        </div>
        
        <div class="content">
            ${text.split('\n').map(line => {
                const trimmed = line.trim();
                if (!trimmed) return '';
                
                // Détection de sections importantes
                if (trimmed.includes('DÉTAILS DE VOTRE COMMANDE') || trimmed.includes('ARTICLES COMMANDÉS') || trimmed.includes('INFORMATIONS DE LIVRAISON')) {
                    return `<div class="order-details"><strong>${trimmed}</strong></div>`;
                }
                
                // Détection des statuts pour stylisation spéciale
                if (trimmed.includes('en cours de création') || trimmed.includes('prête') || 
                    trimmed.includes('livraison') || trimmed.includes('livrée')) {
                    return `<div class="highlight-box"><p><strong>${trimmed}</strong></p></div>`;
                }
                
                return `<p>${trimmed}</p>`;
            }).filter(p => p).join('')}
        </div>
        
        <div class="footer">
            <div class="footer-logo">🌸 Bella Fleurs</div>
            <p style="color: #6b7280; margin-bottom: 16px; font-size: 16px;">
                Votre fleuriste de confiance à Brétigny-sur-Orge
            </p>
            
            <div class="social-links">
                <a href="#">Facebook</a> • 
                <a href="#">Instagram</a> • 
                <a href="#">Nous contacter</a>
            </div>
            
            <div class="contact-info">
                <p style="font-weight: 500; color: #22c55e;">Créations uniques • Livraison locale • Service personnalisé</p>
                <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">
                    Vous recevez cet email car vous avez passé commande chez Bella Fleurs.<br>
                    Merci de votre confiance ! 💚
                </p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// Template HTML moderne pour les ADMINS (design professionnel et urgent)
function generateAdminHTML(subject: string, text: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            line-height: 1.6;
            color: #111827;
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 650px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border: 2px solid #22c55e;
        }
        .header {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .header .order-number {
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 10px;
            display: inline-block;
        }
        .urgent-banner {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px;
            text-align: center;
            position: relative;
        }
        .urgent-banner h3 {
            margin: 0 0 8px 0;
            color: #92400e;
            font-size: 18px;
            font-weight: 700;
        }
        .urgent-banner p {
            margin: 0;
            color: #b45309;
            font-weight: 500;
        }
        .content {
            padding: 0 30px 30px;
        }
        .info-section {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #22c55e;
        }
        .info-section h3 {
            margin: 0 0 12px 0;
            color: #1e293b;
            font-size: 16px;
            font-weight: 700;
            display: flex;
            align-items: center;
        }
        .info-section h3::before {
            content: attr(data-icon);
            margin-right: 8px;
            font-size: 18px;
        }
        .items-section {
            background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .total {
            color: #15803d;
            font-weight: 700;
            font-size: 18px;
            text-align: right;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #22c55e;
        }
        .action-button {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            display: inline-block;
            margin: 20px auto;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }
        .footer {
            background: #f1f5f9;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        @media (max-width: 650px) {
            .container { margin: 10px; }
            .header, .content, .footer { padding: 20px; }
            .urgent-banner { margin: 15px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 Nouvelle Commande</h1>
        </div>
        
        <div class="urgent-banner">
            <h3>⚡ ACTION REQUISE</h3>
            <p>Une nouvelle commande nécessite votre attention et doit être traitée rapidement.</p>
        </div>
        
        <div class="content">
            ${text.split('\n').map(line => {
                const trimmed = line.trim();
                if (!trimmed) return '';
                return `<p>${trimmed}</p>`;
            }).filter(p => p).join('')}
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="#" class="action-button">
                    🌸 Accéder au Dashboard
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p style="color: #64748b; margin: 0; font-weight: 600;">
                Système de notifications Bella Fleurs
            </p>
            <p style="color: #94a3b8; margin-top: 8px; font-size: 14px;">
                Email envoyé automatiquement • Ne pas répondre
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

// Email de confirmation de commande au CLIENT
export async function sendOrderConfirmation(order: any): Promise<boolean> {
  const subject = `✅ Confirmation de votre commande ${order.orderNumber}`;
  
  const content = `
Bonjour ${order.customerInfo.name},

Merci beaucoup pour votre commande ! Nous avons bien reçu votre demande et nous sommes ravis de créer pour vous une composition florale exceptionnelle.

DÉTAILS DE VOTRE COMMANDE :
• Numéro de commande : ${order.orderNumber}
• Montant total : ${order.totalAmount.toFixed(2)}€
• Statut de paiement : Confirmé ✅

ARTICLES COMMANDÉS :
${order.items.map((item: any) => `• ${item.name} (x${item.quantity}) - ${(item.price * item.quantity).toFixed(2)}€`).join('\n')}

INFORMATIONS DE LIVRAISON :
📅 Date prévue : ${new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')}
📍 Mode : ${order.deliveryInfo.type === 'delivery' ? 'Livraison à domicile' : 'Retrait en boutique'}
${order.deliveryInfo.address ? `📍 Adresse : ${order.deliveryInfo.address.street}, ${order.deliveryInfo.address.zipCode} ${order.deliveryInfo.address.city}` : ''}
${order.deliveryInfo.notes ? `💬 Vos notes : ${order.deliveryInfo.notes}` : ''}

PROCHAINES ÉTAPES :
1. Nous commençons immédiatement la préparation de votre commande
2. Vous recevrez une notification dès qu'elle sera prête
3. ${order.deliveryInfo.type === 'delivery' ? 'Nous procéderons à la livraison' : 'Vous pourrez venir la récupérer'}

Vous pouvez suivre l'état d'avancement de votre commande à tout moment en vous connectant à votre compte.

Merci de votre confiance. Nos fleuristes ont hâte de créer pour vous une composition exceptionnelle !

Bien à vous,
L'équipe Bella Fleurs
  `;

  const html = generateClientHTML(subject, content);

  // UTILISATION DU COMPTE CLIENT
  return await sendEmail({
    to: order.customerInfo.email,
    subject,
    html
  }, 'client');
}

// Template spécial structuré pour les notifications admin
function generateAdminOrderHTML(order: any): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle commande ${order.orderNumber}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            line-height: 1.6;
            color: #111827;
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 650px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border: 2px solid #22c55e;
        }
        .header {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .order-number {
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 10px;
            display: inline-block;
        }
        .urgent-banner {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px;
            text-align: center;
        }
        .urgent-banner h3 {
            margin: 0 0 8px 0;
            color: #92400e;
            font-size: 18px;
            font-weight: 700;
        }
        .info-section {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px;
            border-left: 4px solid #22c55e;
        }
        .info-section h3 {
            margin: 0 0 12px 0;
            color: #1e293b;
            font-size: 16px;
            font-weight: 700;
        }
        .items-section {
            background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 20px;
            margin: 20px;
        }
        .total {
            color: #15803d;
            font-weight: 700;
            font-size: 18px;
            text-align: right;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #22c55e;
        }
        .action-button {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            display: block;
            margin: 30px 20px;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }
        .footer {
            background: #f1f5f9;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 Nouvelle Commande</h1>
            <div class="order-number">Commande ${order.orderNumber}</div>
        </div>
        
        <div class="urgent-banner">
            <h3>⚡ ACTION REQUISE</h3>
            <p>Une nouvelle commande nécessite votre attention et doit être traitée rapidement.</p>
        </div>

        <div class="info-section">
            <h3>👤 INFORMATIONS CLIENT</h3>
            <p><strong>Nom :</strong> ${order.customerInfo.name}</p>
            <p><strong>Email :</strong> <a href="mailto:${order.customerInfo.email}">${order.customerInfo.email}</a></p>
            <p><strong>Téléphone :</strong> <a href="tel:${order.customerInfo.phone}">${order.customerInfo.phone}</a></p>
        </div>
        
        <div class="items-section">
            <h3>🌸 ARTICLES COMMANDÉS</h3>
            ${order.items.map((item: any) => `
            <p>• <strong>${item.name}</strong> (x${item.quantity}) - ${(item.price * item.quantity).toFixed(2)}€</p>
            `).join('')}
            <div class="total">💰 TOTAL : ${order.totalAmount.toFixed(2)}€</div>
        </div>
        
        <div class="info-section">
            <h3>🚚 LIVRAISON</h3>
            <p><strong>Type :</strong> ${order.deliveryInfo.type === 'delivery' ? 'Livraison à domicile' : 'Retrait en boutique'}</p>
            <p><strong>Date prévue :</strong> ${new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')}</p>
            ${order.deliveryInfo.address ? `
            <p><strong>Adresse :</strong><br>
            ${order.deliveryInfo.address.street}<br>
            ${order.deliveryInfo.address.zipCode} ${order.deliveryInfo.address.city}</p>
            ` : ''}
            ${order.deliveryInfo.notes ? `<p><strong>Notes :</strong> ${order.deliveryInfo.notes}</p>` : ''}
        </div>
        
        <a href="#" class="action-button">
            🌸 Accéder au Dashboard Admin
        </a>
        
        <div class="footer">
            <p style="color: #64748b; margin: 0; font-weight: 600;">
                Système de notifications Bella Fleurs
            </p>
            <p style="color: #94a3b8; margin-top: 8px; font-size: 14px;">
                Email envoyé automatiquement • Ne pas répondre
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

// Email de notification de nouvelle commande pour l'ADMIN
export async function sendNewOrderNotification(order: any): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@bellafleurs.fr';
  
  const subject = `🔔 Nouvelle commande ${order.orderNumber} - Action requise`;
  const html = generateAdminOrderHTML(order);
  
  // UTILISATION DU COMPTE ADMIN
  return await sendEmail({
    to: adminEmail,
    subject,
    html
  }, 'admin');
}

// Email de changement de statut pour le client
export async function sendOrderStatusEmail(order: any, newStatus: string, note?: string): Promise<boolean> {
  const templates = {
    'en_creation': {
      subject: '🌸 Votre commande est en cours de création',
      content: `
Bonjour ${order.customerInfo.name},

Nous avons le plaisir de vous informer que votre commande ${order.orderNumber} est maintenant en cours de création.

Nos fleuristes expérimentés travaillent avec passion et minutie pour composer votre magnifique création florale selon vos souhaits.

${note ? `Message personnalisé de nos fleuristes : ${note}` : ''}

Nous vous tiendrons informé(e) dès que votre commande sera prête.

Merci de votre confiance,
L'équipe Bella Fleurs
      `
    },
    'prête': {
      subject: '✅ Votre commande est prête !',
      content: `
Bonjour ${order.customerInfo.name},

Excellente nouvelle ! Votre commande ${order.orderNumber} est maintenant prête et vous attend.

${order.deliveryInfo.type === 'pickup' 
  ? `Vous pouvez venir la récupérer à notre boutique aux heures d'ouverture.`
  : `Nous organisons la livraison selon les modalités convenues.`}

${note ? `Message de nos fleuristes : ${note}` : ''}

Merci de votre confiance,
L'équipe Bella Fleurs
      `
    },
    'livrée': {
      subject: '🎉 Votre commande a été livrée !',
      content: `
Bonjour ${order.customerInfo.name},

Votre commande ${order.orderNumber} a été livrée avec succès !

Nous espérons que votre création florale vous apportera beaucoup de joie et que vous êtes pleinement satisfait(e) de nos services.

${note ? `Note de livraison : ${note}` : ''}

N'hésitez pas à nous faire part de vos impressions et à nous faire confiance pour vos prochaines occasions spéciales.

Merci de votre confiance,
L'équipe Bella Fleurs
      `
    }
  };

  const template = templates[newStatus as keyof typeof templates];
  if (!template) return false;

  const html = generateClientHTML(template.subject, template.content);

  // UTILISATION DU COMPTE CLIENT pour les mises à jour de statut
  return await sendEmail({
    to: order.customerInfo.email,
    subject: template.subject,
    html
  }, 'client');
}

// Test de configuration email pour les deux comptes
export async function testEmailConfiguration(): Promise<{ client: boolean; admin: boolean }> {
  const testEmailClient = process.env.EMAIL_CLIENT_USER;
  const testEmailAdmin = process.env.EMAIL_ADMIN_USER;
  
  const results = { client: false, admin: false };

  // Test compte CLIENT
  if (testEmailClient) {
    const contentClient = `
Test de configuration email CLIENT réussi !

Cette email confirme que le service d'envoi d'emails CLIENT de Bella Fleurs fonctionne correctement.

Configuration testée le : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}

Variables d'environnement vérifiées :
• EMAIL_CLIENT_HOST : ${process.env.EMAIL_CLIENT_HOST}
• EMAIL_CLIENT_PORT : ${process.env.EMAIL_CLIENT_PORT}  
• EMAIL_CLIENT_USER : ${process.env.EMAIL_CLIENT_USER?.substring(0, 3)}***
• EMAIL_CLIENT_FROM : ${process.env.EMAIL_CLIENT_FROM}

L'équipe technique Bella Fleurs
    `;

    const htmlClient = generateClientHTML('🧪 Test Email CLIENT - Bella Fleurs', contentClient);

    results.client = await sendEmail({
      to: testEmailClient,
      subject: '🧪 Test de configuration email CLIENT - Bella Fleurs',
      html: htmlClient
    }, 'client');
  }

  // Test compte ADMIN
  if (testEmailAdmin) {
    const contentAdmin = `
Test de configuration email ADMIN réussi !

Cette email confirme que le service d'envoi d'emails ADMIN de Bella Fleurs fonctionne correctement.

Configuration testée le : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}

Variables d'environnement vérifiées :
• EMAIL_ADMIN_HOST : ${process.env.EMAIL_ADMIN_HOST}
• EMAIL_ADMIN_PORT : ${process.env.EMAIL_ADMIN_PORT}  
• EMAIL_ADMIN_USER : ${process.env.EMAIL_ADMIN_USER?.substring(0, 3)}***
• EMAIL_ADMIN_FROM : ${process.env.EMAIL_ADMIN_FROM}

L'équipe technique Bella Fleurs
    `;

    const htmlAdmin = generateAdminHTML('🧪 Test Email ADMIN - Bella Fleurs', contentAdmin);

    results.admin = await sendEmail({
      to: testEmailAdmin,
      subject: '🧪 Test de configuration email ADMIN - Bella Fleurs',
      html: htmlAdmin
    }, 'admin');
  }

  return results;
}