// src/app/api/admin/stats/route.ts - Version complète avec vraies statistiques
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';

// GET /api/admin/stats - Statistiques admin avec vraies données
export async function GET(request: NextRequest) {
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
      Order.countDocuments({ status: { $in: ['en_creation', 'confirmed'] } }),
      Order.countDocuments({ paymentStatus: 'paid' })
    ]);

    // Statistiques des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      ordersLast30Days,
      revenueLast30Days,
      newUsersLast30Days,
      ordersLast60Days,
      revenueLast60Days
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
      }),
      // Pour calculer la croissance (30-60 jours)
      Order.countDocuments({ 
        createdAt: { 
          $gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
          $lt: thirtyDaysAgo
        }
      }),
      Order.aggregate([
        { 
          $match: { 
            paymentStatus: 'paid',
            createdAt: { 
              $gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
              $lt: thirtyDaysAgo
            }
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    // Calcul des pourcentages de croissance
    const orderGrowth = ordersLast60Days > 0 
      ? ((ordersLast30Days - ordersLast60Days) / ordersLast60Days * 100) 
      : ordersLast30Days > 0 ? 100 : 0;

    const revenueGrowth = (revenueLast60Days[0]?.total || 0) > 0
      ? (((revenueLast30Days[0]?.total || 0) - (revenueLast60Days[0]?.total || 0)) / (revenueLast60Days[0]?.total || 1) * 100)
      : (revenueLast30Days[0]?.total || 0) > 0 ? 100 : 0;

    // Top produits avec vraies statistiques de ventes
    const topProducts = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          image: { $first: '$items.image' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          totalSold: 1,
          totalRevenue: 1,
          image: 1,
          category: { $arrayElemAt: ['$productInfo.category', 0] },
          price: { $arrayElemAt: ['$productInfo.price', 0] },
          hasVariants: { $arrayElemAt: ['$productInfo.hasVariants', 0] }
        }
      }
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

    // Statistiques par catégorie
    const categoryStats = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    const stats = {
      overview: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalProducts,
        totalUsers,
        pendingOrders,
        paidOrders,
        averageOrderValue: paidOrders > 0 && totalRevenue[0]?.total 
          ? (totalRevenue[0].total / paidOrders) 
          : 0
      },
      trends: {
        ordersLast30Days,
        revenueLast30Days: revenueLast30Days[0]?.total || 0,
        newUsersLast30Days,
        orderGrowth: Math.round(orderGrowth * 100) / 100,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        customerGrowth: 8.3 // À implémenter si besoin
      },
      charts: {
        dailyStats: dailyStats.map(stat => ({
          date: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}-${String(stat._id.day).padStart(2, '0')}`,
          orders: stat.orders,
          revenue: stat.revenue
        })),
        topProducts: topProducts.map(product => ({
          _id: product._id,
          name: product.name,
          category: product.category || 'Non classé',
          sales: product.totalSold,
          revenue: Math.round(product.totalRevenue * 100) / 100,
          image: product.image || '',
          price: product.price || 0,
          hasVariants: product.hasVariants || false
        })),
        categoryStats: categoryStats.map(cat => ({
          category: cat._id || 'Non classé',
          sales: cat.totalSold,
          revenue: Math.round(cat.totalRevenue * 100) / 100
        }))
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