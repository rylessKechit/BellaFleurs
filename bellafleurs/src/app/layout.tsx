import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import SessionProvider from '@/components/providers/SessionProvider';
import { CartProvider } from '@/contexts/CartContext';
import './globals.css';
import StructuredData from '@/components/StructuredData';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: {
    default: 'Bella Fleurs - Créations Florales d\'Exception',
    template: '%s | Bella Fleurs'
  },
  description: 'Découvrez Bella Fleurs, votre boutique de fleurs en région parisienne. Bouquets sur mesure, compositions florales et créations uniques pour tous vos événements.',
  keywords: [
    'fleuriste',
    'bouquet',
    'fleurs',
    'mariage',
    'composition florale',
    'région parisienne',
    'livraison fleurs',
    'bella fleurs'
  ],
  authors: [{ name: 'Bella Fleurs' }],
  creator: 'Bella Fleurs',
  publisher: 'Bella Fleurs',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://bellafleurs.fr',
    title: 'Bella Fleurs - Créations Florales d\'Exception',
    description: 'Découvrez nos créations florales uniques et bouquets sur mesure en région parisienne.',
    siteName: 'Bella Fleurs',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Bella Fleurs - Créations Florales',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bella Fleurs - Créations Florales d\'Exception',
    description: 'Découvrez nos créations florales uniques et bouquets sur mesure.',
    images: ['/images/og-image.jpg'],
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <StructuredData />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning={true}>
        <SessionProvider>
          <CartProvider>
            {/* Contenu principal */}
            <div className="relative z-10 min-h-screen flex flex-col">
              {children}
            </div>
            
            {/* Notifications toast */}
            <Toaster
              position="top-right"
              expand={false}
              richColors
              closeButton
              toastOptions={{
                style: {
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  color: '#374151',
                },
                className: 'font-medium',
              }}
            />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}