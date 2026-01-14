// src/app/api/corporate/dashboard/stats/route.ts - CORRIGÉ pour inclure pending_monthly
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Non authentifié',
          code: 'UNAUTHENTICATED'
        }
      }, { status: 401 });
    }

    await connectDB();

    // Calculer le début du mois actuel
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // ✅ CORRECTION : Récupérer les commandes corporate de cet utilisateur avec TOUS les statuts appropriés
    const [
      currentMonthOrders,
      lastMonthOrders,
      totalOrders,
      totalAmount
    ] = await Promise.all([
      // Commandes du mois actuel
      Order.find({
        user: session.user.id,
        paymentMethod: 'corporate_monthly', // ✅ Identifier les commandes corporate
        createdAt: { $gte: startOfMonth }
      }).select('totalAmount createdAt status paymentStatus'),

      // Commandes du mois dernier (pour comparaison)
      Order.find({
        user: session.user.id,
        paymentMethod: 'corporate_monthly',
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
      }).select('totalAmount'),

      // Total toutes commandes
      Order.countDocuments({
        user: session.user.id,
        paymentMethod: 'corporate_monthly'
      }),

      // Montant total toutes commandes (payées + pending_monthly)
      Order.aggregate([
        { 
          $match: { 
            user: session.user.id,
            paymentMethod: 'corporate_monthly',
            $or: [
              { paymentStatus: 'paid' },
              { paymentStatus: 'pending_monthly' } // ✅ INCLURE PENDING MONTHLY
            ]
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    // Calculer les montants
    const currentMonthAmount = currentMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const lastMonthAmount = lastMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculer la croissance mensuelle
    const monthlyGrowth = lastMonthAmount > 0 
      ? ((currentMonthAmount - lastMonthAmount) / lastMonthAmount) * 100 
      : currentMonthAmount > 0 ? 100 : 0;

    // Récupérer les données utilisateur pour les limites
    const User = (await import('@/models/User')).default;
    const userData = await User.findById(session.user.id).select('corporateSettings');

    const monthlyLimit = userData?.corporateSettings?.monthlyLimit || 1000;

    // Stats détaillées par statut
    const ordersByStatus = currentMonthOrders.reduce((acc: any, order) => {
      const status = order.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      currentMonth: {
        amount: Math.round(currentMonthAmount * 100) / 100,
        count: currentMonthOrders.length,
        limit: monthlyLimit,
        remainingBudget: Math.max(0, monthlyLimit - currentMonthAmount),
        utilizationPercent: monthlyLimit > 0 ? Math.round((currentMonthAmount / monthlyLimit) * 100) : 0
      },
      lastMonth: {
        amount: Math.round(lastMonthAmount * 100) / 100,
        count: lastMonthOrders.length
      },
      growth: {
        monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
        isPositive: monthlyGrowth >= 0
      },
      totals: {
        allTimeOrders: totalOrders,
        allTimeAmount: Math.round((totalAmount[0]?.total || 0) * 100) / 100
      },
      breakdown: {
        ordersByStatus,
        averageOrderValue: currentMonthOrders.length > 0 
          ? Math.round((currentMonthAmount / currentMonthOrders.length) * 100) / 100
          : 0
      }
    };

    return NextResponse.json({
      success: true,
      data: { stats }
    });

  } catch (error: any) {
    console.error('❌ Corporate dashboard stats error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des statistiques',
        code: 'STATS_ERROR'
      }
    }, { status: 500 });
  }
}