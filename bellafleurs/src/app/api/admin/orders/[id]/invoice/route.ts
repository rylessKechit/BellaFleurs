// src/app/api/admin/orders/[id]/invoice/route.ts
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

// GET /api/admin/orders/[id]/invoice - Générer et télécharger la facture PDF
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès non autorisé',
          code: 'UNAUTHORIZED'
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
          code: 'INVALID_PARAMS',
          details: validationResult.error.errors
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

    // Vérifier que la commande est livrée (pour les factures)
    if (order.status !== 'livrée') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'La facture n\'est disponible que pour les commandes livrées',
          code: 'INVOICE_NOT_AVAILABLE'
        }
      }, { status: 400 });
    }

    // Générer le HTML de la facture
    const invoiceHTML = generateInvoiceHTML(order);

    // Pour l'instant, retourner le HTML (vous pouvez intégrer une lib PDF plus tard)
    const response = new NextResponse(invoiceHTML, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="facture-${order.orderNumber}.html"`,
      }
    });

    return response;

  } catch (error: any) {
    console.error('❌ Invoice generation error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la génération de la facture',
        code: 'INVOICE_GENERATION_ERROR',
        details: error.message
      }
    }, { status: 500 });
  }
}

// Fonction pour générer le HTML de la facture
function generateInvoiceHTML(order: any): string {
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
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .invoice-header {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
            padding: 30px;
            position: relative;
        }
        
        .invoice-header::before {
            content: '🌸';
            position: absolute;
            right: 30px;
            top: 30px;
            font-size: 48px;
            opacity: 0.3;
        }
        
        .company-info h1 {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .company-info p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .invoice-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            padding: 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
        }
        
        .invoice-details h2 {
            color: #22c55e;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .invoice-details p {
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .invoice-details strong {
            display: inline-block;
            min-width: 120px;
            color: #374151;
        }
        
        .invoice-content {
            padding: 30px;
        }
        
        .section-title {
            color: #22c55e;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #22c55e;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .items-table th {
            background: #f8f9fa;
            color: #374151;
            font-weight: 600;
            padding: 15px;
            text-align: left;
            border-bottom: 2px solid #e9ecef;
        }
        
        .items-table td {
            padding: 15px;
            border-bottom: 1px solid #f1f3f4;
        }
        
        .items-table tr:hover {
            background: #f8f9fa;
        }
        
        .item-name {
            font-weight: 500;
            color: #374151;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .total-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .total-final {
            border-top: 2px solid #22c55e;
            padding-top: 15px;
            margin-top: 15px;
            font-size: 20px;
            font-weight: bold;
            color: #22c55e;
        }
        
        .delivery-info {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
        }
        
        .delivery-info h3 {
            color: #0369a1;
            margin-bottom: 15px;
        }
        
        .footer-notes {
            margin-top: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            font-size: 14px;
            color: #6b7280;
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
            .invoice-meta {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .items-table {
                font-size: 14px;
            }
            
            .items-table th,
            .items-table td {
                padding: 10px 8px;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- En-tête -->
        <div class="invoice-header">
            <div class="company-info">
                <h1>Bella Fleurs</h1>
                <p>Créations florales d'exception</p>
            </div>
        </div>
        
        <!-- Métadonnées de la facture -->
        <div class="invoice-meta">
            <div class="invoice-details">
                <h2>📋 Informations Facture</h2>
                <p><strong>N° Facture :</strong> ${order.orderNumber}</p>
                <p><strong>Date facture :</strong> ${invoiceDate}</p>
                <p><strong>Date commande :</strong> ${orderDate}</p>
                <p><strong>Statut :</strong> <span style="color: #22c55e; font-weight: bold;">Livrée</span></p>
            </div>
            
            <div class="invoice-details">
                <h2>👤 Client</h2>
                <p><strong>Nom :</strong> ${order.customerInfo.name}</p>
                <p><strong>Email :</strong> ${order.customerInfo.email}</p>
                <p><strong>Téléphone :</strong> ${order.customerInfo.phone}</p>
                ${order.deliveryInfo.address ? `
                <p><strong>Adresse :</strong><br>
                ${order.deliveryInfo.address.street}<br>
                ${order.deliveryInfo.address.zipCode} ${order.deliveryInfo.address.city}</p>
                ` : ''}
            </div>
        </div>
        
        <!-- Contenu de la facture -->
        <div class="invoice-content">
            <h2 class="section-title">🌸 Articles commandés</h2>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Article</th>
                        <th class="text-center">Quantité</th>
                        <th class="text-right">Prix unitaire</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map((item: any) => `
                    <tr>
                        <td class="item-name">${item.name}</td>
                        <td class="text-center">${item.quantity}</td>
                        <td class="text-right">${item.price.toFixed(2)}€</td>
                        <td class="text-right"><strong>${(item.price * item.quantity).toFixed(2)}€</strong></td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <!-- Total -->
            <div class="total-section">
                <div class="total-row">
                    <span>Sous-total :</span>
                    <span>${order.totalAmount.toFixed(2)}€</span>
                </div>
                <div class="total-row">
                    <span>TVA (20%) :</span>
                    <span>${(order.totalAmount * 0.2).toFixed(2)}€</span>
                </div>
                <div class="total-row total-final">
                    <span>TOTAL TTC :</span>
                    <span>${order.totalAmount.toFixed(2)}€</span>
                </div>
            </div>
            
            <!-- Informations de livraison -->
            <div class="delivery-info">
                <h3>🚚 Informations de livraison</h3>
                <p><strong>Type :</strong> ${order.deliveryInfo.type === 'delivery' ? 'Livraison à domicile' : 'Retrait en magasin'}</p>
                <p><strong>Date :</strong> ${new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')}</p>
                ${order.deliveryInfo.notes ? `<p><strong>Notes :</strong> ${order.deliveryInfo.notes}</p>` : ''}
            </div>
            
            <!-- Notes de bas de page -->
            <div class="footer-notes">
                <p><strong>Bella Fleurs</strong> - Votre fleuriste de confiance</p>
                <p>📍 123 Rue des Fleurs, 75001 Paris | ☎️ 07 80 66 27 32 | ✉️ contact@bellafleurs.fr</p>
                <p>💳 Paiement effectué le ${orderDate} - Merci pour votre confiance !</p>
                <br>
                <p style="font-style: italic;">Cette facture a été générée automatiquement le ${invoiceDate}. 
                Pour toute question, n'hésitez pas à nous contacter.</p>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim();
}