// src/app/api/products/route.ts - API pour les produits avec support des variants
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { IProduct, IProductVariant } from '@/../types';

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

// Interface pour le produit de base de données avec variants
interface DBProduct {
  _id: string;
  name: string;
  description: string;
  price?: number;                  // Optionnel si hasVariants = true
  hasVariants: boolean;            // Nouveau champ
  variants: IProductVariant[];     // Array des variantes
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
  composition?: string;
  motsClesSEO?: string[];
  createdAt?: Date;
}

// Interface pour le produit formaté avec prix d'affichage
interface FormattedProduct {
  _id: string;
  name: string;
  description: string;
  price?: number;
  hasVariants: boolean;
  variants: IProductVariant[];
  displayPrice: number;            // Prix à afficher (simple ou premier variant)
  displayPriceFormatted: string;   // Prix formaté
  priceRangeFormatted: string;     // "À partir de 25€" ou "25€ - 45€"
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
  composition?: string;
  motsClesSEO?: string[];
  createdAt?: Date;
}

// Helper pour formater un produit avec gestion des variants
function formatProduct(product: DBProduct): FormattedProduct {
  let displayPrice: number;
  let priceRangeFormatted: string;
  
  if (!product.hasVariants) {
    // Produit simple : utiliser le prix principal
    displayPrice = product.price || 0;
    priceRangeFormatted = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(displayPrice);
  } else {
    // Produit avec variants : utiliser le premier variant actif
    const activeVariants = product.variants.filter((v: IProductVariant) => v.isActive);
    
    if (activeVariants.length === 0) {
      displayPrice = 0;
      priceRangeFormatted = 'Prix non disponible';
    } else {
      const prices = activeVariants.map((v: IProductVariant) => v.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      displayPrice = activeVariants[0].price; // Premier variant pour displayPrice
      
      const formatter = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      });
      
      if (minPrice === maxPrice) {
        priceRangeFormatted = formatter.format(minPrice);
      } else {
        priceRangeFormatted = `${formatter.format(minPrice)} - ${formatter.format(maxPrice)}`;
      }
    }
  }

  const displayPriceFormatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(displayPrice);

  return {
    _id: product._id,
    name: product.name,
    description: product.description,
    price: product.price,
    hasVariants: product.hasVariants,
    variants: product.variants,
    displayPrice,
    displayPriceFormatted,
    priceRangeFormatted,
    images: product.images,
    category: product.category,
    isActive: product.isActive,
    tags: product.tags,
    slug: product.slug,
    averageRating: product.averageRating || 0,
    reviewsCount: product.reviewsCount || 0,
    entretien: product.entretien,
    careInstructions: product.careInstructions,
    difficulty: product.difficulty,
    composition: product.composition,
    motsClesSEO: product.motsClesSEO,
    createdAt: product.createdAt,
  };
}

// Helper pour générer un slug unique
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
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
    const hasVariants = searchParams.get('hasVariants'); // Nouveau filtre

    // Construction du filtre
    const filter: Record<string, any> = {};
    
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
    
    // Filtres par prix - GESTION DES VARIANTS
    if (minPrice > 0 || maxPrice < 999999) {
      const priceConditions: Record<string, number> = {};
      if (minPrice > 0) priceConditions.$gte = minPrice;
      if (maxPrice < 999999) priceConditions.$lte = maxPrice;
      
      filter.$or = [
        // Produits sans variants
        { hasVariants: false, price: priceConditions },
        // Produits avec variants - chercher dans les prix des variants
        { hasVariants: true, 'variants.price': priceConditions, 'variants.isActive': true }
      ];
    }
    
    // Filtres par tags
    if (tags) {
      const tagArray = tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
      if (tagArray.length > 0) {
        filter.tags = { $in: tagArray };
      }
    }
    
    // Nouveau : Filtre par type de produit (avec ou sans variants)
    if (hasVariants === 'true') {
      filter.hasVariants = true;
    } else if (hasVariants === 'false') {
      filter.hasVariants = false;
    }

    // Options de tri
    let sortOptions: { [key: string]: 1 | -1 } = { createdAt: -1 };
    
    switch (sort) {
      case 'name':
        sortOptions = { name: 1 };
        break;
      case 'price':
        // Pour le tri par prix avec variants, on utilise un aggregation pipeline plus tard
        sortOptions = { price: 1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'rating':
        sortOptions = { averageRating: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Exécution de la requête
    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean<DBProduct[]>(),
      Product.countDocuments(filter)
    ]);

    // Formatage des produits avec gestion des variants
    const formattedProducts = products.map((product: DBProduct) => formatProduct(product));

    // Calculs de pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
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
          activeOnly,
          hasVariants
        }
      }
    });

  } catch (error: unknown) {
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

// POST /api/products - Créer un nouveau produit avec support des variants
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
      hasVariants = false,
      variants = [],
      images,
      category,
      tags = [],
      entretien = '',
      careInstructions = '',
      difficulty = 'facile',
      composition = '',
      motsClesSEO = []
    } = body;

    // Validation des champs requis
    if (!name || !description || !category) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Champs requis manquants (name, description, category)',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      }, { status: 400 });
    }

    // Validation spécifique côté serveur
    if (!hasVariants && (!price || price <= 0)) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Le prix est requis pour les produits sans variants',
          code: 'MISSING_PRICE'
        }
      }, { status: 400 });
    }

    if (hasVariants && (!variants || variants.length === 0)) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Au moins une variante est requise pour les produits avec variants',
          code: 'MISSING_VARIANTS'
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

    // Validation des images
    if (!images || images.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Au moins une image est requise',
          code: 'MISSING_IMAGES'
        }
      }, { status: 400 });
    }

    // Génération du slug unique
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let slugCounter = 1;
    
    // Vérifier l'unicité du slug
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Traitement des tags et mots-clés SEO
    const processedTags = Array.isArray(tags) 
      ? tags.map((tag: string) => tag.toLowerCase().trim()) 
      : [];
    
    const processedMotsClesSEO = Array.isArray(motsClesSEO) 
      ? motsClesSEO.map((mot: string) => mot.trim()) 
      : [];

    // Traitement des variants si applicable
    let processedVariants: IProductVariant[] = [];
    if (hasVariants && variants) {
      processedVariants = variants.map((variant: any, index: number) => ({
        name: variant.name.trim(),
        price: variant.price,
        description: variant.description?.trim() || '',
        image: variant.image || '',
        isActive: variant.isActive !== false, // Par défaut true
        order: variant.order || index
      }));
      
      // Trier par ordre
      processedVariants.sort((a: IProductVariant, b: IProductVariant) => a.order - b.order);
    }

    // Créer le nouveau produit
    const productData: Partial<IProduct> = {
      name: name.trim(),
      description: description.trim(),
      hasVariants,
      variants: processedVariants,
      images,
      category: category.trim(),
      isActive: true,
      tags: processedTags,
      slug,
      entretien: entretien?.trim() || '',
      careInstructions: careInstructions?.trim() || '',
      difficulty: difficulty || 'facile',
      composition: composition?.trim() || '',
      motsClesSEO: processedMotsClesSEO,
      averageRating: 0,
      reviewsCount: 0
    };

    // Ajouter le prix seulement si pas de variants
    if (!hasVariants) {
      productData.price = price;
    }

    const newProduct = new Product(productData);
    await newProduct.save();

    // Formater la réponse
    const formattedProduct = formatProduct(newProduct.toObject() as DBProduct);

    return NextResponse.json({
      success: true,
      data: {
        product: formattedProduct
      },
      message: 'Produit créé avec succès'
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('❌ Product creation error:', error);
    
    // Gestion des erreurs de validation MongoDB
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      const validationError = error as any;
      const validationErrors = Object.values(validationError.errors).map((err: any) => err.message);
      return NextResponse.json({
        success: false,
        error: {
          message: `Erreurs de validation: ${validationErrors.join(', ')}`,
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    // Gestion des erreurs de duplication
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
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