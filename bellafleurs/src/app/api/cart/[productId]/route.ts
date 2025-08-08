// src/app/api/cart/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    const cartItems = cartStore.get(sessionId) || [];
    const itemIndex = cartItems.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Produit introuvable dans le panier',
          code: 'PRODUCT_NOT_IN_CART'
        }
      }, { status: 404 });
    }

    const item = cartItems[itemIndex];
    
    if (quantity > item.stock) {
      return NextResponse.json({
        success: false,
        error: {
          message: `Stock insuffisant. Stock disponible: ${item.stock}`,
          code: 'INSUFFICIENT_STOCK'
        }
      }, { status: 400 });
    }

    cartItems[itemIndex].quantity = quantity;
    cartStore.set(sessionId, cartItems);

    return NextResponse.json({
      success: true,
      message: 'Quantité mise à jour'
    });

  } catch (error: any) {
    console.error('❌ Cart UPDATE error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour',
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

    const cartItems = cartStore.get(sessionId) || [];
    const filteredItems = cartItems.filter(item => item.productId !== productId);
    
    cartStore.set(sessionId, filteredItems);

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé du panier'
    });

  } catch (error: any) {
    console.error('❌ Cart DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la suppression',
        code: 'CART_DELETE_ERROR'
      }
    }, { status: 500 });
  }
}