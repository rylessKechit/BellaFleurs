// src/app/api/cart/clear/route.ts - Vider le panier
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';

// POST /api/cart/clear - Vider le panier
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const sessionId = session?.user?.id || request.cookies.get('cart_session')?.value;

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Session introuvable',
          code: 'NO_SESSION'
        }
      }, { status: 400 });
    }

    // Chercher le panier existant dans MongoDB
    let cart = null;
    if (session?.user?.id) {
      cart = await Cart.findByUser(session.user.id);
    } else if (sessionId) {
      cart = await Cart.findBySession(sessionId);
    }

    if (!cart) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Panier introuvable',
          code: 'CART_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Vider le panier dans la base de données
    await cart.clearItems();

    const response = NextResponse.json({
      success: true,
      data: {
        cart: {
          id: cart._id,
          items: cart.items,
          totalItems: cart.totalItems,
          totalAmount: cart.totalAmount,
          isEmpty: cart.isEmpty
        },
        message: 'Panier vidé'
      }
    });

    // Supprimer le cookie de session si c'était un panier invité
    if (!session?.user?.id) {
      response.cookies.set('cart_session', '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }

    return response;

  } catch (error: any) {
    console.error('❌ Cart CLEAR error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur serveur lors de la suppression du panier',
        code: 'INTERNAL_SERVER_ERROR'
      }
    }, { status: 500 });
  }
}