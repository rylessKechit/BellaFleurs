'use client';

export default function StructuredData() {
  // Données LocalBusiness enrichies
  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": ["Florist", "LocalBusiness", "Store"],
    "@id": "https://bella-fleurs.fr/#florist",
    "name": "Bella Fleurs",
    "alternateName": [
      "Bella Fleurs Brétigny",
      "Fleuriste Bella Fleurs",
      "Fleuriste Brétigny-sur-Orge",
      "Fleuriste Brétigny",
      "Bella Fleurs 91220"
    ],
    "description": "Bella Fleurs, votre fleuriste artisan à Brétigny-sur-Orge (91220) depuis 20 ans. Spécialiste des bouquets sur mesure, compositions florales pour mariages, deuils et événements. Livraison express 24h dans toute l'Essonne : Sainte-Geneviève-des-Bois, Arpajon, Fleury-Mérogis, Longjumeau.",
    "image": [
      "https://bella-fleurs.fr/images/hero-background.webp",
      "https://bella-fleurs.fr/images/incontournables.webp",
      "https://bella-fleurs.fr/images/logo.png"
    ],
    "logo": "https://bella-fleurs.fr/images/logo.png",
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
      "latitude": 48.608684,
      "longitude": 2.302011
    },
    "telephone": "+33780662732",
    "email": "contact@bellafleurs.fr",
    "url": "https://bella-fleurs.fr",
    "sameAs": [
      "https://www.facebook.com/bellafleurs",
      "https://www.instagram.com/bellafleurs"
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "19:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "priceRange": "€€",
    "paymentAccepted": ["Cash", "Credit Card", "Visa", "Mastercard", "Apple Pay", "Google Pay"],
    "currenciesAccepted": "EUR",
    "areaServed": [
      {
        "@type": "City",
        "name": "Brétigny-sur-Orge",
        "containedInPlace": {
          "@type": "AdministrativeArea",
          "name": "Essonne"
        }
      },
      { "@type": "City", "name": "Sainte-Geneviève-des-Bois" },
      { "@type": "City", "name": "Arpajon" },
      { "@type": "City", "name": "Fleury-Mérogis" },
      { "@type": "City", "name": "Longjumeau" },
      { "@type": "City", "name": "Montlhéry" },
      { "@type": "City", "name": "Linas" },
      { "@type": "City", "name": "La Ville-du-Bois" },
      { "@type": "City", "name": "Massy" },
      { "@type": "City", "name": "Évry-Courcouronnes" },
      { "@type": "City", "name": "Corbeil-Essonnes" },
      { "@type": "City", "name": "Le Plessis-Pâté" }
    ],
    "founder": {
      "@type": "Person",
      "name": "Aurélie",
      "jobTitle": "Fleuriste Artisan - Maître Artisan Fleuriste",
      "description": "Fleuriste passionnée avec plus de 20 ans d'expérience, diplômée en art floral"
    },
    "knowsAbout": [
      "Bouquets de fleurs",
      "Compositions florales",
      "Fleurs de mariage",
      "Fleurs de deuil",
      "Livraison de fleurs",
      "Art floral",
      "Décoration florale événementielle"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Catalogue Bella Fleurs - Fleuriste Brétigny-sur-Orge",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Bouquets sur mesure",
            "description": "Bouquets personnalisés créés par notre fleuriste à Brétigny-sur-Orge"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Compositions florales piquées",
            "description": "Compositions élégantes pour toutes occasions"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Roses et fleurs nobles",
            "description": "Sélection de roses premium et fleurs de saison"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Livraison de fleurs express 24h",
            "description": "Livraison de bouquets en 24h à Brétigny-sur-Orge et dans l'Essonne",
            "areaServed": {
              "@type": "State",
              "name": "Essonne"
            }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Fleurs de mariage",
            "description": "Bouquet de mariée, boutonnières, décoration cérémonie et réception"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Fleurs de deuil",
            "description": "Couronnes, gerbes et compositions pour obsèques"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Fleurs pour entreprises",
            "description": "Abonnements floraux et décoration événementielle B2B"
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Marie L."
        },
        "reviewBody": "Magnifique bouquet pour l'anniversaire de ma mère ! Aurélie a su créer exactement ce que je voulais. Livraison rapide à Brétigny. Je recommande vivement cette fleuriste !"
      },
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Thomas D."
        },
        "reviewBody": "Super fleuriste à Brétigny-sur-Orge ! Les compositions sont originales et de grande qualité. Service impeccable pour notre mariage."
      },
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Sophie M."
        },
        "reviewBody": "Excellente expérience avec Bella Fleurs. Commande en ligne simple, livraison le lendemain à Sainte-Geneviève-des-Bois. Fleurs fraîches et superbes !"
      }
    ]
  };

  // FAQ Schema pour featured snippets
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Où trouver un fleuriste à Brétigny-sur-Orge ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Bella Fleurs est votre fleuriste artisan à Brétigny-sur-Orge (91220). Avec plus de 20 ans d'expérience, nous proposons des bouquets sur mesure, compositions florales et livraison express en Essonne. Commandez en ligne sur bella-fleurs.fr ou appelez le 07 80 66 27 32."
        }
      },
      {
        "@type": "Question",
        "name": "Bella Fleurs livre-t-elle à domicile à Brétigny-sur-Orge ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Oui ! Bella Fleurs propose la livraison de fleurs en 24h à Brétigny-sur-Orge et dans toute l'Essonne : Sainte-Geneviève-des-Bois, Arpajon, Fleury-Mérogis, Longjumeau, Massy, Évry et plus encore. Commandez en ligne pour une livraison rapide."
        }
      },
      {
        "@type": "Question",
        "name": "Quels sont les tarifs d'un bouquet chez Bella Fleurs ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nos bouquets commencent à partir de 25€. Nous proposons une large gamme de créations florales pour tous les budgets : bouquets du quotidien, compositions pour occasions spéciales, fleurs de mariage et de deuil. Tous nos bouquets sont créés sur mesure par notre fleuriste artisan."
        }
      },
      {
        "@type": "Question",
        "name": "Bella Fleurs propose-t-elle des fleurs pour les mariages ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolument ! Bella Fleurs est spécialisée dans les fleurs de mariage : bouquet de mariée, boutonnières, couronnes de fleurs, décoration de cérémonie et de réception. Contactez-nous pour un devis personnalisé pour votre mariage en Essonne."
        }
      },
      {
        "@type": "Question",
        "name": "Comment commander des fleurs en ligne à Brétigny-sur-Orge ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Rendez-vous sur bella-fleurs.fr pour commander vos fleurs en ligne. Choisissez parmi nos bouquets et compositions, sélectionnez votre date de livraison et réglez en toute sécurité. Livraison express 24h disponible à Brétigny-sur-Orge et environs."
        }
      },
      {
        "@type": "Question",
        "name": "Quelles villes sont livrées par Bella Fleurs ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Bella Fleurs livre dans toute l'Essonne (91) : Brétigny-sur-Orge, Sainte-Geneviève-des-Bois, Arpajon, Fleury-Mérogis, Longjumeau, Montlhéry, Linas, La Ville-du-Bois, Massy, Évry-Courcouronnes, Corbeil-Essonnes, Le Plessis-Pâté et plus encore."
        }
      }
    ]
  };

  // BreadcrumbList
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

  // WebSite Schema pour sitelinks searchbox
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Bella Fleurs - Fleuriste Brétigny-sur-Orge",
    "alternateName": "Bella Fleurs",
    "url": "https://bella-fleurs.fr",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://bella-fleurs.fr/produits?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  // Organization Schema
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bella Fleurs",
    "url": "https://bella-fleurs.fr",
    "logo": "https://bella-fleurs.fr/images/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+33780662732",
      "contactType": "customer service",
      "availableLanguage": "French",
      "areaServed": "FR"
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
    </>
  );
}
