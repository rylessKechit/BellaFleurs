// src/app/api/admin/orders/[id]/route.ts
export const dynamic = 'force-dynamic';

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

    const order = await Order.findById(params.id)
      .populate('items.product', 'name images')
      .lean();
    
    if (!order) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Commande non trouvée',
          code: 'ORDER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { order }
    });

  } catch (error: any) {
    console.error('❌ Admin order GET error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération de la commande',
        code: 'ORDER_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const { adminNotes } = await req.json();

    const order = await Order.findByIdAndUpdate(
      params.id,
      { 
        adminNotes,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Commande non trouvée',
          code: 'ORDER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Notes mises à jour avec succès',
      data: { order }
    });

  } catch (error: any) {
    console.error('❌ Admin order PATCH error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour des notes',
        code: 'ORDER_UPDATE_ERROR'
      }
    }, { status: 500 });
  }
}