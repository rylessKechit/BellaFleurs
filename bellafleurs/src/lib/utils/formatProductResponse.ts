// src/lib/utils/formatProductResponse.ts
// Utilitaire pour formater les réponses produit de manière cohérente
// 🔧 CORRECTION : Ajout du support freeDelivery

interface DBProduct {
  _id: string;
  name: string;
  description: string;
  price?: number;
  hasVariants: boolean;
  variants: any[];
  images: string[];
  category: string;
  isActive: boolean;
  freeDelivery?: boolean; // ← AJOUT : Support freeDelivery
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
  [key: string]: any;
}

interface FormattedProduct {
  _id: string;
  name: string;
  description: string;
  price?: number;
  hasVariants: boolean;
  variants: any[];
  displayPrice: number;
  displayPriceFormatted: string;
  priceRangeFormatted: string;
  images: string[];
  category: string;
  isActive: boolean;
  freeDelivery: boolean; // ← AJOUT : Support freeDelivery
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

export function formatProductResponse(product: DBProduct): FormattedProduct {
  // 🔧 CORRECTION : Logique prix unifiée et cohérente
  let displayPrice = 0;
  let displayPriceFormatted = '';
  let priceRangeFormatted = '';

  // Nettoyer les variants pour produits simples
  let cleanVariants = product.variants || [];
  if (!product.hasVariants) {
    cleanVariants = [];
  }

  // Calculer le prix d'affichage
  if (!product.hasVariants) {
    // Produit simple
    displayPrice = product.price || 0;
    displayPriceFormatted = formatPrice(displayPrice);
    priceRangeFormatted = displayPriceFormatted;
  } else if (cleanVariants.length > 0) {
    // Produit avec variants
    const activeVariants = cleanVariants.filter((v: any) => v.isActive !== false);
    
    if (activeVariants.length > 0) {
      const prices = activeVariants.map((v: any) => v.price).sort((a: number, b: number) => a - b);
      const minPrice = prices[0];
      const maxPrice = prices[prices.length - 1];
      
      displayPrice = minPrice;
      displayPriceFormatted = formatPrice(minPrice);
      
      if (minPrice === maxPrice) {
        priceRangeFormatted = formatPrice(minPrice);
      } else {
        priceRangeFormatted = `À partir de ${formatPrice(minPrice)}`;
      }
    } else {
      // Pas de variants actifs
      displayPriceFormatted = 'Prix non disponible';
      priceRangeFormatted = 'Prix non disponible';
    }
  } else {
    // hasVariants = true mais pas de variants
    displayPriceFormatted = 'Prix non défini';
    priceRangeFormatted = 'Prix non défini';
  }

  return {
    _id: product._id,
    name: product.name,
    description: product.description,
    price: product.price,
    hasVariants: product.hasVariants,
    variants: cleanVariants,
    displayPrice,
    displayPriceFormatted,
    priceRangeFormatted,
    images: product.images,
    category: product.category,
    isActive: product.isActive,
    freeDelivery: product.freeDelivery || false, // ← AJOUT : Inclusion freeDelivery
    tags: product.tags || [],
    slug: product.slug,
    averageRating: product.averageRating || 0,
    reviewsCount: product.reviewsCount || 0,
    entretien: product.entretien,
    careInstructions: product.careInstructions,
    difficulty: product.difficulty,
    composition: product.composition,
    motsClesSEO: product.motsClesSEO || [],
    createdAt: product.createdAt
  };
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
}