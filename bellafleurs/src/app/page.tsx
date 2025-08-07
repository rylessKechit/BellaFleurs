import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import ExpertiseSection from '@/components/home/ExpertiseSection';
import GallerySection from '@/components/home/GallerySection';
import EventsSection from '@/components/home/EventsSection';
import ContactSection from '@/components/home/ContactSection';
import FloralAnimations from '@/components/home/FloralAnimations';

export default function Home() {
  return (
    <>
      <FloralAnimations />
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
    </>
  );
}