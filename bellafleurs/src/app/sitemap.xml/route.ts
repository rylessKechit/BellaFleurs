import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://bella-fleurs.fr';
  
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/produits', priority: '0.9', changefreq: 'daily' },
    { url: '/zone-livraison', priority: '0.8', changefreq: 'weekly' },
    { url: '/a-propos', priority: '0.7', changefreq: 'monthly' },
    { url: '/savoir-faire', priority: '0.7', changefreq: 'monthly' },
    { url: '/cgv', priority: '0.5', changefreq: 'yearly' },
    { url: '/mentions-legales', priority: '0.5', changefreq: 'yearly' }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
    <url>
      <loc>${baseUrl}${page.url}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>
  `).join('')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}