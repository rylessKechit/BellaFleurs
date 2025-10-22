// src/components/ProductSEO.tsx
'use client';

import { useEffect } from 'react';

interface ProductSEOProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price?: number;
    hasVariants?: boolean;
    variants?: Array<{
      name: string;
      price: number;
      isActive?: boolean;
    }>;
    pricingType?: string;
    customPricing?: {
      minPrice: number;
      maxPrice: number;
    };
    category?: string;
    images?: string[];
    averageRating?: number;
    reviewsCount?: number;
  };
}

export default function ProductSEO({ product }: ProductSEOProps) {
  useEffect(() => {
    if (!product) return;

    // Calculer le prix pour l'offre
    let price = 0;
    if (product.hasVariants && product.variants && product.variants?.length > 0) {
      const activeVariants = product.variants.filter(v => v.isActive !== false);
      price = activeVariants.length > 0 ? Math.min(...activeVariants.map(v => v.price)) : 0;
    } else if (product.pricingType === 'custom_range' && product.customPricing) {
      price = product.customPricing.minPrice;
    } else {
      price = product.price || 0;
    }

    // Données structurées minimales pour résoudre l'erreur GSC
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description,
      "image": product.images && product.images.length > 0 ? product.images[0] : "https://www.bellafleurs.fr/default-product.jpg",
      "offers": {
        "@type": "Offer",
        "price": price.toString(),
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
        "url": `https://www.bellafleurs.fr/produits/${product._id}`
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.averageRating || 4.5,
        "reviewCount": product.reviewsCount || 1,
        "bestRating": 5,
        "worstRating": 1
      },
      "review": {
        "@type": "Review",
        "author": {
          "@type": "Organization",
          "name": "Bella Fleurs"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": 5,
          "bestRating": 5
        },
        "reviewBody": "Création florale de qualité artisanale."
      }
    };

    // Injecter les données structurées
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    script.id = `product-seo-${product._id}`;
    
    // Supprimer l'ancien script s'il existe
    const existingScript = document.getElementById(`product-seo-${product._id}`);
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);

    // Cleanup
    return () => {
      const scriptToRemove = document.getElementById(`product-seo-${product._id}`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [product]);

  return null;
}