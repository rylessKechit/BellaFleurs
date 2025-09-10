// src/app/api/cart/route.ts - Version MongoDB complète
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';

// GET /api/cart - Récupérer le panier de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const sessionId = session?.user?.id || request.cookies.get('cart_session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          total: 0,
          itemsCount: 0
        }
      });
    }

    // Récupérer le panier depuis MongoDB
    let cart = null;
    if (session?.user?.id) {
      cart = await Cart.findByUser(session.user.id);
    } else if (sessionId) {
      cart = await Cart.findBySession(sessionId);
    }

    if (!cart) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          total: 0,
          itemsCount: 0
        }
      });
    }

    // Populer les informations des produits
    await cart.populate('items.product', 'name images price stock isActive');

    // Formatter les données pour le frontend
    const formattedItems = cart.items.map((item: any) => ({
      _id: item.product._id.toString(),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      stock: item.product?.stock || 0,
      isActive: item.product?.isActive || false
    }));

    return NextResponse.json({
      success: true,
      data: {
        items: formattedItems,
        total: cart.totalAmount,
        itemsCount: cart.totalItems
      }
    });

  } catch (error: any) {
    console.error('❌ Cart GET error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération du panier',
        code: 'CART_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}

// POST /api/cart - Ajouter un article au panier
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const { productId, quantity = 1 } = body;

    // Validation
    if (!productId) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'ID produit requis',
          code: 'MISSING_PRODUCT_ID'
        }
      }, { status: 400 });
    }

    if (quantity < 1 || quantity > 50) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Quantité invalide (1-50)',
          code: 'INVALID_QUANTITY'
        }
      }, { status: 400 });
    }

    // Vérifier que le produit existe
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Produit introuvable ou indisponible',
          code: 'PRODUCT_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Vérifier le stock
    if (product.stock < quantity) {
      return NextResponse.json({
        success: false,
        error: {
          message: `Stock insuffisant. Stock disponible: ${product.stock}`,
          code: 'INSUFFICIENT_STOCK'
        }
      }, { status: 400 });
    }

    // Gérer la session
    let sessionId = session?.user?.id;
    let response = NextResponse.json({ 
      success: true, 
      message: 'Produit ajouté au panier',
      data: { productId, quantity, productName: product.name }
    });
    
    if (!sessionId) {
      sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      response.cookies.set('cart_session', sessionId, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }

    // Trouver ou créer le panier
    let cart = null;
    if (session?.user?.id) {
      cart = await Cart.findByUser(session.user.id);
    } else {
      cart = await Cart.findBySession(sessionId);
    }

    if (!cart) {
      // Créer un nouveau panier
      cart = new Cart({
        user: session?.user?.id || undefined,
        sessionId: !session?.user?.id ? sessionId : undefined,
        items: [],
        totalItems: 0,
        totalAmount: 0
      });
    }

    // Ajouter le produit au panier via la méthode du modèle
    await cart.addItem(productId, quantity);

    return response;

  } catch (error: any) {
    console.error('❌ Cart POST error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: error.message || 'Erreur lors de l\'ajout au panier',
        code: 'CART_ADD_ERROR'
      }
    }, { status: 500 });
  }
}