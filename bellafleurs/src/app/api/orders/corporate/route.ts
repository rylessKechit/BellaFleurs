// src/app/api/orders/corporate/route.ts - API commandes corporate
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import { sendCorporateOrderConfirmation, sendCorporateOrderNotification } from '@/lib/email/corporate';

// POST /api/orders/corporate - Créer une commande corporate
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

    // Vérifier que c'est bien un compte corporate
    if (session.user.accountType !== 'corporate') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès réservé aux comptes corporate',
          code: 'CORPORATE_ONLY'
        }
      }, { status: 403 });
    }

    const body = await req.json();
    const { 
      items, 
      totalAmount, 
      customerInfo, 
      deliveryInfo, 
      corporateInfo 
    } = body;

    // Validation des données
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Articles de commande requis',
          code: 'ITEMS_REQUIRED'
        }
      }, { status: 400 });
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Montant de commande invalide',
          code: 'INVALID_AMOUNT'
        }
      }, { status: 400 });
    }

    await connectDB();

    // Vérifier la limite mensuelle
    if (corporateInfo?.monthlyLimit) {
      const currentSpent = corporateInfo.currentSpent || 0;
      const wouldExceedLimit = (currentSpent + totalAmount) > corporateInfo.monthlyLimit;
      
      if (wouldExceedLimit) {
        return NextResponse.json({
          success: false,
          error: {
            message: `Cette commande dépasserait votre limite mensuelle de ${corporateInfo.monthlyLimit}€`,
            code: 'MONTHLY_LIMIT_EXCEEDED',
            details: {
              currentSpent,
              orderAmount: totalAmount,
              monthlyLimit: corporateInfo.monthlyLimit,
              availableBudget: corporateInfo.monthlyLimit - currentSpent
            }
          }
        }, { status: 400 });
      }
    }

    // Générer un numéro de commande
    const generateOrderNumber = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      return `BFC-${year}${month}${day}-${random}`; // BFC = Bella Fleurs Corporate
    };

    // Créer la commande corporate
    const newOrder = new Order({
      orderNumber: generateOrderNumber(),
      user: session.user.id,
      items: items.map(item => ({
        product: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        customization: item.customization
      })),
      totalAmount,
      
      // ✨ SPÉCIFICITÉ CORPORATE
      paymentStatus: 'pending_monthly', // Nouveau statut pour facturation mensuelle
      paymentMethod: 'corporate_monthly',
      status: 'payée', // Commande directement confirmée pour corporate
      
      // Informations client (pré-remplies depuis le compte corporate)
      customerInfo: {
        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        email: customerInfo.email,
        phone: customerInfo.phone,
        company: corporateInfo?.companyName // ✨ Info entreprise
      },
      
      // Informations de livraison
      deliveryInfo: {
        type: 'delivery',
        address: deliveryInfo.address,
        date: new Date(deliveryInfo.date),
        timeSlot: deliveryInfo.timeSlot,
        notes: deliveryInfo.notes,
        deliveryFee: 0 // Souvent gratuit pour les corporate
      },
      
      // ✨ DONNÉES CORPORATE SPÉCIFIQUES
      corporateData: {
        companyName: corporateInfo?.companyName,
        contactPerson: corporateInfo?.contactPerson,
        paymentTerm: corporateInfo?.paymentTerm || 'monthly',
        monthlyLimit: corporateInfo?.monthlyLimit,
        willBeInvoiced: true, // Cette commande sera facturée mensuellement
        invoiceMonth: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}` // Format: 2026-01
      },
      
      // Timeline
      timeline: [
        {
          status: 'payée',
          date: new Date(),
          note: `Commande corporate confirmée - ${corporateInfo?.companyName}`
        }
      ],
      
      // Admin notes
      adminNotes: `Commande corporate - ${corporateInfo?.companyName} - Paiement mensuel`,
      confirmedAt: new Date()
    });

    await newOrder.save();

    // Populer les informations produits pour la réponse
    const populatedOrder = await Order.findById(newOrder._id)
      .populate('items.product', 'name images category');

    // Vider le panier de l'utilisateur
    try {
      await Cart.deleteOne({ user: session.user.id });
    } catch (error) {
      console.warn('⚠️ Erreur lors du vidage du panier:', error);
    }

    // Envoyer les emails de confirmation
    try {
      // Email au client corporate
      await sendCorporateOrderConfirmation(populatedOrder);
      
      // Notification à l'admin
      await sendCorporateOrderNotification(populatedOrder);
    } catch (emailError) {
      console.error('❌ Erreur envoi emails corporate:', emailError);
      // Ne pas faire échouer la commande pour autant
    }

    console.log('✅ Commande corporate créée:', {
      orderNumber: newOrder.orderNumber,
      company: corporateInfo?.companyName,
      amount: totalAmount,
      paymentTerm: corporateInfo?.paymentTerm
    });

    return NextResponse.json({
      success: true,
      data: {
        order: populatedOrder,
        message: 'Commande corporate créée avec succès'
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Corporate order creation error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la création de la commande corporate',
        code: 'CORPORATE_ORDER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }, { status: 500 });
  }
}