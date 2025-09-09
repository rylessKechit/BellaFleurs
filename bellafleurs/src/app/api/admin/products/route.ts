// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().min(1, 'La description est requise'),
  price: z.number().positive('Le prix doit être positif'),
  category: z.enum(['bouquets', 'compositions', 'plantes', 'evenements']),
  subcategory: z.string().optional(),
  images: z.array(z.string().url()).min(1, 'Au moins une image est requise'),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).default([])
  }).default({})
});

// GET - Récupérer tous les produits (admin)
export async function GET(req: NextRequest) {
  try {
    // Vérifier les droits admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès refusé. Droits administrateur requis.',
          code: 'ACCESS_DENIED'
        }
      }, { status: 403 });
    }

    await connectDB();

    // Paramètres de pagination et filtres
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const category = url.searchParams.get('category');
    const isActive = url.searchParams.get('isActive');
    const search = url.searchParams.get('search');

    // Construction de la requête
    const query: any = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;

    // Récupération des produits
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Admin products GET error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des produits',
        code: 'PRODUCTS_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}

// POST - Créer un nouveau produit
export async function POST(req: NextRequest) {
  try {
    // Vérifier les droits admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
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
    
    // Validation des données
    const validatedData = productSchema.parse(body);

    // Générer un slug unique
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    // Vérifier l'unicité du slug
    let finalSlug = slug;
    let counter = 1;
    while (await Product.findOne({ slug: finalSlug })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    // Créer le produit
    const product = new Product({
      ...validatedData,
      slug: finalSlug,
      seo: {
        title: validatedData.seo.title || validatedData.name,
        description: validatedData.seo.description || validatedData.description.substring(0, 155),
        keywords: validatedData.seo.keywords.length > 0 ? validatedData.seo.keywords : validatedData.tags
      }
    });

    await product.save();

    return NextResponse.json({
      success: true,
      message: 'Produit créé avec succès',
      data: { product }
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Admin products POST error:', error);
    
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
        message: 'Erreur lors de la création du produit',
        code: 'PRODUCT_CREATE_ERROR'
      }
    }, { status: 500 });
  }
}