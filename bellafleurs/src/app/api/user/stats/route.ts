// src/app/api/user/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: { message: 'Non authentifié', code: 'UNAUTHORIZED' }
      }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectDB();

    // Calculer les vraies statistiques depuis les commandes
    const orders = await Order.find({ 
      user: userId,
      status: { $ne: 'annulée' }
    });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderAmount = totalOrders > 0 ? totalSpent / totalOrders : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        totalSpent,
        avgOrderAmount
      }
    });

  } catch (error) {
    console.error('❌ User stats error:', error);
    return NextResponse.json({
      success: false,
      error: { message: 'Erreur serveur', code: 'SERVER_ERROR' }
    }, { status: 500 });
  }
}