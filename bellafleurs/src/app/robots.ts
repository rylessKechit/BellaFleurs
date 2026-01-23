import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/compte/',
          '/panier/',
          '/checkout/',
          '/corporate/',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/compte/',
          '/checkout/',
          '/corporate/',
        ],
      },
    ],
    sitemap: 'https://bella-fleurs.fr/sitemap.xml',
    host: 'https://bella-fleurs.fr',
  };
}
