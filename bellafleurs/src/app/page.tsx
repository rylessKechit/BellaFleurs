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
  title: 'Bella Fleurs | Fleuriste Brétigny-sur-Orge (91220) - Livraison Fleurs 24h Essonne',
  description: 'Bella Fleurs, votre fleuriste artisan à Brétigny-sur-Orge depuis 20 ans. Bouquets sur mesure, compositions florales, fleurs mariage & deuil. Livraison express 24h Essonne (Arpajon, Sainte-Geneviève-des-Bois, Longjumeau). Commandez en ligne !',
  keywords: [
    // Requêtes principales ciblées
    'fleuriste brétigny sur orge',
    'fleuriste brétigny',
    'fleuriste bretigny sur orge',
    'fleuriste 91220',
    'bouquet brétigny sur orge',
    'livraison fleurs brétigny',
    // Services
    'fleurs mariage brétigny',
    'fleurs deuil essonne',
    'bouquet anniversaire brétigny',
    'composition florale 91',
    // Villes Essonne
    'fleuriste sainte geneviève des bois',
    'fleuriste arpajon',
    'fleuriste fleury mérogis',
    'fleuriste longjumeau',
    'fleuriste massy',
    'fleuriste évry',
    'livraison fleurs essonne',
    'livraison fleurs 91',
    // Marque
    'bella fleurs',
    'bella fleurs brétigny',
    'bellafleurs'
  ],
  alternates: {
    canonical: 'https://bella-fleurs.fr',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://bella-fleurs.fr',
    title: 'Bella Fleurs - Fleuriste Brétigny-sur-Orge | Bouquets sur mesure & Livraison 24h',
    description: 'Artisan fleuriste à Brétigny-sur-Orge depuis 20 ans. Bouquets personnalisés, compositions florales, livraison express en Essonne. Commandez en ligne !',
    siteName: 'Bella Fleurs - Fleuriste Brétigny-sur-Orge',
    images: [
      {
        url: '/images/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'Bella Fleurs - Fleuriste artisan à Brétigny-sur-Orge - Bouquets et compositions florales',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bella Fleurs - Fleuriste Brétigny-sur-Orge',
    description: 'Bouquets sur mesure, livraison 24h en Essonne. Votre fleuriste artisan depuis 20 ans.',
    images: ['/images/og-image.webp'],
  },
};

export default function Home() {
  return (
    <div className="relative">
      {/* Background global pour toute la landing page - SANS OVERLAY */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/hero-background.webp"
          alt="Bella Fleurs - Fleuriste Brétigny-sur-Orge - Bouquets et compositions florales artisanales en Essonne"
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