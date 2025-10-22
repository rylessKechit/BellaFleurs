// src/components/CartProductSEO.tsx
'use client';

import { useEffect } from 'react';

export default function CartProductSEO() {
  useEffect(() => {
    // Données structurées complètes pour "Bouquets sur mesure"
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Bouquets sur mesure",
      "description": "Bouquets personnalisés selon vos goûts et l'occasion",
      "image": "https://www.bellafleurs.fr/default-bouquet.jpg",
      "brand": {
        "@type": "Brand",
        "name": "Bella Fleurs"
      },
      "offers": {
        "@type": "Offer",
        "price": "35.00",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
        "url": "https://www.bellafleurs.fr/panier",
        "seller": {
          "@type": "Organization",
          "name": "Bella Fleurs"
        },
        "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": 4.8,
        "reviewCount": 15,
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
        "reviewBody": "Service de création de bouquets personnalisés de haute qualité."
      },
      "category": "Bouquets",
      "manufacturer": {
        "@type": "Organization",
        "name": "Bella Fleurs"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    script.id = 'cart-product-seo';
    
    const existingScript = document.getElementById('cart-product-seo');
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('cart-product-seo');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return null;
}