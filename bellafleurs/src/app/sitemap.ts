import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bella-fleurs.fr';

  // Pages statiques principales
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/produits`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/panier`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/connexion`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/inscription`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  // Pages de catégories de produits (SEO local)
  const categoryPages = [
    'bouquets',
    'compositions-piquees',
    'roses',
    'plantes',
    'deuil',
    'mariage',
  ].map((category) => ({
    url: `${baseUrl}/produits?categorie=${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages];
}
