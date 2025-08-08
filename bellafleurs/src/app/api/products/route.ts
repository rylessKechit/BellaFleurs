// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { productFiltersSchema, paginationSchema } from '@/lib/validations';

// GET /api/products - Récupérer la liste des produits avec filtres
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validation des paramètres de requête
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '12',
      sort: searchParams.get('sort') || 'createdAt',
      order: searchParams.get('order') || 'desc',
      category: searchParams.get('category') || '',
      subcategory: searchParams.get('subcategory') || '',
      search: searchParams.get('search') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      inStock: searchParams.get('inStock') || '',
      tags: searchParams.get('tags') || '',
    };

    // Validation avec Zod
    const filters = {
      category: queryParams.category || undefined,
      subcategory: queryParams.subcategory || undefined,
      minPrice: queryParams.minPrice ? parseFloat(queryParams.minPrice) : undefined,
      maxPrice: queryParams.maxPrice ? parseFloat(queryParams.maxPrice) : undefined,
      inStock: queryParams.inStock === 'true',
      search: queryParams.search || undefined,
      tags: queryParams.tags ? queryParams.tags.split(',') : undefined,
    };

    const pagination = {
      page: parseInt(queryParams.page),
      limit: Math.min(parseInt(queryParams.limit), 50), // Max 50 par page
      sortBy: queryParams.sort,
      sortOrder: queryParams.order as 'asc' | 'desc',
    };

    // Connexion à la base de données
    await connectDB();

    // Construction de la requête
    const query: any = { isActive: true };

    // Filtres
    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.subcategory) {
      query.subcategory = filters.subcategory;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { tags: { $in: [new RegExp(filters.search, 'i')] } }
      ];
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }

    if (filters.inStock) {
      query.stock = { $gt: 0 };
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    // Tri
    const sortObject: any = {};
    if (pagination.sortBy === 'price') {
      sortObject.price = pagination.sortOrder === 'desc' ? -1 : 1;
    } else if (pagination.sortBy === 'name') {
      sortObject.name = pagination.sortOrder === 'desc' ? -1 : 1;
    } else {
      sortObject.createdAt = pagination.sortOrder === 'desc' ? -1 : 1;
    }

    // Exécution des requêtes
    const skip = (pagination.page - 1) * pagination.limit;
    
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .sort(sortObject)
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    // Calcul de la pagination
    const totalPages = Math.ceil(totalCount / pagination.limit);
    const hasNextPage = pagination.page < totalPages;
    const hasPrevPage = pagination.page > 1;

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Products API error:', error);

    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des produits',
        code: 'FETCH_PRODUCTS_ERROR'
      }
    }, { status: 500 });
  }
}