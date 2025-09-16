// src/app/api/orders/[id]/invoice/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { z } from 'zod';

// Validation du paramètre
const invoiceParamsSchema = z.object({
  id: z.string().min(1, 'ID de commande requis')
});

// GET /api/orders/[id]/invoice - Générer la facture pour un client
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification (client connecté)
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

    // Valider les paramètres
    const validationResult = invoiceParamsSchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Paramètres invalides',
          code: 'INVALID_PARAMS'
        }
      }, { status: 400 });
    }

    const { id } = validationResult.data;

    // Connexion DB
    await connectDB();

    // Récupérer la commande
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Commande introuvable',
          code: 'ORDER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Vérifier que la commande appartient au client connecté (ou est un admin)
    const isOwner = order.customerInfo.email === session.user.email;
    const isAdmin = session.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès non autorisé à cette commande',
          code: 'UNAUTHORIZED_ORDER_ACCESS'
        }
      }, { status: 403 });
    }

    // Vérifier que la commande est livrée
    if (order.status !== 'livrée') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'La facture n\'est disponible que pour les commandes livrées',
          code: 'INVOICE_NOT_AVAILABLE'
        }
      }, { status: 400 });
    }

    // Générer le HTML de la facture (même fonction que côté admin)
    const invoiceHTML = generateClientInvoiceHTML(order);

    const response = new NextResponse(invoiceHTML, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="facture-${order.orderNumber}.html"`,
      }
    });

    return response;

  } catch (error: any) {
    console.error('❌ Client invoice generation error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la génération de la facture',
        code: 'INVOICE_GENERATION_ERROR'
      }
    }, { status: 500 });
  }
}

// Fonction HTML spécifique client (plus simple)
function generateClientInvoiceHTML(order: any): string {
  const invoiceDate = new Date().toLocaleDateString('fr-FR');
  const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR');
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${order.orderNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
            padding: 20px;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .invoice-header {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        
        .invoice-header::before {
            content: '🌸';
            position: absolute;
            right: 30px;
            top: 30px;
            font-size: 48px;
            opacity: 0.2;
        }
        
        .invoice-header h1 {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .invoice-header p {
            font-size: 18px;
            opacity: 0.9;
        }
        
        .invoice-number {
            background: rgba(255,255,255,0.2);
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            margin-top: 15px;
            font-weight: 600;
        }
        
        .thank-you-section {
            background: #f0f9ff;
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid #e0e7ff;
        }
        
        .thank-you-section h2 {
            color: #1e40af;
            font-size: 24px;
            margin-bottom: 15px;
        }
        
        .thank-you-section p {
            color: #374151;
            font-size: 16px;
            max-width: 600px;
            margin: 0 auto;
        }
        
        .order-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            padding: 30px;
            background: #fafafa;
        }
        
        .detail-section h3 {
            color: #22c55e;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .detail-section p {
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .detail-section strong {
            display: inline-block;
            min-width: 100px;
            color: #374151;
        }
        
        .items-section {
            padding: 30px;
        }
        
        .section-title {
            color: #22c55e;
            font-size: 22px;
            font-weight: 600;
            margin-bottom: 25px;
            text-align: center;
            position: relative;
        }
        
        .section-title::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: #22c55e;
            border-radius: 2px;
        }
        
        .items-grid {
            display: grid;
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .item-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            border-left: 4px solid #22c55e;
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: center;
            gap: 20px;
        }
        
        .item-info h4 {
            color: #374151;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .item-info p {
            color: #6b7280;
            font-size: 14px;
        }
        
        .item-price {
            text-align: right;
        }
        
        .item-price .quantity {
            color: #6b7280;
            font-size: 14px;
        }
        
        .item-price .price {
            color: #22c55e;
            font-size: 18px;
            font-weight: bold;
        }
        
        .total-section {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 25px;
            border-radius: 12px;
            margin-top: 20px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            font-size: 16px;
        }
        
        .total-final {
            border-top: 2px solid #22c55e;
            padding-top: 15px;
            margin-top: 15px;
            font-size: 24px;
            font-weight: bold;
            color: #22c55e;
        }
        
        .delivery-section {
            background: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 12px;
            padding: 25px;
            margin: 30px;
        }
        
        .delivery-section h3 {
            color: #ea580c;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .delivery-section p {
            margin-bottom: 8px;
        }
        
        .footer {
            background: #374151;
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .footer h3 {
            margin-bottom: 15px;
            color: #22c55e;
        }
        
        .contact-info {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
        }
        
        .footer-note {
            font-size: 13px;
            opacity: 0.8;
            font-style: italic;
            border-top: 1px solid #4b5563;
            padding-top: 20px;
            margin-top: 20px;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .invoice-container {
                box-shadow: none;
                border-radius: 0;
            }
        }
        
        @media (max-width: 600px) {
            .order-details {
                grid-template-columns: 1fr;
                gap: 20px;
                padding: 20px;
            }
            
            .item-card {
                grid-template-columns: 1fr;
                gap: 10px;
            }
            
            .item-price {
                text-align: left;
            }
            
            .contact-info {
                flex-direction: column;
                gap: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- En-tête avec design attractif -->
        <div class="invoice-header">
            <h1>Bella Fleurs</h1>
            <p>Créations florales d'exception</p>
            <div class="invoice-number">Facture ${order.orderNumber}</div>
        </div>
        
        <!-- Section de remerciement -->
        <div class="thank-you-section">
            <h2>🎉 Merci pour votre commande !</h2>
            <p>Nous espérons que nos créations florales vous ont apporté joie et beauté. 
            Votre satisfaction est notre plus belle récompense.</p>
        </div>
        
        <!-- Détails de la commande -->
        <div class="order-details">
            <div class="detail-section">
                <h3>📋 Informations</h3>
                <p><strong>Date commande :</strong> ${orderDate}</p>
                <p><strong>Date facture :</strong> ${invoiceDate}</p>
                <p><strong>Statut :</strong> <span style="color: #22c55e; font-weight: bold;">✅ Livrée</span></p>
            </div>
            
            <div class="detail-section">
                <h3>👤 Facturation</h3>
                <p><strong>Nom :</strong> ${order.customerInfo.name}</p>
                <p><strong>Email :</strong> ${order.customerInfo.email}</p>
                <p><strong>Téléphone :</strong> ${order.customerInfo.phone}</p>
            </div>
        </div>
        
        <!-- Articles commandés -->
        <div class="items-section">
            <h2 class="section-title">🌸 Vos magnifiques créations</h2>
            
            <div class="items-grid">
                ${order.items.map((item: any) => `
                <div class="item-card">
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p>Création florale réalisée avec soin par nos artisans</p>
                    </div>
                    <div class="item-price">
                        <div class="quantity">Quantité: ${item.quantity}</div>
                        <div class="price">${(item.price * item.quantity).toFixed(2)}€</div>
                    </div>
                </div>
                `).join('')}
            </div>
            
            <!-- Total -->
            <div class="total-section">
                <div class="total-row">
                    <span>Sous-total :</span>
                    <span>${order.totalAmount.toFixed(2)}€</span>
                </div>
                <div class="total-row">
                    <span>TVA incluse (20%) :</span>
                    <span>${(order.totalAmount * 0.2).toFixed(2)}€</span>
                </div>
                <div class="total-row total-final">
                    <span>TOTAL PAYÉ :</span>
                    <span>${order.totalAmount.toFixed(2)}€</span>
                </div>
            </div>
        </div>
        
        <!-- Informations de livraison -->
        <div class="delivery-section">
            <h3>🚚 Livraison</h3>
            <p><strong>Type :</strong> ${order.deliveryInfo.type === 'delivery' ? 'Livraison à domicile' : 'Retrait en magasin'}</p>
            <p><strong>Date :</strong> ${new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')}</p>
            ${order.deliveryInfo.address ? `
            <p><strong>Adresse :</strong><br>
            ${order.deliveryInfo.address.street}<br>
            ${order.deliveryInfo.address.zipCode} ${order.deliveryInfo.address.city}</p>
            ` : ''}
            ${order.deliveryInfo.notes ? `<p><strong>Notes :</strong> ${order.deliveryInfo.notes}</p>` : ''}
        </div>
        
        <!-- Footer avec informations de contact -->
        <div class="footer">
            <h3>Bella Fleurs - Votre fleuriste de confiance</h3>
            
            <div class="contact-info">
                <div class="contact-item">
                    📍 123 Rue des Fleurs, 75001 Paris
                </div>
                <div class="contact-item">
                    ☎️ 01 23 45 67 89
                </div>
                <div class="contact-item">
                    ✉️ contact@bellafleurs.fr
                </div>
            </div>
            
            <div class="footer-note">
                Facture générée automatiquement le ${invoiceDate}.<br>
                Paiement effectué avec succès le ${orderDate} - Merci pour votre confiance !<br>
                Pour toute question, n'hésitez pas à nous contacter.
            </div>
        </div>
    </div>
</body>
</html>
  `.trim();
}