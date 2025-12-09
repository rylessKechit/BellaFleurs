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
    const formattedProduct = formatProductResponse(product as any);

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
      variants,
      category,
      images,
      isActive,
      tags,
      entretien,
      careInstructions,
      composition,
      motsClesSEO,
      freeDelivery
    } = body;

    // 🔧 CORRECTION PRINCIPALE : Gestion intelligente des variants et du prix
    const updateData: any = {};
    const unsetFields: any = {};

    // Champs toujours mis à jour
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (images !== undefined) updateData.images = images;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags.map((tag: string) => tag.toLowerCase().trim()) : [];
    if (entretien !== undefined) updateData.entretien = entretien?.trim() || '';
    if (careInstructions !== undefined) updateData.careInstructions = careInstructions?.trim() || '';
    if (composition !== undefined) updateData.composition = composition?.trim() || '';
    if (motsClesSEO !== undefined) updateData.motsClesSEO = Array.isArray(motsClesSEO) ? motsClesSEO.map((mot: string) => mot.trim()) : [];
    if (freeDelivery !== undefined) updateData.freeDelivery = freeDelivery;

    // 🔧 GESTION INTELLIGENTE DES VARIANTS ET PRIX
    if (hasVariants !== undefined) {
      updateData.hasVariants = hasVariants;

      if (hasVariants) {
        // Produit AVEC variants
        if (variants && Array.isArray(variants)) {
          // Traitement des variants
          const processedVariants = variants.map((variant: any, index: number) => ({
            name: variant.name.trim(),
            price: variant.price,
            description: variant.description?.trim() || '',
            image: variant.image || '',
            isActive: variant.isActive !== false,
            order: variant.order || index
          }));

          // Validation : au moins 1 variant
          if (processedVariants.length === 0) {
            return NextResponse.json({
              success: false,
              error: {
                message: 'Au moins un variant requis pour un produit avec variants',
                code: 'VALIDATION_ERROR'
              }
            }, { status: 400 });
          }

          updateData.variants = processedVariants.sort((a: any, b: any) => a.order - b.order);
        }

        // 🔧 SUPPRIMER le champ price pour les produits avec variants
        unsetFields.price = 1;

      } else {
        // Produit SANS variants
        if (price === undefined || price <= 0) {
          return NextResponse.json({
            success: false,
            error: {
              message: 'Prix requis pour un produit sans variants',
              code: 'VALIDATION_ERROR'
            }
          }, { status: 400 });
        }

        updateData.price = price;
        // 🔧 SUPPRIMER les variants pour les produits sans variants
        updateData.variants = [];
      }
    } else {
      // Si hasVariants n'est pas spécifié, mettre à jour seulement ce qui est fourni
      if (price !== undefined) updateData.price = price;
      if (variants !== undefined) {
        const processedVariants = variants.map((variant: any, index: number) => ({
          name: variant.name.trim(),
          price: variant.price,
          description: variant.description?.trim() || '',
          image: variant.image || '',
          isActive: variant.isActive !== false,
          order: variant.order || index
        }));
        updateData.variants = processedVariants.sort((a: any, b: any) => a.order - b.order);
      }
    }

    // 🔧 CONSTRUCTION DE LA REQUÊTE DE MISE À JOUR
    const mongoUpdate: any = {};
    
    if (Object.keys(updateData).length > 0) {
      mongoUpdate.$set = updateData;
    }
    
    if (Object.keys(unsetFields).length > 0) {
      mongoUpdate.$unset = unsetFields;
    }

    // 🔧 MISE À JOUR AVEC VALIDATION
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      mongoUpdate,
      { 
        new: true, 
        runValidators: true,
        context: 'query' // Important pour les validations conditionnelles
      }
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

    // Formater la réponse
    const formattedProduct = formatProductResponse(updatedProduct as any);

    return NextResponse.json({
      success: true,
      data: { product: formattedProduct },
      message: 'Produit mis à jour avec succès'
    });

  } catch (error: unknown) {
    console.error('❌ Admin product PUT error:', error);
    
    // Gestion des erreurs de validation Mongoose
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      const validationError = error as any;
      const validationErrors = Object.values(validationError.errors).map((err: any) => err.message);
      
      console.error('❌ Erreurs de validation:', validationErrors);
      
      return NextResponse.json({
        success: false,
        error: {
          message: `Erreurs de validation: ${validationErrors.join(', ')}`,
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    // Erreur de duplication
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