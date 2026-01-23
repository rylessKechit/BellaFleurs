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
  metadataBase: new URL('https://bella-fleurs.fr'),
  title: {
    default: 'Bella Fleurs - Fleuriste Brétigny-sur-Orge (91220) | Livraison 24h Essonne',
    template: '%s | Bella Fleurs - Fleuriste Brétigny-sur-Orge'
  },
  description: 'Bella Fleurs, votre fleuriste artisan à Brétigny-sur-Orge depuis 20 ans. Bouquets sur mesure, compositions florales, fleurs mariage & deuil. Livraison express 24h en Essonne. Commandez en ligne !',
  keywords: [
    // Mots-clés principaux locaux
    'fleuriste brétigny sur orge',
    'fleuriste brétigny',
    'fleuriste bretigny',
    'fleuriste brétigny-sur-orge',
    'fleuriste 91220',
    'fleuriste essonne',
    // Variations et intentions
    'bouquet brétigny sur orge',
    'livraison fleurs brétigny',
    'livraison fleurs 91',
    'composition florale brétigny',
    'fleurs brétigny sur orge',
    // Services spécifiques
    'fleurs mariage brétigny',
    'fleurs deuil brétigny',
    'bouquet anniversaire brétigny',
    // Villes alentour
    'fleuriste sainte geneviève des bois',
    'fleuriste arpajon',
    'fleuriste fleury mérogis',
    'fleuriste longjumeau',
    'livraison fleurs essonne',
    // Marque
    'bella fleurs',
    'bella fleurs brétigny'
  ],
  authors: [{ name: 'Bella Fleurs - Aurélie, Fleuriste Artisan' }],
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
  alternates: {
    canonical: 'https://bella-fleurs.fr',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://bella-fleurs.fr',
    title: 'Bella Fleurs - Fleuriste Brétigny-sur-Orge | Bouquets & Livraison 24h',
    description: 'Votre fleuriste artisan à Brétigny-sur-Orge depuis 20 ans. Bouquets sur mesure, compositions florales, livraison express en Essonne.',
    siteName: 'Bella Fleurs',
    images: [
      {
        url: '/images/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'Bella Fleurs - Fleuriste Brétigny-sur-Orge - Bouquets et compositions florales',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bella Fleurs - Fleuriste Brétigny-sur-Orge',
    description: 'Bouquets sur mesure, compositions florales, livraison 24h en Essonne',
    images: ['/images/og-image.webp'],
  },
  verification: {
    google: 'votre-code-google-search-console',
  },
  category: 'Fleuriste',
  other: {
    'geo.region': 'FR-91',
    'geo.placename': 'Brétigny-sur-Orge',
    'geo.position': '48.608684;2.302011',
    'ICBM': '48.608684, 2.302011',
    'business:contact_data:locality': 'Brétigny-sur-Orge',
    'business:contact_data:postal_code': '91220',
    'business:contact_data:country_name': 'France',
    'business:contact_data:phone_number': '+33780662732',
    'business:contact_data:email': 'contact@bellafleurs.fr',
  }
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