// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// Interface pour le produit formaté
interface FormattedProduct {
  _id: string;
  name: string;
  description: string;
  price?: number;
  hasVariants: boolean;
  variants: any[];
  pricingType: string;
  customPricing?: {
    minPrice: number;
    maxPrice: number;
  };
  category: string;
  images: string[];
  isActive: boolean;
  tags: string[];
  slug?: string;
  entretien?: string;
  freeDelivery: boolean;
  careInstructions?: string;
  composition?: string;
  motsClesSEO: string[];
  averageRating: number;
  reviewsCount: number;
  createdAt: Date;
  updatedAt: Date;
  displayPrice?: number;
  displayPriceFormatted?: string;
  priceRangeFormatted?: string;
}

// Helper pour formater un produit
function formatProduct(product: any): FormattedProduct {
  const formattedProduct: FormattedProduct = {
    _id: product._id,
    name: product.name,
    description: product.description,
    price: product.price,
    hasVariants: product.hasVariants || false,
    variants: product.variants || [],
    pricingType: product.pricingType || 'fixed',
    customPricing: product.customPricing,
    category: product.category,
    images: product.images || [],
    isActive: product.isActive,
    freeDelivery: product.freeDelivery || false,
    tags: product.tags || [],
    slug: product.slug,
    entretien: product.entretien,
    careInstructions: product.careInstructions,
    composition: product.composition,
    motsClesSEO: product.motsClesSEO || [],
    averageRating: product.averageRating || 0,
    reviewsCount: product.reviewsCount || 0,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };

  // Calculer le prix d'affichage selon le type
  if (product.pricingType === 'custom_range' && product.customPricing) {
    formattedProduct.displayPrice = product.customPricing.minPrice;
    formattedProduct.displayPriceFormatted = `À partir de ${product.customPricing.minPrice.toFixed(2)} €`;
    formattedProduct.priceRangeFormatted = `${product.customPricing.minPrice.toFixed(2)} € - ${product.customPricing.maxPrice.toFixed(2)} €`;
  } else if (product.hasVariants && product.variants?.length > 0) {
    const activeVariants = product.variants.filter((v: any) => v.isActive !== false);
    if (activeVariants.length > 0) {
      const prices = activeVariants.map((v: any) => v.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      formattedProduct.displayPrice = minPrice;
      formattedProduct.displayPriceFormatted = `${minPrice.toFixed(2)} €`;
      formattedProduct.priceRangeFormatted = minPrice === maxPrice 
        ? `${minPrice.toFixed(2)} €`
        : `${minPrice.toFixed(2)} € - ${maxPrice.toFixed(2)} €`;
    }
  } else if (product.price) {
    formattedProduct.displayPrice = product.price;
    formattedProduct.displayPriceFormatted = `${product.price.toFixed(2)} €`;
    formattedProduct.priceRangeFormatted = `${product.price.toFixed(2)} €`;
  }

  return formattedProduct;
}

// GET /api/products - Liste des produits avec filtres
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    
    // Paramètres de pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Paramètres de filtrage
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    // Paramètres de tri
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Construction de la requête
    const query: any = {};
    
    if (activeOnly) {
      query.isActive = true;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // Filtre de prix complexe pour tous les types de produits
    if (minPrice > 0 || maxPrice < 999999) {
      query.$or = [
        // Produits à prix fixe
        { 
          pricingType: 'fixed', 
          price: { $gte: minPrice, $lte: maxPrice } 
        },
        // Produits avec variants
        { 
          pricingType: 'variants', 
          'variants.price': { $gte: minPrice, $lte: maxPrice } 
        },
        // Produits à prix personnalisable
        { 
          pricingType: 'custom_range',
          'customPricing.minPrice': { $lte: maxPrice },
          'customPricing.maxPrice': { $gte: minPrice }
        }
      ];
    }

    // Tri
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Exécution des requêtes
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    // Formatage des produits
    const formattedProducts = products.map(formatProduct);

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error: unknown) {
    console.error('❌ Products API GET error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des produits',
        code: 'PRODUCTS_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}

// POST /api/products - Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const {
      name,
      description,
      price,
      hasVariants,
      variants,
      pricingType = 'fixed',
      customPricing,
      category,
      images,
      tags,
      entretien,
      careInstructions,
      difficulty,
      composition,
      motsClesSEO
    } = await request.json();

    // Validation des champs requis
    if (!name?.trim() || !description?.trim() || !category || !images?.length) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Champs requis manquants (nom, description, catégorie, images)',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      }, { status: 400 });
    }

    // Validation selon le type de prix
    if (pricingType === 'fixed' && (!price || price <= 0)) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Prix requis pour un produit à prix fixe',
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    if (pricingType === 'variants' && (!variants || !Array.isArray(variants) || variants.length === 0)) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Au moins un variant requis pour un produit avec variants',
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    if (pricingType === 'custom_range') {
      if (!customPricing || !customPricing.minPrice || !customPricing.maxPrice) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Prix minimum et maximum requis pour un prix personnalisable',
            code: 'VALIDATION_ERROR'
          }
        }, { status: 400 });
      }
      
      if (customPricing.maxPrice <= customPricing.minPrice) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Le prix maximum doit être supérieur au prix minimum',
            code: 'VALIDATION_ERROR'
          }
        }, { status: 400 });
      }
    }

    // Générer le slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    // Traitement des tags
    const processedTags = Array.isArray(tags) 
      ? tags.map((tag: string) => tag.toLowerCase().trim()) 
      : [];
    
    const processedMotsClesSEO = Array.isArray(motsClesSEO) 
      ? motsClesSEO.map((mot: string) => mot.trim()) 
      : [];

    // Traitement des variants si applicable
    let processedVariants: any[] = [];
    if (pricingType === 'variants' && variants) {
      processedVariants = variants.map((variant: any, index: number) => ({
        name: variant.name.trim(),
        price: variant.price,
        description: variant.description?.trim() || '',
        image: variant.image || '',
        isActive: variant.isActive !== false,
        order: variant.order || index
      }));
      
      // Trier par ordre
      processedVariants.sort((a: any, b: any) => a.order - b.order);
    }

    // Créer le nouveau produit
    const productData: any = {
      name: name.trim(),
      description: description.trim(),
      pricingType,
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

    // Logique conditionnelle selon le type de prix
    if (pricingType === 'custom_range') {
      productData.hasVariants = false;
      productData.customPricing = {
        minPrice: customPricing.minPrice,
        maxPrice: customPricing.maxPrice
      };
    } else if (pricingType === 'variants') {
      productData.hasVariants = true;
      productData.variants = processedVariants;
    } else {
      productData.hasVariants = false;
      productData.price = price;
    }

    const newProduct = new Product(productData);
    await newProduct.save();

    // Formater la réponse
    const formattedProduct = formatProduct(newProduct.toObject());

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