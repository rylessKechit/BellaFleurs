// src/app/api/admin/products/[id]/route.ts - Version corrigée avec types
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { checkAdminAccess } from '@/lib/auth-helpers';
import { formatProductResponse } from '@/lib/utils/formatProductResponse';
import { IProduct, IProductVariant } from '@/../types';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/admin/products/[id] - Récupérer un produit pour édition (admin)
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const { id } = params;

    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Produit introuvable',
          code: 'PRODUCT_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // 🔧 CORRECTION : Utiliser le formateur unifié
    const formattedProduct = formatProductResponse(product);

    return NextResponse.json({
      success: true,
      data: { product: formattedProduct }
    });

  } catch (error: unknown) {
    console.error('❌ Admin product GET error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération du produit',
        code: 'PRODUCT_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}

// PUT /api/admin/products/[id] - Mettre à jour un produit (admin)
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const { id } = params;
    const body = await request.json();

    const {
      name,
      description,
      price,
      hasVariants,
      variants = [],
      category,
      images,
      tags = [],
      entretien = '',
      careInstructions = '',
      composition = '',
      motsClesSEO = [],
      isActive = true
    } = body;

    // Validation des champs requis
    if (!name || !description || !category) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Champs requis manquants (name, description, category)',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      }, { status: 400 });
    }

    // Validation spécifique
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

    // Générer le slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    // Traitement des tags et mots-clés
    const processedTags = Array.isArray(tags) 
      ? tags.map((tag: string) => tag.toLowerCase().trim()) 
      : [];
    
    const processedMotsClesSEO = Array.isArray(motsClesSEO) 
      ? motsClesSEO.map((mot: string) => mot.trim()) 
      : [];

    // Traitement des variants si applicable
    let processedVariants: IProductVariant[] = [];
    if (hasVariants && variants) {
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

    // 🔧 CORRECTION : Type correct pour updateData
    const updateData: any = {
      name: name.trim(),
      description: description.trim(),
      hasVariants,
      variants: processedVariants,
      images,
      category: category.trim(),
      isActive,
      tags: processedTags,
      slug,
      entretien: entretien?.trim() || '',
      careInstructions: careInstructions?.trim() || '',
      composition: composition?.trim() || '',
      motsClesSEO: processedMotsClesSEO
    };

    // Ajouter le prix seulement si pas de variants
    if (!hasVariants) {
      updateData.price = price;
    } else {
      // 🔧 CORRECTION : Supprimer le prix pour les produits avec variants
      updateData.$unset = { price: 1 };
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedProduct) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Produit introuvable',
          code: 'PRODUCT_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // 🔧 CORRECTION : Utiliser le formateur unifié
    const formattedProduct = formatProductResponse(updatedProduct);

    return NextResponse.json({
      success: true,
      data: { product: formattedProduct },
      message: 'Produit mis à jour avec succès'
    });

  } catch (error: unknown) {
    console.error('❌ Admin product PUT error:', error);
    
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
          message: 'Un produit avec ce nom existe déjà',
          code: 'DUPLICATE_PRODUCT'
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour du produit',
        code: 'PRODUCT_UPDATE_ERROR'
      }
    }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] - Supprimer un produit (admin)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const { id } = params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Produit introuvable',
          code: 'PRODUCT_NOT_FOUND'
        }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });

  } catch (error: unknown) {
    console.error('❌ Admin product DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la suppression du produit',
        code: 'PRODUCT_DELETE_ERROR'
      }
    }, { status: 500 });
  }
}