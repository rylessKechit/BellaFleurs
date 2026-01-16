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

            {/* H1 OPTIMISÉ SEO LOCAL */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight drop-shadow-2xl">
              Bella Fleurs
            </h1>
            
            {/* H2 pour compléter le SEO */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight drop-shadow-2xl">
              Bouquets sur mesure, compositions florales, livraison 24h en Essonne
            </h2>
            
            <div className="pt-8">
              <Button size="lg" className="px-8 py-4 sm:px-12 sm:py-6 lg:px-16 lg:py-8 text-base sm:text-lg lg:text-xl bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg sm:rounded-xl shadow-2xl hover:shadow-green-500/50 transition-all transform hover:scale-105">
                <Link href="/produits" className="flex items-center">
                  Découvrir mes créations
                  <ArrowRight className="ml-2 w-5 h-5 sm:ml-3 sm:w-6 sm:h-6 lg:ml-4 lg:w-7 lg:h-7" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}