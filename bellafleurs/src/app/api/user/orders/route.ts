// src/app/api/user/orders/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(req: NextRequest) {
  try {
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

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const orders = await Order.find({ 
      $or: [
        { user: session.user.id },
        { 'customerInfo.email': session.user.email }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('items.product', 'name images')
    .lean();

    const total = await Order.countDocuments({ 
      $or: [
        { user: session.user.id },
        { 'customerInfo.email': session.user.email }
      ]
    });

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