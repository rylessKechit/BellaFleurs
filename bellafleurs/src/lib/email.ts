// src/lib/email.ts - MISE À JOUR avec support message cadeau
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

type EmailAccount = 'client' | 'admin';

// Configuration des transporters
const getTransporter = (account: EmailAccount) => {
  if (account === 'client') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_CLIENT_USER,
        pass: process.env.EMAIL_CLIENT_PASS
      }
    });
  } else {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADMIN_USER,
        pass: process.env.EMAIL_ADMIN_PASS
      }
    });
  }
};

// Fonction principale d'envoi d'email
export async function sendEmail(options: EmailOptions, account: EmailAccount = 'client'): Promise<boolean> {
  try {
    const transporter = getTransporter(account);
    const fromEmail = account === 'client' 
      ? process.env.EMAIL_CLIENT_USER 
      : process.env.EMAIL_ADMIN_USER;

    const mailOptions = {
      from: `"Bella Fleurs" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || []
    };

    const result = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`❌ Error sending email via ${account} account:`, error);
    return false;
  }
}

// Template HTML moderne pour les CLIENTS (design chaleureux et élégant)
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
            color: #374151;
            background: linear-gradient(135deg, #fef7ed 0%, #fef3c7 100%);
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border-top: 4px solid #22c55e;
        }
        .header {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        .header::before {
            content: '🌸';
            position: absolute;
            right: 30px;
            top: 30px;
            font-size: 24px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .order-details {
            background: #f8fafc;
            border-left: 4px solid #22c55e;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .highlight-box {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border: 1px solid #86efac;
            padding: 16px;
            border-radius: 8px;
            margin: 16px 0;
        }
        .gift-message-box {
            background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
            border: 2px solid #f9a8d4;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .gift-message-box .title {
            color: #be185d;
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 10px;
        }
        .gift-message-box .message {
            color: #831843;
            font-style: italic;
            font-size: 15px;
            line-height: 1.5;
            background: rgba(255, 255, 255, 0.7);
            padding: 10px;
            border-radius: 6px;
            border-left: 3px solid #f9a8d4;
        }
        .footer {
            background: #f1f5f9;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer-logo {
            font-size: 20px;
            font-weight: 600;
            color: #22c55e;
            margin-bottom: 10px;
        }
        .social-links a {
            color: #22c55e;
            text-decoration: none;
            margin: 0 5px;
        }
        .contact-info {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        
        @media (max-width: 650px) {
            .container { margin: 10px; }
            .header, .content, .footer { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${subject}</h1>
        </div>
        
        <div class="content">
            ${text.split('\n').map(line => {
                const trimmed = line.trim();
                if (!trimmed) return '';
                
                // ✨ NOUVEAU : Détection des messages cadeaux
                if (trimmed.startsWith('🎁 Message cadeau :')) {
                    const message = trimmed.replace('🎁 Message cadeau : ', '').replace(/^"/, '').replace(/"$/, '');
                    return `
                    <div class="gift-message-box">
                        <div class="title">🎁 Message cadeau</div>
                        <div class="message">"${message}"</div>
                    </div>`;
                }
                
                // Détection des sections importantes
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
                    Merci de votre confiance !
                </p>
                <p style="margin-top: 12px; font-size: 11px; color: #9ca3af;">
                    💚
                </p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// Template spécial structuré pour les notifications admin - VERSION AMÉLIORÉE avec support message cadeau
function generateAdminOrderHTML(order: any): string {
  // Helper pour formater l'heure de livraison
  const formatTimeSlot = (timeSlot: string) => {
    const timeSlots = {
      'morning': 'Matin (9h-12h)',
      'afternoon': 'Après-midi (13h-17h)',
      'evening': 'Soirée (17h-19h)',
      '9h-13h': '9h - 13h (matin)',
      '14h-19h': '14h - 19h (après-midi)'
    };
    return timeSlots[timeSlot as keyof typeof timeSlots] || timeSlot || 'Non spécifié';
  };

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
            position: relative;
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
        }
        .gift-banner {
            background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
            border: 2px solid #f87171;
            border-radius: 8px;
            padding: 20px;
            margin: 20px;
            text-align: center;
        }
        .gift-banner h3 {
            margin: 0 0 8px 0;
            color: #991b1b;
            font-size: 18px;
        }
        .gift-message-admin {
            background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
            border: 2px solid #f9a8d4;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        .gift-message-admin .title {
            color: #be185d;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .gift-message-admin .message {
            color: #831843;
            font-style: italic;
            background: rgba(255, 255, 255, 0.8);
            padding: 8px;
            border-radius: 4px;
            border-left: 3px solid #f9a8d4;
        }
        .content {
            padding: 30px;
        }
        .order-section {
            background: #f8fafc;
            border-left: 4px solid #22c55e;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .order-section h3 {
            margin: 0 0 15px 0;
            color: #1f2937;
            font-size: 18px;
        }
        .items-list {
            margin-top: 15px;
        }
        .item {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .item:last-child {
            border-bottom: none;
        }
        .item-name {
            font-weight: 600;
            color: #1f2937;
        }
        .item-details {
            color: #6b7280;
            font-size: 14px;
        }
        .item-price {
            font-weight: 600;
            color: #059669;
            white-space: nowrap;
        }
        .total-section {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border: 2px solid #22c55e;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 18px;
            font-weight: 700;
        }
        .total-amount {
            font-size: 24px;
            font-weight: 700;
        }
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 20px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }
        .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(34, 197, 94, 0.4);
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
            .urgent-banner, .gift-banner { margin: 15px; }
            .item {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }
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
        
        ${order.isGift ? `
        <div class="gift-banner">
            <h3>🎁 COMMANDE CADEAU</h3>
            <p>Cette commande est un cadeau - Attention aux informations de destinataire</p>
        </div>
        ` : ''}
        
        <div class="content">
            <!-- Informations client -->
            <div class="order-section">
                <h3>👤 Informations Client</h3>
                <p><strong>Nom :</strong> ${order.customerInfo.name}</p>
                <p><strong>Email :</strong> ${order.customerInfo.email}</p>
                <p><strong>Téléphone :</strong> ${order.customerInfo.phone}</p>
                
                ${order.isGift && order.giftInfo ? `
                <div class="gift-message-admin">
                    <div class="title">🎁 Informations cadeau</div>
                    <p><strong>Destinataire :</strong> ${order.giftInfo.recipientName}</p>
                    <p><strong>Expéditeur :</strong> ${order.giftInfo.senderName}</p>
                    ${order.giftInfo.message ? `
                    <div class="title">💌 Message cadeau :</div>
                    <div class="message">"${order.giftInfo.message}"</div>
                    ` : '<p><em>Aucun message personnalisé</em></p>'}
                </div>
                ` : ''}
            </div>

            <!-- Articles commandés -->
            <div class="order-section">
                <h3>🌸 Articles Commandés</h3>
                <div class="items-list">
                    ${order.items.map((item: any) => `
                    <div class="item">
                        <div>
                            <div class="item-name">${item.name}</div>
                            <div class="item-details">Quantité: ${item.quantity}</div>
                            ${item.variantName ? `<div class="item-details">Variante: ${item.variantName}</div>` : ''}
                        </div>
                        <div class="item-price">${(item.price * item.quantity).toFixed(2)}€</div>
                    </div>
                    `).join('')}
                </div>
            </div>

            <!-- Total -->
            <div class="total-section">
                <div>Montant Total</div>
                <div class="total-amount">${order.totalAmount.toFixed(2)}€</div>
            </div>

            <!-- Informations de livraison -->
            <div class="order-section">
                <h3>🚚 Informations de Livraison</h3>
                <p><strong>Mode :</strong> ${order.deliveryInfo.type === 'delivery' ? 'Livraison à domicile' : 'Retrait en boutique'}</p>
                <p><strong>Date prévue :</strong> ${new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')}</p>
                ${order.deliveryInfo.timeSlot ? `
                <p><strong>Créneau horaire :</strong> ${formatTimeSlot(order.deliveryInfo.timeSlot)}</p>
                ` : ''}
                ${order.deliveryInfo.address ? `
                <p><strong>Adresse de livraison :</strong><br>
                ${order.deliveryInfo.address.street}<br>
                ${order.deliveryInfo.address.zipCode} ${order.deliveryInfo.address.city}</p>
                ` : ''}
                ${order.deliveryInfo.notes ? `
                <p><strong>Notes spéciales :</strong><br>
                ${order.deliveryInfo.notes}</p>
                ` : ''}
            </div>
            
            <!-- Bouton d'action -->
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://www.bellafleurs.fr/auth/signin" class="action-button" target="_blank">
                    🌸 Accéder au Dashboard Admin
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

// Email de notification de nouvelle commande pour l'ADMIN - MISE À JOUR avec message cadeau
export async function sendNewOrderNotification(order: any): Promise<boolean> {
  const adminEmail = process.env.EMAIL_ADMIN_USER || 'bellafleurs30@gmail.com';
  
  const subject = `🔔 Nouvelle commande ${order.orderNumber} - ${order.isGift ? '🎁 CADEAU' : 'Standard'}`;
  const html = generateAdminOrderHTML(order);
  
  return await sendEmail({
    to: adminEmail,
    subject,
    html
  }, 'client');
}

// Email de changement de statut pour le client - MISE À JOUR avec message cadeau
export async function sendOrderStatusEmail(order: any, newStatus: string, note?: string): Promise<boolean> {
  const templates = {
    'en_creation': {
      subject: '🌸 Votre commande est en cours de création',
      content: `
Bonjour ${order.customerInfo.name},

Nous avons le plaisir de vous informer que votre commande ${order.orderNumber} est maintenant en cours de création.

${order.isGift ? `🎁 Cette commande étant un cadeau, nous apportons une attention particulière à sa préparation.` : ''}

Nos fleuristes expérimentés travaillent avec passion et minutie pour composer votre magnifique création florale selon vos souhaits.

${order.isGift && order.giftInfo?.message ? `🎁 Message cadeau : "${order.giftInfo.message}"` : ''}

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

Excellente nouvelle ! Votre commande ${order.orderNumber} est maintenant prête.

${order.isGift ? `🎁 Votre cadeau a été préparé avec soin et est accompagné d'une belle carte.` : ''}

${order.deliveryInfo.type === 'pickup' 
  ? `Vous pouvez venir la récupérer à notre boutique aux horaires d'ouverture.`
  : `Nous procéderons à la livraison selon les modalités convenues :`
}

${order.deliveryInfo.type === 'delivery' ? `
📅 Date de livraison : ${new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')}
📍 Adresse : ${order.deliveryInfo.address?.street}, ${order.deliveryInfo.address?.zipCode} ${order.deliveryInfo.address?.city}
` : ''}

${order.isGift && order.giftInfo?.message ? `🎁 Message cadeau inclus : "${order.giftInfo.message}"` : ''}

${note ? `Note de nos fleuristes : ${note}` : ''}

Merci de votre confiance !

L'équipe Bella Fleurs
      `
    },
    'en_livraison': {
      subject: '🚚 Votre commande est en cours de livraison',
      content: `
Bonjour ${order.customerInfo.name},

Votre commande ${order.orderNumber} est actuellement en cours de livraison !

${order.isGift ? `🎁 Ce cadeau sera bientôt entre les mains de son destinataire.` : ''}

Notre livreur se rend à l'adresse indiquée et vous contactera si nécessaire.

📍 Adresse de livraison : ${order.deliveryInfo.address?.street}, ${order.deliveryInfo.address?.zipCode} ${order.deliveryInfo.address?.city}

${order.isGift && order.giftInfo?.message ? `🎁 Message cadeau : "${order.giftInfo.message}"` : ''}

${note ? `Information importante : ${note}` : ''}

Merci de votre confiance !

L'équipe Bella Fleurs
      `
    },
    'livrée': {
      subject: '🎉 Votre commande a été livrée !',
      content: `
Bonjour ${order.customerInfo.name},

Parfait ! Votre commande ${order.orderNumber} a été livrée avec succès.

${order.isGift ? `🎁 Nous espérons que ce cadeau apportera beaucoup de joie !` : ''}

Nous espérons que notre création florale vous apporte satisfaction et illumine votre journée.

${order.isGift && order.giftInfo?.message ? `🎁 Message cadeau transmis : "${order.giftInfo.message}"` : ''}

${note ? `Note de livraison : ${note}` : ''}

N'hésitez pas à nous faire part de vos commentaires et à partager une photo de votre composition sur nos réseaux sociaux !

Merci de votre confiance et à bientôt,

L'équipe Bella Fleurs
      `
    }
  };

  const template = templates[newStatus as keyof typeof templates];
  if (!template) {
    console.error(`❌ No email template found for status: ${newStatus}`);
    return false;
  }

  const html = generateClientHTML(template.subject, template.content);

  return await sendEmail({
    to: order.customerInfo.email,
    subject: template.subject,
    html
  }, 'client');
}

// Email de confirmation de commande au CLIENT - MISE À JOUR avec message cadeau
export async function sendOrderConfirmation(order: any): Promise<boolean> {
  const subject = `✅ Confirmation de votre commande ${order.orderNumber}${order.isGift ? ' 🎁' : ''}`;
  
  const content = `
Bonjour ${order.customerInfo.name},

Merci beaucoup pour votre commande ! Nous avons bien reçu votre demande et nous sommes ravis de créer pour vous une composition florale exceptionnelle.

${order.isGift ? `🎁 Cette commande étant un cadeau, nous apporterons une attention particulière à sa présentation et y joindrons une belle carte.` : ''}

DÉTAILS DE VOTRE COMMANDE :
• Numéro de commande : ${order.orderNumber}
• Montant total : ${order.totalAmount.toFixed(2)}€
• Statut de paiement : Confirmé ✅
${order.isGift ? '• Type : Cadeau 🎁' : ''}

ARTICLES COMMANDÉS :
${order.items.map((item: any) => `• ${item.name} (x${item.quantity}) - ${(item.price * item.quantity).toFixed(2)}€`).join('\n')}

${order.isGift && order.giftInfo ? `
🎁 INFORMATIONS CADEAU :
• Destinataire : ${order.giftInfo.recipientName}
• Expéditeur : ${order.giftInfo.senderName}
${order.giftInfo.message ? `🎁 Message cadeau : "${order.giftInfo.message}"` : '• Message : Aucun message personnalisé'}
` : ''}

INFORMATIONS DE LIVRAISON :
📅 Date prévue : ${new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')}
📍 Mode : ${order.deliveryInfo.type === 'delivery' ? 'Livraison à domicile' : 'Retrait en boutique'}
${order.deliveryInfo.address ? `📍 Adresse : ${order.deliveryInfo.address.street}, ${order.deliveryInfo.address.zipCode} ${order.deliveryInfo.address.city}` : ''}
${order.deliveryInfo.notes ? `💬 Vos notes : ${order.deliveryInfo.notes}` : ''}

PROCHAINES ÉTAPES :
1. Nous commençons immédiatement la préparation de votre commande
2. Vous recevrez une notification dès qu'elle sera prête
3. ${order.deliveryInfo.type === 'delivery' ? 'Nous procéderons à la livraison' : 'Vous pourrez venir la récupérer'}

${order.isGift ? `🎁 Pour un cadeau, nous inclurons une carte élégante avec votre message personnalisé.` : ''}

Vous pouvez suivre l'état d'avancement de votre commande à tout moment en vous connectant à votre compte.

Merci de votre confiance. Nos fleuristes ont hâte de créer pour vous une composition exceptionnelle !

Bien à vous,
L'équipe Bella Fleurs
  `;

  const html = generateClientHTML(subject, content);

  return await sendEmail({
    to: order.customerInfo.email,
    subject,
    html
  }, 'client');
}