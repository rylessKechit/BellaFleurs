// src/app/api/cart/route.ts - Fichier complet
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
      const sessionId = request.cookies.get('cart_session')?.value;
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

    const { 
      productId, 
      quantity = 1, 
      variantId, 
      variantName, 
      variantIndex, 
      customPrice 
    } = await request.json();

    console.log('🛒 POST Cart - Données reçues:', {
      productId,
      quantity,
      variantId,
      variantName,
      variantIndex,
      customPrice
    });

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

    const session = await getServerSession(authOptions);
    let sessionId = session?.user?.id;
    
    // Créer une session temporaire si pas connecté
    if (!sessionId) {
      sessionId = request.cookies.get('cart_session')?.value || uuidv4();
    }

    // Vérifier que le produit existe
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

    if (!product.isActive) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Ce produit n\'est plus disponible',
          code: 'PRODUCT_INACTIVE'
        }
      }, { status: 400 });
    }

    // ✅ Gestion flexible des variants
    let finalPrice = product.price || 0;
    let finalVariantId: string | undefined;
    let finalVariantName: string | undefined;

    if (product.hasVariants && product.variants?.length > 0) {
      let variant = null;
      
      console.log('🔍 Recherche variant dans:', product.variants);
      
      // Recherche flexible par plusieurs méthodes
      if (variantId) {
        // Méthode 1: Par _id MongoDB
        variant = product.variants.find((v: any) => 
          v._id && v._id.toString() === variantId
        );
        console.log('🔍 Recherche par _id:', variant ? 'TROUVÉ' : 'NON TROUVÉ');
        
        // Méthode 2: Par stableId généré
        if (!variant) {
          variant = product.variants.find((v: any, index: number) => {
            const stableId = v._id?.toString() || `variant_${index}_${v.name?.replace(/\s+/g, '_').toLowerCase()}`;
            return stableId === variantId;
          });
          console.log('🔍 Recherche par stableId:', variant ? 'TROUVÉ' : 'NON TROUVÉ');
        }
        
        // Méthode 3: Par nom
        if (!variant && variantName) {
          variant = product.variants.find((v: any) => 
            v.name === variantName
          );
          console.log('🔍 Recherche par nom:', variant ? 'TROUVÉ' : 'NON TROUVÉ');
        }
        
        // Méthode 4: Par index
        if (!variant && typeof variantIndex === 'number' && variantIndex >= 0) {
          variant = product.variants[variantIndex];
          console.log('🔍 Recherche par index:', variant ? 'TROUVÉ' : 'NON TROUVÉ');
        }
      }
      
      // Méthode 5: Par nom seul
      if (!variant && variantName) {
        variant = product.variants.find((v: any) => v.name === variantName);
        console.log('🔍 Recherche par nom seul:', variant ? 'TROUVÉ' : 'NON TROUVÉ');
      }
      
      if (!variant) {
        console.error('❌ Aucun variant trouvé avec:', {
          variantId,
          variantName,
          variantIndex,
          availableVariants: product.variants.map((v: any, i: number) => ({
            index: i,
            _id: v._id,
            name: v.name,
            stableId: v._id?.toString() || `variant_${i}_${v.name?.replace(/\s+/g, '_').toLowerCase()}`
          }))
        });
        
        return NextResponse.json({
          success: false,
          error: {
            message: 'Taille sélectionnée introuvable',
            code: 'VARIANT_NOT_FOUND'
          }
        }, { status: 400 });
      }
      
      if (variant.isActive === false) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Cette taille n\'est plus disponible',
            code: 'VARIANT_INACTIVE'
          }
        }, { status: 400 });
      }
      
      finalPrice = variant.price;
      finalVariantName = variant.name;
      finalVariantId = variant._id?.toString() || 
                     `${variantName}_${variant.price}` || 
                     variantId;
      
      console.log('✅ Variant trouvé:', {
        method: variant._id ? 'MongoDB ID' : 'Fallback',
        name: finalVariantName,
        price: finalPrice,
        id: finalVariantId
      });
    } else if (customPrice) {
      finalPrice = customPrice;
    }

    // Trouver ou créer le panier
    let cart;
    if (session?.user?.id) {
      cart = await Cart.findByUser(session.user.id);
      if (!cart) {
        cart = new Cart({
          user: session.user.id,
          items: [],
          totalItems: 0,
          totalAmount: 0
        });
        await cart.save();
        console.log('✅ Nouveau panier utilisateur créé:', cart._id);
      }
    } else {
      cart = await Cart.findBySession(sessionId);
      if (!cart) {
        cart = new Cart({
          sessionId: sessionId,
          items: [],
          totalItems: 0,
          totalAmount: 0
        });
        await cart.save();
        console.log('✅ Nouveau panier session créé:', cart._id);
      }
    }

    // Ajouter l'item au panier
    await cart.addItem(
      productId,
      quantity,
      finalVariantId,
      finalVariantName,
      finalPrice
    );

    console.log('✅ Item ajouté au panier:', {
      productId,
      quantity,
      variantId: finalVariantId,
      variantName: finalVariantName,
      price: finalPrice
    });

    // ✅ Préparer la réponse avec cartItemsCount
    const response = NextResponse.json({
      success: true,
      data: {
        message: 'Produit ajouté au panier',
        cartItemsCount: cart.totalItems, // ✅ IMPORTANT pour l'incrémentation
        cartTotal: cart.totalAmount,
        cart: cart
      }
    });

    // Définir le cookie de session si nécessaire
    if (!session?.user?.id) {
      response.cookies.set('cart_session', sessionId, {
        maxAge: 30 * 24 * 60 * 60, // 30 jours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }

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

// PUT /api/cart - Mettre à jour un item du panier
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const { productId, quantity, variantId, variantName, variantIndex } = await request.json();

    console.log('🔄 PUT Cart - Données reçues:', {
      productId,
      quantity,
      variantId,
      variantName,
      variantIndex
    });

    if (!productId || quantity < 1) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Données invalides',
          code: 'INVALID_DATA'
        }
      }, { status: 400 });
    }

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

    // Trouver le panier
    let cart;
    if (session?.user?.id) {
      cart = await Cart.findByUser(session.user.id);
    } else {
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

    // Recherche flexible pour trouver le variant
    const product = await Product.findById(productId);
    let finalVariantId = variantId;

    if (product?.hasVariants && product.variants?.length > 0 && !finalVariantId) {
      let variant = null;
      
      if (variantName) {
        variant = product.variants.find((v: any) => v.name === variantName);
      } else if (typeof variantIndex === 'number') {
        variant = product.variants[variantIndex];
      }
      
      if (variant) {
        finalVariantId = variant._id?.toString() || `${variant.name}_${variant.price}`;
      }
    }

    // Mettre à jour la quantité
    await cart.updateQuantity(productId, quantity, finalVariantId);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Quantité mise à jour',
        cartItemsCount: cart.totalItems,
        cartTotal: cart.totalAmount,
        cart: cart
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

// DELETE /api/cart - Supprimer un item du panier
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const variantId = url.searchParams.get('variantId') || undefined;

    if (!productId) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'ID produit requis',
          code: 'MISSING_PRODUCT_ID'
        }
      }, { status: 400 });
    }

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

    // Trouver le panier
    let cart;
    if (session?.user?.id) {
      cart = await Cart.findByUser(session.user.id);
    } else {
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

    // Supprimer l'item
    await cart.removeItem(productId, variantId);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Article supprimé du panier',
        cartItemsCount: cart.totalItems,
        cartTotal: cart.totalAmount,
        cart: cart
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