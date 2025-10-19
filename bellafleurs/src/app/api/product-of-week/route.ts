import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
  try {
    await connectDB();
    
    // Récupérer directement le produit fixe (toujours activé)
    const product = await Product.findById('68db9182e2280ad09cabfa83');
    
    if (!product || !product.isActive) {
      return NextResponse.json({
        success: true,
        data: {
          isEnabled: false,
          product: null
        }
      });
    }

    // Calculer le prix d'affichage
    let displayPrice = 0;
    let displayPriceFormatted = '';
    let priceRangeFormatted = '';

    if (!product.hasVariants) {
      displayPrice = product.price || 0;
      displayPriceFormatted = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(displayPrice);
      priceRangeFormatted = displayPriceFormatted;
    } else if (product.variants && product.variants.length > 0) {
      const activeVariants = product.variants.filter((v: any) => v.isActive !== false);
      
      if (activeVariants.length > 0) {
        const prices = activeVariants.map((v: any) => v.price).sort((a: number, b: number) => a - b);
        const minPrice = prices[0];
        const maxPrice = prices[prices.length - 1];
        
        displayPrice = minPrice;
        displayPriceFormatted = new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(minPrice);
        
        if (minPrice === maxPrice) {
          priceRangeFormatted = displayPriceFormatted;
        } else {
          priceRangeFormatted = `À partir de ${displayPriceFormatted}`;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        isEnabled: true, // Toujours activé
        title: 'Produit de la semaine',
        description: 'Découvrez notre sélection exceptionnelle cette semaine !',
        product: {
          _id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          hasVariants: product.hasVariants,
          variants: product.variants,
          images: product.images,
          category: product.category,
          slug: product.slug,
          displayPrice,
          displayPriceFormatted,
          priceRangeFormatted
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Product of week error:', error);
    return NextResponse.json({
      success: true,
      data: {
        isEnabled: false,
        product: null
      }
    });
  }
}