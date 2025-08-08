// src/app/api/products/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/products/search - Recherche textuelle de produits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Requête de recherche trop courte (minimum 2 caractères)',
          code: 'SEARCH_QUERY_TOO_SHORT'
        }
      }, { status: 400 });
    }

    await connectDB();

    // Recherche avec score de pertinence
    const products = await Product.find(
      {
        $and: [
          { isActive: true },
          {
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
              { tags: { $in: [new RegExp(query, 'i')] } },
              { category: { $regex: query, $options: 'i' } },
              { subcategory: { $regex: query, $options: 'i' } }
            ]
          }
        ]
      },
      {
        name: 1,
        price: 1,
        images: { $slice: 1 },
        category: 1,
        subcategory: 1,
        stock: 1
      }
    )
    .limit(limit)
    .lean();

    // Calculer un score de pertinence simple
    const productsWithScore = products.map(product => {
      let score = 0;
      
      // Correspondance exacte dans le nom (score le plus élevé)
      if (product.name.toLowerCase().includes(query.toLowerCase())) {
        score += 10;
      }
      
      // Correspondance dans les tags
      if (product.tags.some((tag: string) => 
        tag.toLowerCase().includes(query.toLowerCase())
      )) {
        score += 5;
      }
      
      // Correspondance dans la catégorie
      if (product.category.toLowerCase().includes(query.toLowerCase())) {
        score += 3;
      }
      
      return { ...product, _score: score };
    });

    // Trier par score de pertinence
    productsWithScore.sort((a, b) => b._score - a._score);

    return NextResponse.json({
      success: true,
      data: {
        products: productsWithScore,
        query,
        count: productsWithScore.length
      }
    });

  } catch (error: any) {
    console.error('❌ Product search API error:', error);

    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la recherche de produits',
        code: 'SEARCH_PRODUCTS_ERROR'
      }
    }, { status: 500 });
  }
}