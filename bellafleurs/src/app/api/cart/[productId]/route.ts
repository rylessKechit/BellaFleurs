// src/app/api/cart/[productId]/route.ts - Version MongoDB complète
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

// PUT /api/cart/[productId] - Mettre à jour la quantité
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const { quantity } = await request.json();
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

    // Vérifier si le produit existe dans le panier
    const itemIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === productId
    );
    
    if (itemIndex === -1) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Produit introuvable dans le panier',
          code: 'PRODUCT_NOT_IN_CART'
        }
      }, { status: 404 });
    }

    // Vérifier le stock disponible du produit
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Produit introuvable',
          code: 'PRODUCT_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Mettre à jour la quantité via la méthode du modèle
    await cart.updateQuantity(productId, quantity);

    return NextResponse.json({
      success: true,
      data: {
        cart: {
          id: cart._id,
          items: cart.items,
          totalItems: cart.totalItems,
          totalAmount: cart.totalAmount,
          isEmpty: cart.isEmpty
        },
        message: 'Quantité mise à jour'
      }
    });

  } catch (error: any) {
    console.error('❌ Cart UPDATE error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: error.message || 'Erreur lors de la mise à jour',
        code: 'CART_UPDATE_ERROR'
      }
    }, { status: 500 });
  }
}

// DELETE /api/cart/[productId] - Supprimer un article
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
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

    // Vérifier si le produit existe dans le panier
    const itemExists = cart.items.some(
      (item: any) => item.product.toString() === productId
    );

    if (!itemExists) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Produit introuvable dans le panier',
          code: 'PRODUCT_NOT_IN_CART'
        }
      }, { status: 404 });
    }

    // Supprimer l'article via la méthode du modèle
    await cart.removeItem(productId);

    return NextResponse.json({
      success: true,
      data: {
        cart: {
          id: cart._id,
          items: cart.items,
          totalItems: cart.totalItems,
          totalAmount: cart.totalAmount,
          isEmpty: cart.isEmpty
        },
        message: 'Produit supprimé du panier'
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