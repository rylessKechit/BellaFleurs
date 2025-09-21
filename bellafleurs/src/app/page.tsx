import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import ExpertiseSection from '@/components/home/ExpertiseSection';
import GallerySection from '@/components/home/GallerySection';
import EventsSection from '@/components/home/EventsSection';
import ContactSection from '@/components/home/ContactSection';
import Image from 'next/image';

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
    </div>
  );
}