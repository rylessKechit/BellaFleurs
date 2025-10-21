import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import ExpertiseSection from '@/components/home/ExpertiseSection';
import GallerySection from '@/components/home/GallerySection';
import EventsSection from '@/components/home/EventsSection';
import ContactSection from '@/components/home/ContactSection';
import Image from 'next/image';
import ProductOfWeekPopup from '@/components/ProductOfWeekPopup';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Bella Fleurs - Fleuriste Brétigny-sur-Orge | Livraison 24h Essonne',
    template: '%s | Bella Fleurs - Fleuriste Brétigny-sur-Orge'
  },
  description: 'Fleuriste passionnée à Brétigny-sur-Orge depuis 20 ans. Bouquets sur mesure, compositions florales, livraison 24h en Essonne. Commande en ligne.',
  keywords: [
    'fleuriste brétigny sur orge',
    'fleuriste brétigny',
    'bouquet brétigny sur orge', 
    'livraison fleurs brétigny',
    'composition florale brétigny',
    'fleurs brétigny sur orge',
    'artisan fleuriste essonne',
    'livraison fleurs 91',
    'bella fleurs',
    'fleuriste en ligne brétigny',
    'bouquet mariage brétigny sur orge',
    'fleuriste sainte geneviève des bois',
    'livraison fleurs arpajon',
    'fleurs essonne 91220'
  ],
  authors: [{ name: 'Bella Fleurs - Aurélie, Fleuriste Brétigny-sur-Orge' }],
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
    url: 'https://bella-fleurs.fr',
    title: 'Bella Fleurs - Fleuriste Brétigny-sur-Orge depuis 20 ans',
    description: 'Artisan fleuriste à Brétigny-sur-Orge. Bouquets sur mesure, compositions florales, livraison 24h Essonnes.',
    siteName: 'Bella Fleurs',
    images: [
      {
        url: '/images/incontournables.webp',
        width: 1200,
        height: 630,
        alt: 'Bella Fleurs - Fleuriste Brétigny-sur-Orge',
      },
    ],
  },
  other: {
    'geo.region': 'FR-91',
    'geo.placename': 'Brétigny-sur-Orge',
    'geo.position': '48.608684;2.302011',
    'ICBM': '48.608684, 2.302011'
  }
};

export default function Home() {
  return (
    <div className="relative">
      {/* Background global pour toute la landing page - SANS OVERLAY */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/hero-background.webp"
          alt="Bella Fleurs - Background"
          fill
          className="object-cover"
          priority
          quality={100}
          sizes="100vw"
        />
      </div>

      {/* Contenu par-dessus le background */}
      <div className="relative z-10">
        <Header />
        <main className="min-h-screen">
          <HeroSection />
          <AboutSection />
          <ExpertiseSection />
          <GallerySection />
          <EventsSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
      <ProductOfWeekPopup />
    </div>
  );
}