// src/app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { v4 as uuidv4 } from 'uuid';

// GET /api/cart - Récupérer le panier
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    let cart;

    if (session?.user) {
      const userId = (session.user as any).id;
      cart = await Cart.findByUser(userId);
    } else {
      const sessionId = request.cookies.get('cart-session')?.value;
      if (sessionId) {
        cart = await Cart.findBySession(sessionId);
      }
    }

    if (!cart) {
      return NextResponse.json({
        success: true,
        data: {
          cart: {
            items: [],
            totalItems: 0,
            totalAmount: 0
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: { cart }
    });

  } catch (error) {
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

// POST /api/cart - Ajouter un item au panier
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { productId, quantity = 1, variantId, variantName, customPrice } = await request.json();

    // Validation des données de base
    if (!productId || !quantity || quantity < 1 || quantity > 50) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Données invalides',
          code: 'INVALID_DATA'
        }
      }, { status: 400 });
    }

    // Récupérer le produit
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Produit non trouvé ou inactif',
          code: 'PRODUCT_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Déterminer le prix selon le type de produit
    let finalPrice: number;
    let finalVariantId: string | undefined;
    let finalVariantName: string | undefined;

    if (product.pricingType === 'custom_range' && product.customPricing) {
      if (!customPrice || customPrice < product.customPricing.minPrice || customPrice > product.customPricing.maxPrice) {
        return NextResponse.json({
          success: false,
          error: {
            message: `Le prix doit être entre ${product.customPricing.minPrice}€ et ${product.customPricing.maxPrice}€`,
            code: 'INVALID_CUSTOM_PRICE'
          }
        }, { status: 400 });
      }
      finalPrice = customPrice;
    } else if (product.hasVariants && variantId) {
      const variant = product.variants.find(v => v._id?.toString() === variantId && v.isActive);
      if (!variant) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Variant non trouvé ou inactif',
            code: 'VARIANT_NOT_FOUND'
          }
        }, { status: 400 });
      }
      finalPrice = variant.price;
      finalVariantId = variantId;
      finalVariantName = variantName || variant.name;
    } else {
      if (!product.price) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Prix du produit non défini',
            code: 'PRICE_NOT_DEFINED'
          }
        }, { status: 400 });
      }
      finalPrice = product.price;
    }

    // Récupérer ou créer le panier
    const session = await getServerSession(authOptions);
    let cart;

    if (session?.user) {
      const userId = (session.user as any).id;
      cart = await Cart.findOrCreateCart(userId);
    } else {
      let sessionId = request.cookies.get('cart-session')?.value;
      if (!sessionId) {
        sessionId = uuidv4();
      }
      cart = await Cart.findOrCreateCart(undefined, sessionId);
    }

    // Ajouter l'item au panier
    const updatedCart = await cart.addItem(
      productId, 
      quantity, 
      finalVariantId, 
      finalVariantName, 
      finalPrice
    );

    const response = NextResponse.json({
      success: true,
      data: { cart: updatedCart },
      message: 'Produit ajouté au panier'
    });

    // Définir le cookie de session si nécessaire
    if (!session?.user) {
      const sessionId = request.cookies.get('cart-session')?.value || uuidv4();
      response.cookies.set('cart-session', sessionId, {
        maxAge: 60 * 60 * 24 * 7, // 7 jours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }

    return response;

  } catch (error) {
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

// PUT /api/cart - Mettre à jour un item du panier
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const { productId, quantity, variantId } = await request.json();

    if (!productId || !quantity || quantity < 1 || quantity > 50) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Données invalides',
          code: 'INVALID_DATA'
        }
      }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    let cart;

    if (session?.user) {
      const userId = (session.user as any).id;
      cart = await Cart.findByUser(userId);
    } else {
      const sessionId = request.cookies.get('cart-session')?.value;
      if (sessionId) {
        cart = await Cart.findBySession(sessionId);
      }
    }

    if (!cart) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Panier non trouvé',
          code: 'CART_NOT_FOUND'
        }
      }, { status: 404 });
    }

    const updatedCart = await cart.updateQuantity(productId, quantity, variantId);

    return NextResponse.json({
      success: true,
      data: { cart: updatedCart },
      message: 'Panier mis à jour'
    });

  } catch (error) {
    console.error('❌ Cart PUT error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour du panier',
        code: 'CART_UPDATE_ERROR'
      }
    }, { status: 500 });
  }
}

// DELETE /api/cart - Supprimer un item ou vider le panier
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const variantId = url.searchParams.get('variantId');
    const clearAll = url.searchParams.get('clearAll') === 'true';

    const session = await getServerSession(authOptions);
    let cart;

    if (session?.user) {
      const userId = (session.user as any).id;
      cart = await Cart.findByUser(userId);
    } else {
      const sessionId = request.cookies.get('cart-session')?.value;
      if (sessionId) {
        cart = await Cart.findBySession(sessionId);
      }
    }

    if (!cart) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Panier non trouvé',
          code: 'CART_NOT_FOUND'
        }
      }, { status: 404 });
    }

    let updatedCart;

    if (clearAll) {
      updatedCart = await cart.clearItems();
    } else if (productId) {
      updatedCart = await cart.removeItem(productId, variantId || undefined);
    } else {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Paramètres manquants',
          code: 'MISSING_PARAMS'
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: { cart: updatedCart },
      message: clearAll ? 'Panier vidé' : 'Produit supprimé du panier'
    });

  } catch (error) {
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