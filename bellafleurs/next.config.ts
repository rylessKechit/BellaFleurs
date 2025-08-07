/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router activé par défaut dans Next.js 14
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'bellafleurs.fr']
    }
  },
  
  // Images optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**'
      }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  
  // Webpack configuration pour les imports et alias
  webpack: (config: any, { isServer }: {isServer: boolean}) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false
      };
    }
    
    // Configuration de l'alias @ pour pointer vers src/
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    
    return config;
  },
  
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  
  // Redirections
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true
      }
    ];
  },
  
  // Variables d'environnement publiques
  env: {
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME
  },
  
  // Compression
  compress: true,
  
  // PoweredBy header
  poweredByHeader: false,
  
  // Génération statique pour les pages publiques
  output: 'standalone'
};

// Import nécessaire pour l'alias
const path = require('path');

module.exports = nextConfig;