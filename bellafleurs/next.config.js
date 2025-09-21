const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // SUPPRIMER LA LIGNE quality: 100 - ça n'existe pas ici
  },
  
  webpack: (config, { isServer }) => {
    // Configuration pour éviter les erreurs de modules
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      });
    }

    // Résolution des modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Alias
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    return config;
  },

  // Désactiver les warnings pendant le développement
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: false,
  },

  // Options de base
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;