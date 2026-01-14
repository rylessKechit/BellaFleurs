// src/app/api/corporate/dashboard/recent-orders/route.ts - Commandes récentes
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérification de l'authentification et du type de compte
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Authentification requise',
          code: 'AUTH_REQUIRED'
        }
      }, { status: 401 });
    }

    if (session.user.accountType !== 'corporate') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès réservé aux comptes corporate',
          code: 'CORPORATE_ONLY'
        }
      }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    await connectDB();

    // Récupérer les commandes récentes de l'utilisateur corporate
    const orders = await Order.find({
      user: session.user.id
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('orderNumber totalAmount status deliveryInfo items createdAt')
    .lean();

    return NextResponse.json({
      success: true,
      data: {
        orders,
        count: orders.length
      }
    });

  } catch (error: any) {
    console.error('❌ Corporate recent orders error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des commandes récentes',
        code: 'RECENT_ORDERS_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}