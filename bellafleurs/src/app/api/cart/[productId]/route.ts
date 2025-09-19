// src/app/api/cart/[productId]/route.ts - Version MongoDB complète avec variants
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';

interface RouteParams {
  params: {
    productId: string;
  };
}

// PUT /api/cart/[productId] - Mettre à jour la quantité (avec support variants)
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const { quantity, variantId } = await request.json(); // NOUVEAU : variantId
    const { productId } = params;

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

    if (quantity < 1) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Quantité invalide',
          code: 'INVALID_QUANTITY'
        }
      }, { status: 400 });
    }

    // Trouver le panier
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

    // MISE À JOUR : Chercher l'item avec support variants
    const getItemKey = (pId: string, vId?: string) => vId ? `${pId}-${vId}` : pId;
    const targetItemKey = getItemKey(productId, variantId);
    
    const itemIndex = cart.items.findIndex((item: any) => {
      const itemProductId = item.product._id 
        ? item.product._id.toString()
        : item.product.toString();
      const existingItemKey = getItemKey(itemProductId, item.variantId);
      return existingItemKey === targetItemKey;
    });

    if (itemIndex === -1) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Article introuvable dans le panier',
          code: 'ITEM_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Mettre à jour la quantité
    await cart.updateQuantity(productId, quantity, variantId);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Quantité mise à jour',
        cartItemsCount: cart.totalItems,
        cartTotal: cart.totalAmount
      }
    });

  } catch (error: any) {
    console.error('❌ Cart PUT error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: error.message || 'Erreur lors de la mise à jour',
        code: 'CART_UPDATE_ERROR'
      }
    }, { status: 500 });
  }
}

// DELETE /api/cart/[productId] - Supprimer un article du panier (avec support variants)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const { productId } = params;
    
    // NOUVEAU : Récupérer variantId depuis query params
    const url = new URL(request.url);
    const variantId = url.searchParams.get('variantId') || undefined;

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

    // Trouver le panier
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

    // NOUVEAU : Supprimer avec support variants
    await cart.removeItem(productId, variantId);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Article supprimé du panier',
        cartItemsCount: cart.totalItems,
        cartTotal: cart.totalAmount
      }
    });

  } catch (error: any) {
    console.error('❌ Cart DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: error.message || 'Erreur lors de la suppression',
        code: 'CART_DELETE_ERROR'
      }
    }, { status: 500 });
  }
}