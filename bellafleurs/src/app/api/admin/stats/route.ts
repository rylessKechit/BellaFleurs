// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';

export async function GET(req: NextRequest) {
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

    // Calculer les dates pour les comparaisons
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Récupérer les statistiques en parallèle
    const [
      // Statistiques du mois en cours
      currentMonthOrders,
      currentMonthRevenue,
      currentMonthCustomers,
      currentMonthProducts,
      
      // Statistiques du mois précédent
      lastMonthOrders,
      lastMonthRevenue,
      lastMonthCustomers,
      lastMonthProducts,
      
      // Totaux généraux
      totalOrders,
      totalCustomers,
      totalProducts
    ] = await Promise.all([
      // Mois en cours
      Order.countDocuments({
        createdAt: { $gte: thisMonth, $lte: now }
      }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: thisMonth, $lte: now },
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]),
      User.countDocuments({
        role: 'client',
        createdAt: { $gte: thisMonth, $lte: now }
      }),
      Product.countDocuments({
        createdAt: { $gte: thisMonth, $lte: now }
      }),
      
      // Mois précédent
      Order.countDocuments({
        createdAt: { $gte: lastMonth, $lte: lastMonthEnd }
      }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: lastMonth, $lte: lastMonthEnd },
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]),
      User.countDocuments({
        role: 'client',
        createdAt: { $gte: lastMonth, $lte: lastMonthEnd }
      }),
      Product.countDocuments({
        createdAt: { $gte: lastMonth, $lte: lastMonthEnd }
      }),
      
      // Totaux
      Order.countDocuments(),
      User.countDocuments({ role: 'client' }),
      Product.countDocuments({ isActive: true })
    ]);

    // Calculer les revenus
    const currentRevenue = currentMonthRevenue[0]?.total || 0;
    const lastRevenue = lastMonthRevenue[0]?.total || 0;
    
    // Calculer le chiffre d'affaires total
    const totalRevenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Calculer les taux de croissance
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100 * 10) / 10;
    };

    const stats = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      totalCustomers,
      totalProducts,
      revenueGrowth: calculateGrowth(currentRevenue, lastRevenue),
      ordersGrowth: calculateGrowth(currentMonthOrders, lastMonthOrders),
      customersGrowth: calculateGrowth(currentMonthCustomers, lastMonthCustomers),
      productsGrowth: calculateGrowth(currentMonthProducts, lastMonthProducts)
    };

    // Statistiques supplémentaires
    const additionalStats = await Promise.all([
      // Commandes par statut
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Revenus par mois (6 derniers mois)
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1)
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]),
      
      // Top 5 des créations les plus commandées
      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            name: { $first: '$items.name' },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 }
      ])
    ]);

    const [ordersByStatus, monthlyRevenue, topProducts] = additionalStats;

    return NextResponse.json({
      success: true,
      data: {
        stats,
        ordersByStatus,
        monthlyRevenue,
        topProducts,
        period: {
          currentMonth: {
            start: thisMonth.toISOString(),
            end: now.toISOString()
          },
          lastMonth: {
            start: lastMonth.toISOString(),
            end: lastMonthEnd.toISOString()
          }
        }
      }
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