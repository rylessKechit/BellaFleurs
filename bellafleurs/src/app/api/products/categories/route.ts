// src/app/api/products/categories/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/products/categories - Récupérer les catégories avec le nombre de produits
export async function GET() {
  try {
    await connectDB();

    // Agrégation pour compter les produits par catégorie
    const categoriesWithCounts = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          subcategories: { $addToSet: '$subcategory' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Transformation des données
    const categories = categoriesWithCounts.map(cat => ({
      id: cat._id,
      name: cat._id,
      count: cat.count,
      subcategories: cat.subcategories.map((sub: string) => ({
        id: sub,
        name: sub
      }))
    }));

    return NextResponse.json({
      success: true,
      data: { categories }
    });

  } catch (error: any) {
    console.error('❌ Categories API error:', error);

    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des catégories',
        code: 'FETCH_CATEGORIES_ERROR'
      }
    }, { status: 500 });
  }
}