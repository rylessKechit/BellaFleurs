'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

// src/components/home/HeroSection.tsx
export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-30">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-4xl space-y-8">

            <div className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg mb-6">
              <MapPin className="w-5 h-5 text-green-700 mr-2" />
              <span className="text-green-800 font-semibold">Fleuriste à Brétigny-sur-Orge</span>
            </div>
            
            {/* H1 OPTIMISÉ SEO LOCAL */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight drop-shadow-2xl">
              Bella Fleurs
            </h1>
            
            {/* H2 pour compléter le SEO */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight drop-shadow-2xl">
              Bouquets sur mesure, compositions florales, livraison 24h en Essonne
            </h2>
            
            <div className="pt-6">
              <Button size="lg" className="...">
                <Link href="/produits">
                  Découvrir mes créations
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}