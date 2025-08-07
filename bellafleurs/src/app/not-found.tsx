// src/app/not-found.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Flower2 } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-pink-50 px-4">
      <div className="text-center space-y-8 max-w-md">
        {/* Illustration 404 florale */}
        <div className="relative">
          {/* Le "4" */}
          <div className="text-9xl font-bold text-primary-200 select-none relative">
            4
            <Flower2 className="absolute top-4 right-2 w-12 h-12 text-primary-400 animate-bounce" />
          </div>
          
          {/* Le "0" au milieu */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
            <div className="text-9xl font-bold text-primary-200 select-none relative">
              <div className="relative">
                0
                {/* Petites fleurs autour du 0 */}
                <div className="absolute -top-2 -left-2 w-6 h-6 text-pink-400 animate-pulse">🌸</div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 text-primary-400 animate-pulse" style={{animationDelay: '0.5s'}}>🌺</div>
                <div className="absolute top-1/2 -right-4 w-4 h-4 text-pink-300 animate-pulse" style={{animationDelay: '1s'}}>🌼</div>
              </div>
            </div>
          </div>
          
          {/* Le dernier "4" */}
          <div className="absolute top-0 right-0">
            <div className="text-9xl font-bold text-primary-200 select-none relative">
              4
              <Flower2 className="absolute top-8 left-2 w-8 h-8 text-pink-400 animate-bounce" style={{animationDelay: '0.3s'}} />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Oups ! Page introuvable
          </h1>
          <p className="text-lg text-gray-600">
            Cette page semble avoir été emportée par le vent... 
            comme un pétale de rose ! 🌹
          </p>
          <p className="text-base text-gray-500">
            Mais ne vous inquiétez pas, nous avons plein d'autres 
            belles créations à vous montrer !
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center px-6 py-3 
                     bg-white text-primary-700 border-2 border-primary-200
                     hover:bg-primary-50 hover:border-primary-300
                     focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                     rounded-lg font-medium transition-all duration-200
                     shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center px-6 py-3
                     bg-gradient-to-r from-primary-600 to-primary-700 
                     text-white hover:from-primary-700 hover:to-primary-800
                     focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                     rounded-lg font-medium transition-all duration-200
                     shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Home className="w-5 h-5 mr-2" />
            Accueil
          </button>
        </div>

        {/* Message poétique */}
        <div className="mt-8 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-primary-100">
          <p className="text-sm text-gray-600 italic">
            "Comme une fleur qui cherche la lumière, 
            chaque chemin mène à une nouvelle découverte..."
          </p>
        </div>

        {/* Pétales animés en arrière-plan */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 3}s`,
                fontSize: `${12 + Math.random() * 8}px`
              }}
            >
              {['🌸', '🌺', '🌼', '🌻', '🌷'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}