// src/app/api/admin/stats/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';

export async function GET(req: NextRequest) {
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

    // Calculer les statistiques de base
    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      pendingOrders,
      paidOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'client' }),
      Order.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
      Order.countDocuments({ paymentStatus: 'paid' })
    ]);

    // Statistiques des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      ordersLast30Days,
      revenueLast30Days,
      newUsersLast30Days
    ] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Order.aggregate([
        { 
          $match: { 
            paymentStatus: 'paid',
            createdAt: { $gte: thirtyDaysAgo }
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      User.countDocuments({ 
        role: 'client',
        createdAt: { $gte: thirtyDaysAgo }
      })
    ]);

    // Statistiques par jour (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Top produits
    const topProducts = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    const stats = {
      overview: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalProducts,
        totalUsers,
        pendingOrders,
        paidOrders,
        averageOrderValue: totalRevenue[0]?.total ? (totalRevenue[0].total / paidOrders) : 0
      },
      trends: {
        ordersLast30Days,
        revenueLast30Days: revenueLast30Days[0]?.total || 0,
        newUsersLast30Days,
        orderGrowth: ordersLast30Days > 0 ? ((ordersLast30Days / totalOrders) * 100) : 0,
        revenueGrowth: revenueLast30Days[0]?.total > 0 ? ((revenueLast30Days[0].total / (totalRevenue[0]?.total || 1)) * 100) : 0
      },
      charts: {
        dailyStats: dailyStats.map(stat => ({
          date: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}-${String(stat._id.day).padStart(2, '0')}`,
          orders: stat.orders,
          revenue: stat.revenue
        })),
        topProducts
      }
    };

    return NextResponse.json({
      success: true,
      data: { stats }
    });

  } catch (error: any) {
    console.error('❌ Admin stats GET error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des statistiques',
        code: 'STATS_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}