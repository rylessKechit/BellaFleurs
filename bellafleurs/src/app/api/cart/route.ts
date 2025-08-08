// src/app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

// Simulation d'un store de panier en mémoire (en prod, utilisez Redis ou la DB)
const cartStore = new Map<string, CartItem[]>();

// GET /api/cart - Récupérer le panier de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Pour les utilisateurs non connectés, utiliser une session temporaire
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

    const cartItems = cartStore.get(sessionId) || [];
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      success: true,
      data: {
        items: cartItems,
        total,
        itemsCount
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
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const { productId, name, price, quantity = 1, image, stock } = body;

    // Validation
    if (!productId || !name || !price || !image) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Données produit manquantes',
          code: 'MISSING_PRODUCT_DATA'
        }
      }, { status: 400 });
    }

    if (quantity < 1 || quantity > stock) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Quantité invalide',
          code: 'INVALID_QUANTITY'
        }
      }, { status: 400 });
    }

    // Générer un sessionId pour les utilisateurs non connectés
    let sessionId = session?.user?.id;
    let response = NextResponse.json({ success: true, message: 'Produit ajouté au panier' });
    
    if (!sessionId) {
      sessionId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      response.cookies.set('cart_session', sessionId, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });
    }

    const cartItems = cartStore.get(sessionId) || [];
    
    // Vérifier si le produit existe déjà dans le panier
    const existingItemIndex = cartItems.findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      // Mettre à jour la quantité
      const newQuantity = cartItems[existingItemIndex].quantity + quantity;
      
      if (newQuantity > stock) {
        return NextResponse.json({
          success: false,
          error: {
            message: `Stock insuffisant. Stock disponible: ${stock}`,
            code: 'INSUFFICIENT_STOCK'
          }
        }, { status: 400 });
      }
      
      cartItems[existingItemIndex].quantity = newQuantity;
    } else {
      // Ajouter nouveau produit
      cartItems.push({
        productId,
        name,
        price,
        quantity,
        image,
        stock
      });
    }

    cartStore.set(sessionId, cartItems);

    return response;

  } catch (error: any) {
    console.error('❌ Cart POST error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de l\'ajout au panier',
        code: 'CART_ADD_ERROR'
      }
    }, { status: 500 });
  }
}