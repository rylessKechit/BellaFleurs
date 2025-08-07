'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-background.png"
          alt="Bella Fleurs - Créations florales d'exception"
          fill
          className="object-cover"
          priority
          quality={90}
          sizes="100vw"
        />
        
        {/* Overlay pour la lisibilité */}
        <div className="absolute inset-0 bg-black/50 z-10"></div>
      </div>
      
      {/* Fallback background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 -z-10"></div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="flex items-center justify-center min-h-screen">
          
          {/* Container centré simple */}
          <div className="text-center max-w-4xl space-y-8">
            
            {/* Phrase principale */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight drop-shadow-2xl">
              Plus de 20 ans d'expérience, des fleurs françaises choisies avec soin, 
              livrées en 24 heures
            </h1>
            
            {/* CTA */}
            <div className="pt-6">
              <Button 
                size="lg" 
                className="bg-white text-green-700 hover:bg-white/90 shadow-2xl hover:shadow-3xl transition-all duration-300 font-semibold px-12 py-6 text-xl h-auto rounded-2xl transform hover:scale-105"
                asChild
              >
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