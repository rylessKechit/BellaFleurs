import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import SessionProvider from '@/components/providers/SessionProvider';
import { CartProvider } from '@/contexts/CartContext';
import './globals.css';
import StructuredData from '@/components/StructuredData';
import ChristmasDecoration from '@/components/christmas/ChristmasDecoration';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: {
    default: 'Bella Fleurs - Fleuriste Brétigny-sur-Orge | Livraison 24h Essonne',
    template: '%s | Bella Fleurs - Fleuriste Brétigny-sur-Orge'
  },
  description: 'Fleuriste passionnée à Brétigny-sur-Orge depuis 20 ans. Bouquets sur mesure, compositions florales, livraison 24h en Essonne. Commande en ligne.',
  keywords: [
    'fleuriste brétigny sur orge',
    'fleuriste brétigny',
    'fleuriste bretigny',
    'fleuriste brétigny-sur-orge',
    'fleuriste bretigny sur orge',
    'bouquet brétigny sur orge', 
    'livraison fleurs brétigny',
    'composition florale brétigny',
    'fleurs brétigny sur orge',
    'artisan fleuriste essonne',
    'livraison fleurs 91',
    'bella fleurs'
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://bella-fleurs.fr',
    title: 'Bella Fleurs - Fleuriste Brétigny-sur-Orge depuis 20 ans',
    description: 'Artisan fleuriste à Brétigny-sur-Orge. Bouquets sur mesure, compositions florales, livraison 24h Essonne.',
    siteName: 'Bella Fleurs',
  },
  other: {
    'geo.region': 'FR-91',
    'geo.placename': 'Brétigny-sur-Orge',
    'geo.position': '48.608684;2.302011',
    'ICBM': '48.608684, 2.302011'
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
              {/* <ChristmasDecoration density="light" /> */}
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