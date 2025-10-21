'use client';

export default function StructuredData() {
  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "FloristShop",
    "name": "Bella Fleurs",
    "description": "Fleuriste artisan à Brétigny-sur-Orge depuis 20 ans, spécialisée en bouquets sur mesure et compositions florales. Livraison 24h en Essonne.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Brétigny-sur-Orge",
      "addressLocality": "Brétigny-sur-Orge", 
      "postalCode": "91220",
      "addressRegion": "Essonne",
      "addressCountry": "FR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "48.608684",
      "longitude": "2.302011"
    },
    "telephone": "07 80 66 27 32",
    "email": "contact@bellafleurs.fr",
    "url": "https://bella-fleurs.fr",
    "openingHours": [
      "Mo-Fr 09:00-18:00",
      "Sa 09:00-17:00"
    ],
    "priceRange": "€€",
    "paymentAccepted": ["Cash", "Credit Card", "Online Payment"],
    "areaServed": [
      {
        "@type": "City",
        "name": "Brétigny-sur-Orge"
      },
      {
        "@type": "City", 
        "name": "Sainte-Geneviève-des-Bois"
      },
      {
        "@type": "City",
        "name": "Arpajon"
      },
      {
        "@type": "City",
        "name": "Fleury-Mérogis"
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Créations Florales",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Bouquets sur mesure",
            "description": "Bouquets personnalisés selon vos goûts et l'occasion"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Product",
            "name": "Compositions florales",
            "description": "Compositions élégantes pour décoration et événements"
          }
        }
      ]
    },
    "founder": {
      "@type": "Person",
      "name": "Aurélie",
      "jobTitle": "Fleuriste Artisan"
    }
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization", 
    "name": "Bella Fleurs",
    "url": "https://bella-fleurs.fr",
    "logo": "https://bella-fleurs.fr/images/logo-bella-fleurs.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "07 80 66 27 32",
      "contactType": "customer service",
      "areaServed": "FR",
      "availableLanguage": "French"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }}
      />
      <script
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
    </>
  );
}