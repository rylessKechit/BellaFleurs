// src/app/api/abonnement/demande/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { budget, preferences, email, name, phone } = await request.json();

    // Validation des données
    if (!budget || !preferences) {
      return NextResponse.json({
        success: false,
        error: 'Budget et préférences requis'
      }, { status: 400 });
    }

    // Email à l'admin
    const adminEmail = process.env.ADMIN_EMAIL; // DESTINATAIRE
    const fromEmail = process.env.EMAIL_ADMIN_USER; // EXPÉDITEUR
    
    if (!adminEmail || !fromEmail) {
      console.error('❌ Configuration email manquante:', { adminEmail: !!adminEmail, fromEmail: !!fromEmail });
      return NextResponse.json({
        success: false,
        error: 'Configuration email manquante'
      }, { status: 500 });
    }

    const adminSubject = '🌸 Nouvelle demande d\'abonnement floral - Bella Fleurs';
    const adminContent = `
Nouvelle demande d'abonnement reçue !

INFORMATIONS CLIENT :
${email ? `• Email : ${email}` : ''}
${name ? `• Nom : ${name}` : ''}
${phone ? `• Téléphone : ${phone}` : ''}

BUDGET SOUHAITÉ :
• ${budget} par semaine

PRÉFÉRENCES ET BESOINS :
${preferences}

---
Envoyé depuis : ${fromEmail}
Reçu le : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}

Action requise : Contacter ce prospect dans les 24h pour finaliser son abonnement personnalisé.
`;

    // Envoi email admin (DEPUIS EMAIL_ADMIN_USER VERS ADMIN_EMAIL)
    const emailSent = await sendEmail({
      to: adminEmail, // ADMIN_EMAIL (destinataire)
      subject: adminSubject,
      html: adminContent,
    }, 'admin');

    if (!emailSent) {
      console.error('❌ Échec envoi email admin');
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'envoi'
      }, { status: 500 });
    }

    // Email de confirmation au client (si email fourni)
    if (email) {
      const clientSubject = '🌸 Demande d\'abonnement reçue - Bella Fleurs';
      const clientContent = `
Bonjour${name ? ` ${name}` : ''} !

Merci pour votre intérêt pour notre abonnement floral hebdomadaire.

Nous avons bien reçu votre demande avec les informations suivantes :
• Budget souhaité : ${budget} par semaine
• Vos préférences : ${preferences}

Notre fleuriste experte va étudier votre demande et vous contactera dans les 24h pour :
✓ Discuter de vos goûts et contraintes
✓ Personnaliser votre abonnement
✓ Organiser la première livraison

En attendant, n'hésitez pas à nous contacter si vous avez des questions.

À très bientôt pour transformer votre quotidien en jardin de bonheur ! 🌸

L'équipe Bella Fleurs
`;

      await sendEmail({
        to: email,
        subject: clientSubject,
        html: clientContent,
      }, 'client');
    }

    return NextResponse.json({
      success: true,
      message: 'Demande envoyée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur API abonnement:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}