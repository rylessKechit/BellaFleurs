// src/components/LegalPageSEO.tsx
'use client';

import { useEffect } from 'react';

interface LegalPageSEOProps {
  pageType: 'privacy' | 'terms' | 'legal';
  pageUrl: string;
  pageTitle: string;
  pageDescription: string;
}

export default function LegalPageSEO({ 
  pageType, 
  pageUrl, 
  pageTitle, 
  pageDescription 
}: LegalPageSEOProps) {
  useEffect(() => {
    // Données structurées pour les pages légales
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": pageTitle,
      "description": pageDescription,
      "url": pageUrl,
      "isPartOf": {
        "@type": "WebSite",
        "name": "Bella Fleurs",
        "url": "https://www.bellafleurs.fr"
      },
      "publisher": {
        "@type": "Organization",
        "@id": "https://www.bellafleurs.fr#organization",
        "name": "Bella Fleurs",
        "url": "https://www.bellafleurs.fr",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Brétigny-sur-Orge",
          "addressRegion": "Île-de-France",
          "postalCode": "91220",
          "addressCountry": "FR"
        }
      },
      "mainEntity": {
        "@type": "Article",
        "headline": pageTitle,
        "description": pageDescription,
        "author": {
          "@type": "Organization",
          "name": "Bella Fleurs"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Bella Fleurs"
        },
        "dateModified": new Date().toISOString().split('T')[0],
        "datePublished": "2024-01-01"
      },
      // Ajout spécifique pour éviter les erreurs d'offres
      "potentialAction": {
        "@type": "ReadAction",
        "target": pageUrl
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    script.id = `legal-page-seo-${pageType}`;
    
    const existingScript = document.getElementById(`legal-page-seo-${pageType}`);
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(`legal-page-seo-${pageType}`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [pageType, pageUrl, pageTitle, pageDescription]);

  return null;
}