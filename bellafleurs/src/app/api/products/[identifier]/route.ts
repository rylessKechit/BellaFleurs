// src/app/api/products/[id]/route.ts - Version alternative si la première ne marche pas
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { formatProductResponse } from '@/lib/utils/formatProductResponse';

// GET /api/products/[id] - Récupérer un produit par ID ou slug
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // 🔧 ALTERNATIVE : Extraire l'ID depuis l'URL directement
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
      
      // 🔧 DEBUG : Lister quelques produits pour vérifier
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

    // 🔧 CORRECTION : Utiliser le formateur unifié
    const formattedProduct = formatProductResponse(product);

    console.log('✅ Produit formaté avec hasVariants:', formattedProduct.hasVariants);

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