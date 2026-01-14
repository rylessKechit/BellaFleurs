// src/app/api/orders/[id]/route.ts - API pour récupérer une commande par ID
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await connectDB();

    // Récupérer la commande
    const order = await Order.findById(params.id)
      .populate('items.product', 'name images category')
      .lean();

    if (!order) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Commande introuvable',
          code: 'ORDER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Vérifier que l'utilisateur a accès à cette commande
    // Admin peut voir toutes les commandes, utilisateur ne peut voir que les siennes
    const user = session.user as any;
    const isAdmin = user.role === 'admin';
    const isOwner = order.user?.toString() === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès non autorisé à cette commande',
          code: 'UNAUTHORIZED_ACCESS'
        }
      }, { status: 403 });
    }

    console.log('✅ Commande récupérée:', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      isCorporate: !!order.corporateData
    });

    return NextResponse.json({
      success: true,
      data: {
        order
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur récupération commande:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération de la commande',
        code: 'ORDER_FETCH_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }, { status: 500 });
  }
}
