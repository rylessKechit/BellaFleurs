// src/app/api/admin/products/route.ts - Version corrigée avec variable request
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { checkAdminAccess } from '@/lib/auth-helpers';
import { formatProductResponse } from '@/lib/utils/formatProductResponse';
import { IProduct, IProductVariant } from '@/../types';

// Validation Zod (garde le schema existant)
const productVariantSchema = z.object({
  name: z.string().min(1, 'Nom de la variante requis'),
  price: z.number().min(0.01, 'Prix minimum: 0,01€'),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().default(0)
});

const createProductSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  description: z.string().min(10, 'Description trop courte'),
  price: z.number().min(0.01).optional(),
  hasVariants: z.boolean().default(false),
  variants: z.array(productVariantSchema).default([]),
  category: z.string().min(1, 'Catégorie requise'),
  images: z.array(z.string().url()).min(1, 'Au moins une image requise'),
  tags: z.array(z.string()).default([]),
  entretien: z.string().optional(),
  careInstructions: z.string().optional(),
  composition: z.string().optional(),
  motsClesSEO: z.array(z.string()).default([])
}).refine((data) => {
  // Si hasVariants = true, variants requis et pas de prix simple
  if (data.hasVariants) {
    return data.variants.length > 0;
  }
  // Si hasVariants = false, prix simple requis
  return data.price !== undefined && data.price > 0;
}, {
  message: "Produit avec variants: variants requis. Produit simple: prix requis."
});

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

    // 🔧 CORRECTION : Utiliser le formateur unifié
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
export async function POST(request: NextRequest) { // 🔧 CORRECTION : variable request
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

    const body = await request.json(); // 🔧 CORRECTION : utiliser request
    
    // Validation avec Zod
    const validationResult = createProductSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Données invalides',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.errors
        }
      }, { status: 400 });
    }

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
      motsClesSEO
    } = validationResult.data;

    // Générer le slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

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

    // 🔧 CORRECTION : Utiliser le formateur unifié
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