// src/app/api/products/[identifier]/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

interface RouteParams {
  params: {
    identifier: string;
  };
}

// GET /api/products/[identifier] - Récupérer un produit par ID ou SLUG
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    
    const { identifier } = params;

    let product = null;

    // Déterminer si c'est un ID MongoDB ou un slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    
    if (isObjectId) {
      // Recherche par ID
      product = await Product.findById(identifier).lean();
    } else {
      // Recherche par slug
      product = await Product.findOne({ 
        slug: identifier,
        isActive: true 
      }).lean();
    }

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
      data: {
        product
      }
    });

  } catch (error: any) {
    console.error('❌ Product GET error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération du produit',
        code: 'PRODUCT_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}