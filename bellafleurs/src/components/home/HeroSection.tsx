'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, Star, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image avec Next.js Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-background.png"
          alt="Bella Fleurs - Atelier de création florale parisien"
          fill
          className="object-cover"
          priority
          quality={90}
          sizes="100vw"
        />
        
        {/* Overlay dégradé pour la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/50 z-10"></div>
      </div>
      
      {/* Fallback background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-pink-50 to-primary-100 -z-10"></div>

      {/* Pétales flottants décoratifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-20 text-2xl"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }}
          >
            {['🌸', '🌺', '🌼', '🌻'][i % 4]}
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center min-h-screen py-20">
          
          {/* Contenu principal - BEAUCOUP PLUS LARGE */}
          <div className="lg:col-span-3 space-y-10">
            {/* Badge d'introduction */}
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/25">
              <Sparkles className="w-4 h-4 text-pink-300" />
              <span className="text-white text-sm font-medium">Depuis 2019 à Paris</span>
            </div>

            {/* Titre principal - LARGE ET IMPACTANT */}
            <div className="space-y-6">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold leading-tight">
                <span className="block text-white drop-shadow-2xl mb-2">
                  Bella Fleurs
                </span>
                <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-pink-200 font-light drop-shadow-lg">
                  Créations florales d'exception
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl lg:text-3xl text-white/90 leading-relaxed max-w-4xl drop-shadow-lg">
                Transformons vos émotions en bouquets uniques. 
                Chaque création raconte votre histoire avec élégance et passion.
              </p>
            </div>

            {/* Statistiques - EN LIGNE HORIZONTALE */}
            <div className="flex items-center gap-8 lg:gap-12 text-white flex-wrap">
              <div className="text-center">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                  <span className="text-3xl lg:text-4xl font-bold">4.9</span>
                </div>
                <p className="text-base lg:text-lg text-white/80">127 avis clients</p>
              </div>
              
              <div className="w-px h-16 bg-white/30"></div>
              
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold mb-1">500+</div>
                <p className="text-base lg:text-lg text-white/80">Créations livrées</p>
              </div>
              
              <div className="w-px h-16 bg-white/30"></div>
              
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold mb-1">5</div>
                <p className="text-base lg:text-lg text-white/80">Années d'expertise</p>
              </div>
            </div>

            {/* Boutons d'action - EN LIGNE */}
            <div className="flex flex-col sm:flex-row gap-6">
              <Button 
                size="lg" 
                className="bg-white text-primary-700 hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold px-12 py-6 text-lg h-auto rounded-xl"
                asChild
              >
                <Link href="/produits">
                  Découvrir nos fleurs
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-3 border-white bg-transparent text-white hover:bg-white hover:text-primary-700 backdrop-blur-sm shadow-xl transition-all duration-300 font-semibold px-12 py-6 text-lg h-auto rounded-xl"
                asChild
              >
                <Link href="#contact">
                  Nous contacter
                </Link>
              </Button>
            </div>

            {/* Services - PLUS ESPACÉS HORIZONTALEMENT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
              <div className="flex items-center gap-4 text-white/90 text-lg">
                <Check className="w-6 h-6 text-green-400 flex-shrink-0" />
                <span>Livraison gratuite dès 50€</span>
              </div>
              <div className="flex items-center gap-4 text-white/90 text-lg">
                <Check className="w-6 h-6 text-blue-400 flex-shrink-0" />
                <span>Bouquets sur mesure</span>
              </div>
              <div className="flex items-center gap-4 text-white/90 text-lg">
                <Check className="w-6 h-6 text-pink-400 flex-shrink-0" />
                <span>Fraîcheur garantie</span>
              </div>
            </div>
          </div>

          {/* Colonne droite - PLUS COMPACTE */}
          <div className="lg:col-span-2 hidden lg:block space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-lg">
                Nos dernières créations
              </h3>
              <p className="text-white/80 text-sm">Inspirez-vous de nos récentes réalisations</p>
            </div>
            
            {/* Grille de créations */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Bouquet Romantique", emoji: "🌹", bg: "bg-red-500/20" },
                { name: "Composition Moderne", emoji: "🌸", bg: "bg-pink-500/20" },
                { name: "Mariage Champêtre", emoji: "💐", bg: "bg-purple-500/20" },
                { name: "Centre de Table", emoji: "🌺", bg: "bg-orange-500/20" }
              ].map((item, index) => (
                <div 
                  key={index}
                  className={`${item.bg} backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 cursor-pointer`}
                >
                  <div className="text-4xl mb-2">{item.emoji}</div>
                  <h4 className="text-white font-medium text-sm">{item.name}</h4>
                </div>
              ))}
            </div>

            {/* Témoignage rapide */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mt-8">
              <div className="flex items-center gap-2 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-white/90 text-sm italic mb-3">
                "Un travail magnifique pour mon mariage ! L'équipe a su comprendre exactement ce que je voulais."
              </p>
              <div className="text-white/70 text-xs">
                — Sarah M. • Mariée en juin 2024
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicateur de scroll */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center p-2">
            <div className="w-1 h-3 bg-white/80 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}