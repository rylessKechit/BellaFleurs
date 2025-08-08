// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { Types } from 'mongoose';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/products/[id] - Récupérer un produit par ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;

    // Validation de l'ID
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'ID de produit invalide',
          code: 'INVALID_PRODUCT_ID'
        }
      }, { status: 400 });
    }

    // Connexion à la base de données
    await connectDB();

    // Recherche du produit
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

    // Vérifier si le produit est actif (sauf pour les admins)
    if (!product.isActive) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Produit non disponible',
          code: 'PRODUCT_INACTIVE'
        }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { product }
    });

  } catch (error: any) {
    console.error('❌ Product detail API error:', error);

    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération du produit',
        code: 'FETCH_PRODUCT_ERROR'
      }
    }, { status: 500 });
  }
}