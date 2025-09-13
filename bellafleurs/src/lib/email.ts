// src/lib/email.ts
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
  // Vérifier si toutes les variables d'environnement sont définies
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
    secure: process.env.EMAIL_SERVER_PORT === '465', // true pour 465, false pour autres ports
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    tls: {
      // Ne pas échouer sur des certificats invalides
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

    // Configuration par défaut
    const emailOptions = {
      from: options.from || process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || generateHTML(options.subject, options.text || '')
    };

    // Envoyer l'email
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
      to: options.to,
      subject: options.subject
    });
    return false;
  }
}

// Fonction pour générer le HTML à partir du texte
function generateHTML(subject: string, text: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #16a34a;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #16a34a;
            margin-bottom: 10px;
        }
        .content {
            margin-bottom: 30px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
        .contact-info {
            margin-top: 15px;
            font-size: 12px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌸 Bella Fleurs</div>
            <div style="color: #666;">Créations florales d'exception à Brétigny-sur-Orge</div>
        </div>
        
        <div class="content">
            ${text.split('\n').map(line => `<p>${line}</p>`).join('')}
        </div>
        
        <div class="footer">
            <p><strong>Bella Fleurs</strong><br>
            Votre fleuriste de confiance à Brétigny-sur-Orge</p>
            
            <div class="contact-info">
                <p>Créations uniques • Livraison locale • Service personnalisé</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// Fonctions spécialisées pour les différents types d'emails

// Email de notification de nouvelle commande pour l'admin
export async function sendNewOrderNotification(order: any): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@bellafleurs.fr';
  
  const subject = `🔔 Nouvelle commande ${order.orderNumber}`;
  const text = `
Nouvelle commande reçue !

Numéro de commande: ${order.orderNumber}
Client: ${order.customerInfo.name}
Email: ${order.customerInfo.email}
Téléphone: ${order.customerInfo.phone}
Montant total: ${order.totalAmount.toFixed(2)}€

Type de service: ${order.deliveryInfo.type === 'delivery' ? 'Livraison' : 'Retrait en boutique'}
Date prévue: ${new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')}

${order.deliveryInfo.type === 'delivery' && order.deliveryInfo.address ? 
  `Adresse de livraison:
${order.deliveryInfo.address.street}
${order.deliveryInfo.address.zipCode} ${order.deliveryInfo.address.city}` : 
  'Retrait en boutique'
}

Articles commandés:
${order.items.map((item: any) => `- ${item.name} (x${item.quantity}) - ${(item.price * item.quantity).toFixed(2)}€`).join('\n')}

${order.deliveryInfo.notes ? `Notes du client: ${order.deliveryInfo.notes}` : ''}

Connectez-vous à votre dashboard pour gérer cette commande.
  `;

  return await sendEmail({
    to: adminEmail,
    subject,
    text
  });
}

// Email de changement de statut pour le client
export async function sendOrderStatusEmail(order: any, newStatus: string, note?: string): Promise<boolean> {
  const templates = {
    'en_cours_creation': {
      subject: '🌸 Votre commande Bella Fleurs est en cours de création',
      text: `
Bonjour ${order.customerInfo.name},

Nous avons commencé la création de votre magnifique commande ${order.orderNumber}.

Nos fleuristes travaillent avec soin pour composer votre bouquet selon vos souhaits.

Vous recevrez une nouvelle notification dès que votre commande sera prête.

${note ? `Note de nos fleuristes: ${note}` : ''}

Merci de votre confiance,
L'équipe Bella Fleurs
      `
    },
    'prête': {
      subject: '✅ Votre commande Bella Fleurs est prête !',
      text: `
Bonjour ${order.customerInfo.name},

Excellente nouvelle ! Votre commande ${order.orderNumber} est maintenant prête.

${order.deliveryInfo.type === 'pickup' 
  ? 'Vous pouvez venir la récupérer en boutique aux horaires d\'ouverture.'
  : `Nous préparerons la livraison pour le ${new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')}.`
}

${note ? `Message de nos fleuristes: ${note}` : ''}

Nous avons hâte que vous découvriez votre création florale !

À bientôt,
L'équipe Bella Fleurs
      `
    },
    'en_livraison': {
      subject: '🚚 Votre commande Bella Fleurs est en cours de livraison',
      text: `
Bonjour ${order.customerInfo.name},

Votre commande ${order.orderNumber} est actuellement en cours de livraison.

Notre équipe se rend chez vous avec vos magnifiques fleurs fraîches.

Merci de vous assurer d'être disponible à l'adresse indiquée.

${note ? `Information de livraison: ${note}` : ''}

L'équipe Bella Fleurs
      `
    },
    'livré': {
      subject: '🎉 Votre commande Bella Fleurs a été livrée !',
      text: `
Bonjour ${order.customerInfo.name},

Votre commande ${order.orderNumber} a été livrée avec succès !

Nous espérons que nos créations florales vous apportent joie et bonheur.

N'hésitez pas à partager une photo sur nos réseaux sociaux et à nous laisser un avis.

${note ? `Message de livraison: ${note}` : ''}

Merci de votre confiance et à bientôt pour de nouvelles créations !

L'équipe Bella Fleurs

P.S. : Pour vos prochaines occasions spéciales, pensez à Bella Fleurs 🌸
      `
    }
  };

  const template = templates[newStatus as keyof typeof templates];
  if (!template) {
    console.warn(`⚠️ Pas de template email pour le statut: ${newStatus}`);
    return false;
  }

  return await sendEmail({
    to: order.customerInfo.email,
    subject: template.subject,
    text: template.text
  });
}

// Email de confirmation de commande
export async function sendOrderConfirmation(order: any): Promise<boolean> {
  const subject = `✅ Confirmation de votre commande ${order.orderNumber}`;
  const text = `
Bonjour ${order.customerInfo.name},

Merci pour votre commande chez Bella Fleurs !

Récapitulatif de votre commande ${order.orderNumber} :

Articles commandés:
${order.items.map((item: any) => `- ${item.name} (x${item.quantity}) - ${(item.price * item.quantity).toFixed(2)}€`).join('\n')}

Total: ${order.totalAmount.toFixed(2)}€

Service choisi: ${order.deliveryInfo.type === 'delivery' ? 'Livraison' : 'Retrait en boutique'}
Date prévue: ${new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')}

${order.deliveryInfo.type === 'delivery' && order.deliveryInfo.address ? 
  `Adresse de livraison:
${order.deliveryInfo.address.street}
${order.deliveryInfo.address.zipCode} ${order.deliveryInfo.address.city}` : 
  'À récupérer en boutique'
}

Nous commencerons la préparation de votre commande sous peu et vous tiendrons informé(e) de son avancement.

Merci de votre confiance,
L'équipe Bella Fleurs
  `;

  return await sendEmail({
    to: order.customerInfo.email,
    subject,
    text
  });
}

// Test de configuration email
export async function testEmailConfiguration(): Promise<boolean> {
  const testEmail = process.env.EMAIL_SERVER_USER;
  
  if (!testEmail) {
    console.error('❌ Pas d\'email de test configuré');
    return false;
  }

  return await sendEmail({
    to: testEmail,
    subject: '🧪 Test de configuration email - Bella Fleurs',
    text: `
Test de configuration email réussi !

Cette email confirme que le service d'envoi d'emails de Bella Fleurs fonctionne correctement.

Configuration testée le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}

L'équipe technique Bella Fleurs
    `
  });
}