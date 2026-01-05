'use client';

export default function StructuredData() {
  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": ["FloristShop", "LocalBusiness"],
    "name": "Bella Fleurs",
    "alternateName": [
      "Bella Fleurs Brétigny",
      "Fleuriste Bella Fleurs",
      "Fleuriste Brétigny-sur-Orge"
    ],
    "description": "Fleuriste artisan à Brétigny-sur-Orge depuis 20 ans, spécialisée en bouquets sur mesure, compositions florales et livraison express en Essonne. Fleuriste Brétigny, fleuriste Bretigny sur orge.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "",
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
    "sameAs": [
      "https://www.facebook.com/bellafleurs",
      "https://www.instagram.com/bellafleurs"
    ],
    "openingHours": [
      "Mo-Sa 09:00-19:00"
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "19:00"
      }
    ],
    "priceRange": "€€",
    "paymentAccepted": ["Cash", "Credit Card", "Online Payment"],
    "currenciesAccepted": "EUR",
    "areaServed": [
      {
        "@type": "City",
        "name": "Brétigny-sur-Orge",
        "addressRegion": "Essonne",
        "addressCountry": "FR"
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
      },
      {
        "@type": "City",
        "name": "Longjumeau"
      },
      {
        "@type": "City",
        "name": "Montlhéry"
      }
    ],
    "founder": {
      "@type": "Person",
      "name": "Aurélie",
      "jobTitle": "Fleuriste Artisan",
      "worksFor": {
        "@type": "Organization",
        "name": "Bella Fleurs"
      }
    },
    "makesOffer": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "Bouquets sur mesure",
          "category": "Fleurs"
        }
      },
      {
        "@type": "Offer", 
        "itemOffered": {
          "@type": "Product",
          "name": "Compositions florales",
          "category": "Fleurs"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Livraison de fleurs 24h",
          "areaServed": "Essonne"
        }
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Catalogue Bella Fleurs",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Bouquets",
          "numberOfItems": 20
        },
        {
          "@type": "OfferCatalog", 
          "name": "Compositions piquées",
          "numberOfItems": 15
        },
        {
          "@type": "OfferCatalog",
          "name": "Roses",
          "numberOfItems": 10
        }
      ]
    }
  };

  // Ajouter BreadcrumbList pour la navigation
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": "https://bella-fleurs.fr"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Fleuriste Brétigny-sur-Orge",
        "item": "https://bella-fleurs.fr"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
    </>
  );
}