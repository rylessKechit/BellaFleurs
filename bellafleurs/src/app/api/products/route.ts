// src/app/api/products/route.ts - API pour lister les produits sans logique stock
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// Catégories fixes
const VALID_CATEGORIES = [
  'Bouquets',
  'Fleurs de saisons',
  'Compositions piquées', 
  'Roses',
  'Orchidées',
  'Deuil',
  'Abonnement'
];

// Interface pour le produit de base de données
interface DBProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  isActive: boolean;
  tags: string[];
  slug?: string;
  averageRating?: number;
  reviewsCount?: number;
  entretien?: string;
  careInstructions?: string;
  difficulty?: string;
  dimensions?: string;
  composition?: string;
  createdAt?: Date;
  [key: string]: any;
}

// Interface pour le produit formaté
interface FormattedProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  isActive: boolean;
  tags: string[];
  slug?: string;
  averageRating: number;
  reviewsCount: number;
  entretien?: string;
  careInstructions?: string;
  difficulty?: string;
  dimensions?: string;
  composition?: string;
  createdAt?: Date;
}

// GET /api/products - Récupérer la liste des produits avec filtres et pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    // Paramètres de recherche et filtrage
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const tags = searchParams.get('tags') || '';
    const sort = searchParams.get('sort') || 'name';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const activeOnly = searchParams.get('activeOnly') !== 'false'; // Par défaut true

    // Construction du filtre
    const filter: any = {};
    
    // Filtrer uniquement les produits actifs par défaut
    if (activeOnly) {
      filter.isActive = true;
    }
    
    // Recherche textuelle
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Filtres par catégorie
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Filtres par tags
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagList };
    }
    
    // Filtres par prix
    if (minPrice > 0 || maxPrice < 999999) {
      filter.price = {};
      if (minPrice > 0) filter.price.$gte = minPrice;
      if (maxPrice < 999999) filter.price.$lte = maxPrice;
    }

    // Construction du tri
    let sortQuery: any = {};
    switch (sort) {
      case 'name':
        sortQuery = { name: 1 };
        break;
      case '-name':
        sortQuery = { name: -1 };
        break;
      case 'price':
        sortQuery = { price: 1 };
        break;
      case '-price':
        sortQuery = { price: -1 };
        break;
      case 'createdAt':
        sortQuery = { createdAt: 1 };
        break;
      case '-createdAt':
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'popularity':
        sortQuery = { createdAt: -1 };
        break;
      default:
        sortQuery = { name: 1 };
    }

    // Calcul de la pagination
    const skip = (page - 1) * limit;
    // Exécution des requêtes
    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .select('name description price images category isActive tags slug averageRating reviewsCount entretien careInstructions difficulty dimensions composition createdAt')
        .lean() as Promise<DBProduct[]>,
      Product.countDocuments(filter)
    ]);

    // Calcul des métadonnées de pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Formatage des données pour le frontend
    const formattedProducts: FormattedProduct[] = products.map((product: DBProduct) => ({
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images || [],
      category: product.category,
      isActive: product.isActive,
      tags: product.tags || [],
      slug: product.slug,
      averageRating: product.averageRating || 0,
      reviewsCount: product.reviewsCount || 0,
      entretien: product.entretien,
      careInstructions: product.careInstructions,
      difficulty: product.difficulty,
      dimensions: product.dimensions,
      composition: product.composition,
      createdAt: product.createdAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPrevPage ? page - 1 : null
        },
        filters: {
          search,
          category,
          tags,
          sort,
          minPrice,
          maxPrice,
          activeOnly
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Products API error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des produits',
        code: 'PRODUCTS_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}

// POST /api/products - Créer un nouveau produit (admin uniquement)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // TODO: Ajouter la vérification d'authentification admin
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({
    //     success: false,
    //     error: { message: 'Accès non autorisé', code: 'UNAUTHORIZED' }
    //   }, { status: 401 });
    // }

    const body = await request.json();
    
    const {
      name,
      description,
      price,
      images,
      category,
      tags,
      entretien,
      careInstructions,
      difficulty,
      dimensions,
      composition,
      motsClesSEO
    } = body;

    // Validation des champs requis
    if (!name || !description || !price || !category) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Champs requis manquants (name, description, price, category)',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      }, { status: 400 });
    }

    // Validation de la catégorie
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({
        success: false,
        error: {
          message: `Catégorie invalide. Catégories autorisées: ${VALID_CATEGORIES.join(', ')}`,
          code: 'INVALID_CATEGORY'
        }
      }, { status: 400 });
    }

    // Validation des types
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Le prix doit être un nombre positif',
          code: 'INVALID_PRICE'
        }
      }, { status: 400 });
    }

    // Génération automatique du slug
    const generateSlug = (name: string): string => {
      return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
        .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
        .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
        .replace(/-+/g, '-') // Éviter les tirets multiples
        .trim()
        .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début/fin
    };

    let slug = generateSlug(name);
    
    // Vérifier l'unicité du slug
    let slugExists = await Product.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(name)}-${counter}`;
      slugExists = await Product.findOne({ slug });
      counter++;
    }

    // Traitement des tags et mots-clés SEO
    const processedTags = tags ? (Array.isArray(tags) ? tags : tags.split(',').map((tag: string) => tag.trim())) : [];
    const processedMotsClesSEO = motsClesSEO ? (Array.isArray(motsClesSEO) ? motsClesSEO : motsClesSEO.split(',').map((mot: string) => mot.trim())) : [];

    // Créer le nouveau produit
    const newProduct = new Product({
      name: name.trim(),
      description: description.trim(),
      price,
      images: images || [],
      category: category.trim(),
      isActive: true,
      tags: processedTags,
      slug,
      entretien: entretien?.trim() || '',
      careInstructions: careInstructions?.trim() || '',
      difficulty: difficulty || 'facile',
      dimensions: dimensions?.trim() || '',
      composition: composition?.trim() || '',
      motsClesSEO: processedMotsClesSEO,
      averageRating: 0,
      reviewsCount: 0
    });

    await newProduct.save();

    return NextResponse.json({
      success: true,
      data: {
        product: {
          ...newProduct.toObject(),
          _id: newProduct._id.toString()
        }
      },
      message: 'Produit créé avec succès'
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Product creation error:', error);
    
    // Gestion des erreurs de validation MongoDB
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({
        success: false,
        error: {
          message: `Erreurs de validation: ${validationErrors.join(', ')}`,
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    // Gestion des erreurs de duplication
    if (error.code === 11000) {
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
        message: 'Erreur lors de la création du produit',
        code: 'PRODUCT_CREATION_ERROR'
      }
    }, { status: 500 });
  }
}