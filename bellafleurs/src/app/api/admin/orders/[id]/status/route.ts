// src/app/api/admin/orders/[id]/status/route.ts - Modification minimale avec service email
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { sendOrderStatusEmail, sendNewOrderNotification } from '@/lib/email';
import { z } from 'zod';

// Type pour les statuts de commande
type OrderStatus = 'validé' | 'en_cours_creation' | 'prête' | 'en_livraison' | 'livré';

const statusUpdateSchema = z.object({
  status: z.enum(['validé', 'en_cours_creation', 'prête', 'en_livraison', 'livré']),
  note: z.string().optional()
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier les droits admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès refusé. Droits administrateur requis.',
          code: 'ACCESS_DENIED'
        }
      }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const { status: newStatus, note } = statusUpdateSchema.parse(body);

    // Récupérer la commande actuelle
    const currentOrder = await Order.findById(params.id);
    if (!currentOrder) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Commande non trouvée',
          code: 'ORDER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Vérifier que le changement de statut est valide
    const statusFlow: Record<OrderStatus, OrderStatus[]> = {
      'validé': ['en_cours_creation'],
      'en_cours_creation': ['prête'],
      'prête': ['en_livraison'],
      'en_livraison': ['livré'],
      'livré': []
    };

    const currentStatus = currentOrder.status as OrderStatus;
    const allowedNextStatuses = statusFlow[currentStatus];
    
    if (!allowedNextStatuses.includes(newStatus)) {
      return NextResponse.json({
        success: false,
        error: {
          message: `Changement de statut invalide de "${currentStatus}" vers "${newStatus}"`,
          code: 'INVALID_STATUS_CHANGE'
        }
      }, { status: 400 });
    }

    // Mettre à jour le statut et la timeline
    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      {
        status: newStatus,
        updatedAt: new Date(),
        $push: {
          timeline: {
            status: newStatus,
            date: new Date(),
            note: note || `Statut changé vers "${newStatus}"`
          }
        }
      },
      { new: true }
    ).populate('items.product', 'name images');

    // Envoyer email de notification au client (sauf pour "validé") - REMPLACEMENT DES CONSOLE.LOG
    if (newStatus !== 'validé') {
      await sendOrderStatusEmail(updatedOrder, newStatus, note);
    }

    // Log pour suivi
    console.log(`✅ Statut commande ${updatedOrder?.orderNumber} changé: ${currentStatus} → ${newStatus}`);

    return NextResponse.json({
      success: true,
      message: `Statut mis à jour vers "${newStatus}"`,
      data: { order: updatedOrder }
    });

  } catch (error: any) {
    console.error('❌ Order status update error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Données invalides',
          code: 'VALIDATION_ERROR',
          details: error.errors
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour du statut',
        code: 'STATUS_UPDATE_ERROR'
      }
    }, { status: 500 });
  }
}

// API pour recevoir les notifications de nouvelles commandes
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { orderId } = await req.json();

    const order = await Order.findById(orderId)
      .populate('items.product', 'name images');

    if (!order) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Commande non trouvée',
          code: 'ORDER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Envoyer notification à l'admin - REMPLACEMENT DU CONSOLE.LOG
    await sendNewOrderNotification(order);

    return NextResponse.json({
      success: true,
      message: 'Notification envoyée'
    });

  } catch (error: any) {
    console.error('❌ Order notification error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de l\'envoi de la notification',
        code: 'NOTIFICATION_ERROR'
      }
    }, { status: 500 });
  }
}