// src/app/api/products/featured/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/products/featured - Récupérer les produits mis en avant
export async function GET() {
  try {
    await connectDB();

    // Récupérer les produits les plus populaires ou les mieux notés
    // Pour l'exemple, on prend les plus récents avec du stock
    const featuredProducts = await Product.find({
      isActive: true,
    })
    .sort({ createdAt: -1 })
    .limit(8)
    .select('name price images category subcategory tags')
    .lean();

    return NextResponse.json({
      success: true,
      data: { products: featuredProducts }
    });

  } catch (error: any) {
    console.error('❌ Featured products API error:', error);

    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des produits mis en avant',
        code: 'FETCH_FEATURED_PRODUCTS_ERROR'
      }
    }, { status: 500 });
  }
}