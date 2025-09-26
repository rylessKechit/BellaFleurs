// src/app/api/products/[id]/route.ts
export const dynamic = 'force-dynamic';

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
function formatProductResponse(product: any): FormattedProduct {
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

// GET /api/products/[id] - Récupérer un produit par ID ou slug
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Extraire l'ID depuis l'URL directement
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1]; // Dernier segment de l'URL
    
    console.log('🔍 URL complète:', request.url);
    console.log('🔍 Segments du path:', pathParts);
    console.log('🔍 ID extrait:', id);
    
    if (!id || id === 'undefined' || id === 'null' || id === 'products') {
      console.error('❌ ID manquant ou invalide:', id);
      return NextResponse.json({
        success: false,
        error: {
          message: 'ID produit requis',
          code: 'MISSING_PRODUCT_ID'
        }
      }, { status: 400 });
    }

    // Chercher par ID MongoDB ou par slug
    let product;
    
    // Vérifier si c'est un ObjectId valide (24 caractères hexadécimaux)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    console.log('🔍 Type de recherche:', isValidObjectId ? 'ObjectId' : 'Slug');
    console.log('🔍 Valeur à rechercher:', id);
    
    if (isValidObjectId) {
      // Recherche par ID MongoDB
      console.log('🔍 Recherche par ObjectId:', id);
      product = await Product.findById(id).lean();
    } else {
      // Recherche par slug
      console.log('🔍 Recherche par slug:', id);
      product = await Product.findOne({ slug: id }).lean();
    }

    console.log('🔍 Produit trouvé:', product ? 'OUI' : 'NON');
    
    if (!product) {
      console.error('❌ Produit introuvable avec ID/slug:', id);
      
      // DEBUG : Lister quelques produits pour vérifier
      const existingProducts = await Product.find({}, 'name slug _id').limit(5).lean();
      console.log('🔍 Exemples de produits existants:', existingProducts);
      
      return NextResponse.json({
        success: false,
        error: {
          message: 'Produit introuvable',
          code: 'PRODUCT_NOT_FOUND'
        }
      }, { status: 404 });
    }

    console.log('✅ Produit trouvé:', product.name);

    // Utiliser le formateur unifié
    const formattedProduct = formatProductResponse(product);

    console.log('✅ Produit formaté avec pricingType:', formattedProduct.pricingType);
    console.log('✅ Produit formaté avec customPricing:', formattedProduct.customPricing);

    return NextResponse.json({
      success: true,
      data: formattedProduct
    });

  } catch (error: unknown) {
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