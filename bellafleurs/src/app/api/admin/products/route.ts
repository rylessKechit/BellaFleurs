// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { IProduct, IProductVariant } from '@/types/index';
import { z } from 'zod';

// Helper pour vérifier les droits admin
async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin';
}

// Helper pour formater la réponse produit
function formatProductResponse(product: any): any {
  return {
    _id: product._id,
    name: product.name,
    description: product.description,
    price: product.price,
    hasVariants: product.hasVariants,
    variants: product.variants || [],
    pricingType: product.pricingType || 'fixed',
    customPricing: product.customPricing,
    category: product.category,
    images: product.images || [],
    isActive: product.isActive,
    tags: product.tags || [],
    slug: product.slug,
    entretien: product.entretien,
    careInstructions: product.careInstructions,
    composition: product.composition,
    motsClesSEO: product.motsClesSEO || [],
    averageRating: product.averageRating || 0,
    reviewsCount: product.reviewsCount || 0,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
}

// GET /api/admin/products - Liste des produits (admin)
export async function GET(request: NextRequest) {
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

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    // Construire le filtre
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }

    // Construire le tri
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Requête avec pagination
    const skip = (page - 1) * limit;
    
    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);

    const formattedProducts = products.map(formatProductResponse);

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit
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

// POST /api/admin/products - Créer un produit (admin)
export async function POST(request: NextRequest) {
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

    const {
      name,
      description,
      price,
      hasVariants,
      variants,
      category,
      images,
      tags,
      entretien,
      careInstructions,
      composition,
      motsClesSEO,
      pricingType = 'fixed',
      customPricing
    } = await request.json();

    // Validation des champs requis
    if (!name?.trim() || !description?.trim() || !category || !images?.length) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Champs requis manquants (nom, description, catégorie, images)',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      }, { status: 400 });
    }

    // Validation selon le type de prix
    if (pricingType === 'fixed') {
      if (!price || price <= 0) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Prix requis et doit être supérieur à 0 pour un prix fixe',
            code: 'VALIDATION_ERROR'
          }
        }, { status: 400 });
      }
    }

    if (pricingType === 'variants') {
      if (!variants || !Array.isArray(variants) || variants.length === 0) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Au moins un variant requis pour un produit avec variants',
            code: 'VALIDATION_ERROR'
          }
        }, { status: 400 });
      }
      
      const invalidVariants = variants.filter((v: any) => !v.name?.trim() || !v.price || v.price <= 0);
      if (invalidVariants.length > 0) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Tous les variants doivent avoir un nom et un prix valide',
            code: 'VALIDATION_ERROR'
          }
        }, { status: 400 });
      }
    }

    if (pricingType === 'custom_range') {
      if (!customPricing || !customPricing.minPrice || !customPricing.maxPrice) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Prix minimum et maximum requis pour un prix personnalisable',
            code: 'VALIDATION_ERROR'
          }
        }, { status: 400 });
      }
      
      if (customPricing.maxPrice <= customPricing.minPrice) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Le prix maximum doit être supérieur au prix minimum',
            code: 'VALIDATION_ERROR'
          }
        }, { status: 400 });
      }
    }

    // Générer le slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    // Traitement des tags
    const processedTags = Array.isArray(tags) 
      ? tags.map((tag: string) => tag.toLowerCase().trim()) 
      : [];
    
    const processedMotsClesSEO = Array.isArray(motsClesSEO) 
      ? motsClesSEO.map((mot: string) => mot.trim()) 
      : [];

    // Traitement des variants si applicable
    let processedVariants: IProductVariant[] = [];
    if (pricingType === 'variants' && variants) {
      processedVariants = variants.map((variant: any, index: number) => ({
        name: variant.name.trim(),
        price: variant.price,
        description: variant.description?.trim() || '',
        image: variant.image || '',
        isActive: variant.isActive !== false,
        order: variant.order || index
      }));
      
      // Trier par ordre
      processedVariants.sort((a: IProductVariant, b: IProductVariant) => a.order - b.order);
    }

    // Créer les données produit
    const productData: Partial<IProduct> = {
      name: name.trim(),
      description: description.trim(),
      pricingType,
      images,
      category: category as IProduct['category'],
      isActive: true,
      tags: processedTags,
      slug,
      entretien: entretien?.trim() || '',
      careInstructions: careInstructions?.trim() || '',
      composition: composition?.trim() || '',
      motsClesSEO: processedMotsClesSEO,
      averageRating: 0,
      reviewsCount: 0
    };

    // Logique conditionnelle selon le type de prix
    if (pricingType === 'custom_range') {
      productData.hasVariants = false;
      productData.customPricing = {
        minPrice: customPricing.minPrice,
        maxPrice: customPricing.maxPrice
      };
    } else if (pricingType === 'variants') {
      productData.hasVariants = true;
      productData.variants = processedVariants;
    } else {
      productData.hasVariants = false;
      productData.price = price;
    }

    const product = new Product(productData);
    await product.save();

    // Formater la réponse
    const formattedProduct = formatProductResponse(product.toObject());

    return NextResponse.json({
      success: true,
      data: { product: formattedProduct },
      message: 'Produit créé avec succès'
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('❌ Admin product POST error:', error);
    
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