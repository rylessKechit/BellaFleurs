// src/app/api/admin/products/route.ts - API admin pour lister les produits avec variants
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { createProductSchema } from '@/lib/validations';
import { IProduct, IProductVariant } from '@/../types';
import { z } from 'zod';

// Helper pour vérifier les droits admin
async function checkAdminAccess(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    return session?.user?.role === 'admin';
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

// Helper pour formater un produit avec gestion des variants
function formatProductResponse(product: any) {
  let displayPrice: number;
  let priceRangeFormatted: string;
  
  if (!product.hasVariants) {
    displayPrice = product.price || 0;
    priceRangeFormatted = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(displayPrice);
  } else {
    const activeVariants = product.variants.filter((v: IProductVariant) => v.isActive);
    
    if (activeVariants.length === 0) {
      displayPrice = 0;
      priceRangeFormatted = 'Prix non disponible';
    } else {
      const prices = activeVariants.map((v: IProductVariant) => v.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      displayPrice = activeVariants[0].price;
      
      const formatter = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      });
      
      if (minPrice === maxPrice) {
        priceRangeFormatted = formatter.format(minPrice);
      } else {
        priceRangeFormatted = `${formatter.format(minPrice)} - ${formatter.format(maxPrice)}`;
      }
    }
  }

  const displayPriceFormatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(displayPrice);

  return {
    ...product,
    displayPrice,
    displayPriceFormatted,
    priceRangeFormatted,
  };
}

// Helper pour générer un slug unique
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// GET /api/admin/products - Récupérer tous les produits (admin)
export async function GET(req: NextRequest) {
  try {
    if (!await checkAdminAccess()) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès refusé. Droits administrateur requis.',
          code: 'ACCESS_DENIED'
        }
      }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const hasVariants = searchParams.get('hasVariants');

    const query: Record<string, any> = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Filtre par type de produit (avec ou sans variants)
    if (hasVariants === 'true') {
      query.hasVariants = true;
    } else if (hasVariants === 'false') {
      query.hasVariants = false;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    // Formater les produits avec les prix d'affichage
    const formattedProducts = products.map((product: any) => formatProductResponse(product));

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error: unknown) {
    console.error('❌ Admin products GET error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des produits',
        code: 'PRODUCTS_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}

// POST /api/admin/products - Créer un nouveau produit (admin)
export async function POST(req: NextRequest) {
  try {
    if (!await checkAdminAccess()) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès refusé. Droits administrateur requis.',
          code: 'ACCESS_DENIED'
        }
      }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    
    // Validation avec le schéma
    const validatedData = createProductSchema.parse(body);

    const {
      name,
      description,
      price,
      hasVariants,
      variants,
      images,
      category,
      tags,
      entretien,
      careInstructions,
      composition,
      motsClesSEO
    } = validatedData;

    // Validation côté serveur
    if (!hasVariants && (!price || price <= 0)) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Le prix est requis pour les produits sans variants',
          code: 'MISSING_PRICE'
        }
      }, { status: 400 });
    }

    if (hasVariants && (!variants || variants.length === 0)) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Au moins une variante est requise pour les produits avec variants',
          code: 'MISSING_VARIANTS'
        }
      }, { status: 400 });
    }

    // Génération du slug unique
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;
    
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Traitement des variants si applicable
    let processedVariants: IProductVariant[] = [];
    if (hasVariants && variants) {
      processedVariants = variants.map((variant: any, index: number) => ({
        name: variant.name.trim(),
        price: variant.price,
        description: variant.description?.trim() || '',
        image: variant.image || '',
        isActive: variant.isActive !== false,
        order: variant.order !== undefined ? variant.order : index
      }));
      
      // Trier par ordre
      processedVariants.sort((a: IProductVariant, b: IProductVariant) => a.order - b.order);
    }

    // Créer le produit
    const productData: Partial<IProduct> = {
      name: name.trim(),
      description: description.trim(),
      hasVariants,
      variants: processedVariants,
      images,
      category: category as IProduct['category'],
      isActive: true,
      tags: tags.map((tag: string) => tag.toLowerCase().trim()),
      slug,
      entretien: entretien?.trim() || '',
      careInstructions: careInstructions?.trim() || '',
      composition: composition?.trim() || '',
      motsClesSEO: motsClesSEO.map((mot: string) => mot.trim()),
      averageRating: 0,
      reviewsCount: 0
    };

    // Ajouter le prix seulement si pas de variants
    if (!hasVariants) {
      productData.price = price;
    }

    const product = new Product(productData);
    await product.save();

    const formattedProduct = formatProductResponse(product.toObject());

    return NextResponse.json({
      success: true,
      data: { product: formattedProduct },
      message: 'Produit créé avec succès'
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('❌ Admin product POST error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Données invalides',
          code: 'VALIDATION_ERROR',
          details: error.errors
        }
      }, { status: 400 });
    }

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      const validationError = error as any;
      const validationErrors = Object.values(validationError.errors).map((err: any) => err.message);
      return NextResponse.json({
        success: false,
        error: {
          message: `Erreurs de validation: ${validationErrors.join(', ')}`,
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Un produit avec ce slug existe déjà',
          code: 'DUPLICATE_SLUG'
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la création du produit',
        code: 'PRODUCT_CREATION_ERROR'
      }
    }, { status: 500 });
  }
}