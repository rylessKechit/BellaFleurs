// src/app/api/admin/products/[id]/route.ts
export const dynamic = 'force-dynamic';

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

async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return false;
  }
  return true;
}

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

    const product = await Product.findByIdAndUpdate(
      params.id,
      {
        ...validatedData,
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
        message: 'Erreur lors de la mise à jour du produit',
        code: 'PRODUCT_UPDATE_ERROR'
      }
    }, { status: 500 });
  }
}

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