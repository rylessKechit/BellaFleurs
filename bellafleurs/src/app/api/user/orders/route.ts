// src/app/api/user/orders/route.ts - Version corrigée
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Authentification requise',
          code: 'AUTH_REQUIRED'
        }
      }, { status: 401 });
    }

    // Connexion à la base de données
    await connectDB();

    // Récupérer les paramètres de pagination
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Récupérer les commandes de l'utilisateur
    const orders = await Order.find({ 
      $or: [
        { user: session.user.id }, // Utilisateurs connectés
        { 'customerInfo.email': session.user.email } // Commandes d'invités avec même email
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('items.product', 'name images')
    .lean();

    // Compter le total
    const total = await Order.countDocuments({ 
      $or: [
        { user: session.user.id },
        { 'customerInfo.email': session.user.email }
      ]
    });

    // Formater les données avec gestion des propriétés optionnelles
    const formattedOrders = orders.map((order: any) => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      items: order.items?.map((item: any) => ({
        _id: item._id,
        product: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })) || [],
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      deliveryInfo: order.deliveryInfo,
      customerInfo: order.customerInfo,
      timeline: order.timeline || [],
      createdAt: order.createdAt,
      estimatedDelivery: order.estimatedDelivery || null
    }));

    return NextResponse.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error: any) {
    console.error('❌ User orders GET error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des commandes',
        code: 'ORDERS_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}