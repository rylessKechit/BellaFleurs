// src/lib/email.ts - Version avec design moderne
import nodemailer from 'nodemailer';

// Interface pour les options d'email
interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

// Configuration du transporteur email
const createTransporter = () => {
  const requiredEnvVars = [
    'EMAIL_SERVER_HOST',
    'EMAIL_SERVER_PORT', 
    'EMAIL_SERVER_USER',
    'EMAIL_SERVER_PASSWORD'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️ Variables d'environnement manquantes pour l'email: ${missingVars.join(', ')}`);
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_PORT === '465',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Fonction principale d'envoi d'email
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.error('❌ Impossible de créer le transporteur email - variables d\'environnement manquantes');
      return false;
    }

    const emailOptions = {
      from: options.from || process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || generateModernHTML(options.subject, options.text || '')
    };

    const info = await transporter.sendMail(emailOptions);
    
    console.log('✅ Email envoyé:', {
      to: options.to,
      subject: options.subject,
      messageId: info.messageId
    });
    
    return true;

  } catch (error: any) {
    console.error('❌ Erreur envoi email:', {
      error: error.message,
      code: error.code,
      to: options.to,
      subject: options.subject
    });
    return false;
  }
}

// Template HTML moderne et responsive
function generateModernHTML(subject: string, text: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px 0;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="flower" patternUnits="userSpaceOnUse" width="20" height="20"><circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23flower)"/></svg>');
            opacity: 0.3;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
            position: relative;
            z-index: 2;
        }
        
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 2;
        }
        
        .content {
            padding: 40px 30px;
            background: white;
        }
        
        .content p {
            margin-bottom: 16px;
            font-size: 16px;
            line-height: 1.7;
        }
        
        .highlight-box {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-left: 4px solid #16a34a;
            padding: 20px;
            margin: 24px 0;
            border-radius: 8px;
        }
        
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            transition: transform 0.2s ease;
        }
        
        .button:hover {
            transform: translateY(-2px);
        }
        
        .status-badge {
            display: inline-block;
            background: #16a34a;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin: 10px 0;
        }
        
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-logo {
            font-size: 20px;
            font-weight: bold;
            color: #16a34a;
            margin-bottom: 8px;
        }
        
        .contact-info {
            color: #64748b;
            font-size: 14px;
            margin-top: 16px;
        }
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #16a34a;
            text-decoration: none;
            font-size: 14px;
        }
        
        @media (max-width: 600px) {
            .email-container { margin: 0 10px; }
            .header, .content, .footer { padding: 20px; }
            .logo { font-size: 24px; }
            .tagline { font-size: 14px; }
            .content p { font-size: 14px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">🌸 Bella Fleurs</div>
            <div class="tagline">Créations florales d'exception à Brétigny-sur-Orge</div>
        </div>
        
        <div class="content">
            ${text.split('\n').map(line => {
                const trimmed = line.trim();
                if (!trimmed) return '';
                
                // Détection du statut pour stylisation spéciale
                if (trimmed.includes('en cours de création') || trimmed.includes('prête') || 
                    trimmed.includes('livraison') || trimmed.includes('livrée')) {
                    return `<div class="highlight-box"><p>${trimmed}</p></div>`;
                }
                
                return `<p>${trimmed}</p>`;
            }).filter(p => p).join('')}
        </div>
        
        <div class="footer">
            <div class="footer-logo">Bella Fleurs</div>
            <p style="color: #64748b; margin-bottom: 16px;">
                Votre fleuriste de confiance à Brétigny-sur-Orge
            </p>
            
            <div class="social-links">
                <a href="#">Facebook</a> • 
                <a href="#">Instagram</a> • 
                <a href="#">Nous contacter</a>
            </div>
            
            <div class="contact-info">
                <p>Créations uniques • Livraison locale • Service personnalisé</p>
                <p style="margin-top: 10px; font-size: 12px; color: #94a3b8;">
                    Vous recevez cet email car vous avez passé commande chez Bella Fleurs
                </p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// Email de notification de nouvelle commande pour l'admin
export async function sendNewOrderNotification(order: any): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@bellafleurs.fr';
  
  const subject = `🔔 Nouvelle commande ${order.orderNumber}`;
  const html = generateAdminOrderHTML(order);
  
  return await sendEmail({
    to: adminEmail,
    subject,
    html
  });
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
  ? 'Vous pouvez venir la récupérer en boutique pendant nos horaires d\'ouverture. Nous avons hâte de vous la présenter !' 
  : `Votre livraison est programmée pour le ${new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')}. Nous nous occuperons de tout !`
}

${note ? `Message spécial de nos fleuristes : ${note}` : ''}

Notre équipe a mis tout son savoir-faire pour créer une composition qui, nous l'espérons, vous émerveillera.

À très bientôt,
L'équipe Bella Fleurs
      `
    },
    'en_livraison': {
      subject: '🚚 Votre commande est en route !',
      content: `
Bonjour ${order.customerInfo.name},

Votre commande ${order.orderNumber} est actuellement en cours de livraison.

Notre équipe de livraison se dirige vers vous avec vos magnifiques fleurs fraîches, préparées avec le plus grand soin.

Merci de vous assurer d'être disponible à l'adresse indiquée pour réceptionner votre commande.

${note ? `Information de livraison : ${note}` : ''}

Plus que quelques instants avant que vous puissiez profiter de votre création florale !

L'équipe Bella Fleurs
      `
    },
    'livrée': {
      subject: '🎉 Votre commande a été livrée avec succès !',
      content: `
Bonjour ${order.customerInfo.name},

Nous avons le plaisir de vous confirmer que votre commande ${order.orderNumber} a été livrée avec succès !

Nous espérons sincèrement que nos créations florales vous apportent joie, beauté et bonheur dans votre quotidien.

${note ? `Message de notre équipe : ${note}` : ''}

N'hésitez pas à partager une photo de votre bouquet sur nos réseaux sociaux ! Nous adorons voir nos créations dans leur nouvel environnement.

Votre satisfaction est notre plus belle récompense. Si vous souhaitez nous laisser un avis, cela nous ferait énormément plaisir.

Merci de votre confiance et à bientôt pour de nouvelles créations florales !

L'équipe Bella Fleurs

P.S. : Pensez à Bella Fleurs pour toutes vos prochaines occasions spéciales ! 🌸
      `
    },
    'annulée': {
      subject: '❌ Votre commande a été annulée',
      content: `
Bonjour ${order.customerInfo.name},

Nous vous informons que votre commande ${order.orderNumber} a été annulée.

${note ? `Motif : ${note}` : 'Si vous avez des questions concernant cette annulation, n\'hésitez pas à nous contacter.'}

Si un paiement a été effectué, il sera automatiquement remboursé dans les plus brefs délais.

Nous restons à votre disposition pour toute nouvelle commande ou pour répondre à vos questions.

Cordialement,
L'équipe Bella Fleurs
      `
    }
  };

  const template = templates[newStatus as keyof typeof templates];
  if (!template) {
    console.warn(`⚠️ Pas de template email pour le statut: ${newStatus}`);
    return false;
  }

  const html = generateModernHTML(template.subject, template.content);

  return await sendEmail({
    to: order.customerInfo.email,
    subject: template.subject,
    html
  });
}

// Email de confirmation de commande
export async function sendOrderConfirmation(order: any): Promise<boolean> {
  const subject = `✅ Confirmation de commande ${order.orderNumber}`;
  
  const content = `
Bonjour ${order.customerInfo.name},

Merci infiniment pour votre commande chez Bella Fleurs !

Votre commande ${order.orderNumber} a bien été enregistrée et le paiement a été confirmé.

RÉCAPITULATIF DE VOTRE COMMANDE :

Articles commandés :
${order.items.map((item: any) => `• ${item.name} (x${item.quantity}) - ${(item.price * item.quantity).toFixed(2)}€`).join('\n')}

TOTAL : ${order.totalAmount.toFixed(2)}€

SERVICE CHOISI :
${order.deliveryInfo.type === 'delivery' ? '🚚 Livraison' : '🏪 Retrait en boutique'}
📅 Date prévue : ${new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')}

${order.deliveryInfo.type === 'delivery' && order.deliveryInfo.address ? 
  `📍 Adresse de livraison :
${order.deliveryInfo.address.street}
${order.deliveryInfo.address.zipCode} ${order.deliveryInfo.address.city}` : 
  '📍 À récupérer en boutique'
}

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

  const html = generateModernHTML(subject, content);

  return await sendEmail({
    to: order.customerInfo.email,
    subject,
    html
  });
}

// Template spécial pour les notifications admin
function generateAdminOrderHTML(order: any): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle commande ${order.orderNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; color: #333; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .order-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .items { background: #fff8dc; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .important { color: #dc2626; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 NOUVELLE COMMANDE</h1>
            <p>Commande ${order.orderNumber}</p>
        </div>
        
        <div class="content">
            <div class="order-info">
                <h3>INFORMATIONS CLIENT</h3>
                <p><strong>Nom :</strong> ${order.customerInfo.name}</p>
                <p><strong>Email :</strong> ${order.customerInfo.email}</p>
                <p><strong>Téléphone :</strong> ${order.customerInfo.phone}</p>
            </div>
            
            <div class="items">
                <h3>ARTICLES COMMANDÉS</h3>
                ${order.items.map((item: any) => `
                <p>• ${item.name} (x${item.quantity}) - ${(item.price * item.quantity).toFixed(2)}€</p>
                `).join('')}
                <p class="important">TOTAL : ${order.totalAmount.toFixed(2)}€</p>
            </div>
            
            <div class="order-info">
                <h3>LIVRAISON</h3>
                <p><strong>Type :</strong> ${order.deliveryInfo.type === 'delivery' ? 'Livraison à domicile' : 'Retrait en boutique'}</p>
                <p><strong>Date prévue :</strong> ${new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')}</p>
                ${order.deliveryInfo.address ? `
                <p><strong>Adresse :</strong><br>
                ${order.deliveryInfo.address.street}<br>
                ${order.deliveryInfo.address.zipCode} ${order.deliveryInfo.address.city}</p>
                ` : ''}
                ${order.deliveryInfo.notes ? `<p><strong>Notes :</strong> ${order.deliveryInfo.notes}</p>` : ''}
            </div>
            
            <p style="text-align: center; margin-top: 30px;">
                <strong>🌸 Connectez-vous à votre dashboard pour traiter cette commande 🌸</strong>
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

// Test de configuration email
export async function testEmailConfiguration(): Promise<boolean> {
  const testEmail = process.env.EMAIL_SERVER_USER;
  
  if (!testEmail) {
    console.error('❌ Pas d\'email de test configuré');
    return false;
  }

  const content = `
Test de configuration email réussi !

Cette email confirme que le service d'envoi d'emails de Bella Fleurs fonctionne correctement.

Configuration testée le : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}

Variables d'environnement vérifiées :
• EMAIL_SERVER_HOST : ${process.env.EMAIL_SERVER_HOST}
• EMAIL_SERVER_PORT : ${process.env.EMAIL_SERVER_PORT}  
• EMAIL_SERVER_USER : ${process.env.EMAIL_SERVER_USER?.substring(0, 3)}***
• EMAIL_FROM : ${process.env.EMAIL_FROM}

L'équipe technique Bella Fleurs
  `;

  const html = generateModernHTML('🧪 Test Email - Bella Fleurs', content);

  return await sendEmail({
    to: testEmail,
    subject: '🧪 Test de configuration email - Bella Fleurs',
    html
  });
}