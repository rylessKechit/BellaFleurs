// src/app/api/admin/orders/[id]/status/route.ts - Version corrigée
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { sendOrderStatusEmail } from '@/lib/email';
import { z } from 'zod';

// Type pour les statuts de commande
type OrderStatus = 'payée' | 'en_creation' | 'prête' | 'en_livraison' | 'livrée' | 'annulée';

const statusUpdateSchema = z.object({
  status: z.enum(['payée', 'en_creation', 'prête', 'en_livraison', 'livrée', 'annulée']),
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
    console.log('📝 Données reçues:', body); // Debug
    
    const validationResult = statusUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.errors);
      return NextResponse.json({
        success: false,
        error: {
          message: 'Données invalides',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.errors
        }
      }, { status: 400 });
    }

    const { status: newStatus, note } = validationResult.data;

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

    const currentStatus = currentOrder.status;
    console.log(`📊 Changement de statut: ${currentStatus} → ${newStatus}`); // Debug

    // Workflow plus flexible - permettre plus de transitions
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      'payée': ['en_creation', 'annulée'],
      'en_creation': ['prête', 'annulée', 'payée'], // Retour possible
      'prête': ['en_livraison', 'en_creation', 'annulée'], // Retour possible  
      'en_livraison': ['livrée', 'prête'], // Retour possible
      'livrée': ['en_livraison'], // Retour possible en cas d'erreur
      'annulée': ['payée'] // Réactiver une commande
    };

    const allowedNextStatuses = allowedTransitions[currentStatus as OrderStatus] || [];
    
    // Permettre de garder le même statut (pour mise à jour de note)
    if (newStatus !== currentStatus && !allowedNextStatuses.includes(newStatus)) {
      return NextResponse.json({
        success: false,
        error: {
          message: `Changement de statut non autorisé de "${currentStatus}" vers "${newStatus}". Statuts autorisés: ${allowedNextStatuses.join(', ')}`,
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
        ...(newStatus === 'livrée' && { deliveredAt: new Date() }),
        ...(newStatus === 'annulée' && { cancelledAt: new Date() }),
        ...(newStatus === 'prête' && { readyAt: new Date() }),
        $push: {
          timeline: {
            status: newStatus,
            date: new Date(),
            note: note || `Statut changé vers "${getStatusLabel(newStatus)}"`
          }
        }
      },
      { new: true }
    ).populate('items.product', 'name images');

    if (!updatedOrder) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Erreur lors de la mise à jour',
          code: 'UPDATE_ERROR'
        }
      }, { status: 500 });
    }

    // Envoyer email de notification au client (sauf pour "payée" initiale)
    if (newStatus !== 'payée' && newStatus !== currentStatus) {
      try {
        console.log('📧 Envoi email de notification...');
        const emailSent = await sendOrderStatusEmail(updatedOrder, newStatus, note);
        console.log(`📧 Email envoyé: ${emailSent}`);
        
        // Mettre à jour le flag d'envoi d'email
        await Order.findByIdAndUpdate(params.id, {
          [`emailsSent.statusUpdate_${newStatus}`]: emailSent,
          'emailsSent.lastStatusEmailSentAt': new Date()
        });
      } catch (emailError) {
        console.error('❌ Erreur envoi email:', emailError);
        // Ne pas faire échouer la mise à jour du statut pour autant
      }
    }

    console.log(`✅ Statut commande ${updatedOrder.orderNumber} changé: ${currentStatus} → ${newStatus}`);

    return NextResponse.json({
      success: true,
      message: `Statut mis à jour vers "${getStatusLabel(newStatus)}"`,
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
        code: 'STATUS_UPDATE_ERROR',
        details: error.message
      }
    }, { status: 500 });
  }
}

// Fonction helper pour les labels
function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    'payée': 'Payée',
    'en_creation': 'En cours de création',
    'prête': 'Prête',
    'en_livraison': 'En livraison',
    'livrée': 'Livrée',
    'annulée': 'Annulée'
  };
  return labels[status] || status;
}