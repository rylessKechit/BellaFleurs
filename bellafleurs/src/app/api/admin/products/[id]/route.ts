// src/app/api/admin/products/[id]/route.ts - Version corrigée
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { z } from 'zod';

const productUpdateSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').optional(),
  description: z.string().min(1, 'La description est requise').optional(),
  price: z.number().positive('Le prix doit être positif').optional(),
  category: z.enum(['bouquets', 'compositions', 'plantes', 'evenements']).optional(),
  subcategory: z.string().optional(),
  images: z.array(z.string().url()).min(1, 'Au moins une image est requise').optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional()
  }).optional()
});

const statusUpdateSchema = z.object({
  isActive: z.boolean()
});

async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return false;
  }
  return true;
}

// GET - Récupérer un produit spécifique
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Produit non trouvé',
          code: 'PRODUCT_NOT_FOUND'
        }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { product }
    });

  } catch (error: any) {
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

// PUT - Modifier un produit
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const body = await req.json();
    const validatedData = productUpdateSchema.parse(body);

    // Vérifier que le produit existe
    const existingProduct = await Product.findById(params.id);
    if (!existingProduct) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Produit non trouvé',
          code: 'PRODUCT_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Préparer les données de mise à jour avec le bon typage
    let updateData: any = { ...validatedData };

    // Générer un nouveau slug si le nom a changé
    if (validatedData.name && validatedData.name !== existingProduct.name) {
      const newSlug = validatedData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      // Vérifier l'unicité du slug
      let finalSlug = newSlug;
      let counter = 1;
      while (await Product.findOne({ slug: finalSlug, _id: { $ne: params.id } })) {
        finalSlug = `${newSlug}-${counter}`;
        counter++;
      }
      updateData.slug = finalSlug;
    }

    // Mettre à jour les données SEO si nécessaire
    if (validatedData.seo) {
      updateData.seo = {
        title: validatedData.seo.title || validatedData.name || existingProduct.name,
        description: validatedData.seo.description || validatedData.description || existingProduct.description.substring(0, 155),
        keywords: validatedData.seo.keywords || validatedData.tags || existingProduct.tags
      };
    }

    // Ajouter updatedAt
    updateData.updatedAt = new Date();

    const product = await Product.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Produit modifié avec succès',
      data: { product }
    });

  } catch (error: any) {
    console.error('❌ Admin product PUT error:', error);
    
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

    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la modification du produit',
        code: 'PRODUCT_UPDATE_ERROR'
      }
    }, { status: 500 });
  }
}

// PATCH - Modifier le statut (actif/inactif)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const body = await req.json();
    
    // Gérer soit le changement de statut, soit les notes admin
    if ('isActive' in body) {
      // Changement de statut
      const validatedData = statusUpdateSchema.parse(body);

      const product = await Product.findByIdAndUpdate(
        params.id,
        { 
          isActive: validatedData.isActive,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );

      if (!product) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Produit non trouvé',
            code: 'PRODUCT_NOT_FOUND'
          }
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `Produit ${validatedData.isActive ? 'activé' : 'désactivé'} avec succès`,
        data: { product }
      });
    } else {
      // Autres types de mise à jour (ex: notes admin)
      const product = await Product.findByIdAndUpdate(
        params.id,
        { 
          ...body,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );

      if (!product) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Produit non trouvé',
            code: 'PRODUCT_NOT_FOUND'
          }
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Produit mis à jour avec succès',
        data: { product }
      });
    }

  } catch (error: any) {
    console.error('❌ Admin product PATCH error:', error);
    
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

    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la modification',
        code: 'PRODUCT_UPDATE_ERROR'
      }
    }, { status: 500 });
  }
}

// DELETE - Supprimer un produit
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    // Vérifier que le produit existe
    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Produit non trouvé',
          code: 'PRODUCT_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Vérifier s'il y a des commandes en cours avec ce produit
    // (optionnel - vous pouvez commenter cette partie si vous voulez permettre la suppression)
    /*
    const Order = require('@/models/Order');
    const activeOrders = await Order.countDocuments({
      'items.product': params.id,
      status: { $in: ['validé', 'en_cours_creation', 'prête', 'en_livraison'] }
    });

    if (activeOrders > 0) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Impossible de supprimer ce produit car il est présent dans des commandes en cours',
          code: 'PRODUCT_IN_USE'
        }
      }, { status: 400 });
    }
    */

    // Supprimer le produit
    await Product.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });

  } catch (error: any) {
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