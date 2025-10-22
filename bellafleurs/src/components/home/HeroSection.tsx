'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Contenu principal */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-30">
        <div className="flex items-center justify-center min-h-screen">
          
          {/* Container centré simple */}
          <div className="text-center max-w-4xl space-y-8">

            <div className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg mb-6">
              <MapPin className="w-5 h-5 text-green-700 mr-2" />
              <span className="text-green-800 font-semibold">Fleuriste à Brétigny-sur-Orge</span>
            </div>
            
            {/* Titre H1 optimisé SEO */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight drop-shadow-2xl">
              Bella Fleurs
              <span className="block text-green-200 text-2xl sm:text-3xl lg:text-4xl mt-4">
                Votre fleuriste à Brétigny-sur-Orge
              </span>
            </h1>
            
            {/* Phrase principale */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight drop-shadow-2xl">
              Plus de 20 ans d'expérience, des fleurs françaises choisies avec soin, 
              livrées en 24 heures
            </h1>
            
            {/* CTA avec hover inversé */}
            <div className="pt-6">
              <Button 
                size="lg" 
                className="bg-white text-green-700 hover:bg-green-500 hover:text-white shadow-2xl hover:shadow-3xl transition-all duration-300 font-semibold px-12 py-6 text-xl h-auto rounded-2xl transform hover:scale-105"
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