'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';

export default function GallerySection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Catégories avec leurs images
  const items = [
    { name: 'Bouquets', emoji: '💐' },
    { name: 'Fleurs de saisons', emoji: '🌸' },
    { name: 'Compositions piquées', emoji: '🏺' },
    { name: 'Roses', emoji: '🌹' },
    { name: 'Orchidées', emoji: '🌺' },
    { name: 'Deuil', emoji: '🤍' },
    { name: 'Abonnements particuliers', emoji: '🏠' },
    { name: 'Abonnements professionnels', emoji: '🏢' }
  ];

  // Auto-play fluide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = items.length - 3; // 3 images visibles pour un meilleur affichage
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 4000); // Plus lent pour être moins brusque
    
    return () => clearInterval(interval);
  }, [items.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = items.length - 3; // 3 images visibles
      return prev >= maxIndex ? 0 : prev + 1;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = items.length - 3;
      return prev <= 0 ? maxIndex : prev - 1;
    });
  };

  return (
    <section id="galerie" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-full mb-6">
            <Camera className="w-4 h-4 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-primary-700">Notre Galerie</span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Mes créations
          </h2>
        </div>

        {/* Carrousel horizontal */}
        <div className="relative max-w-6xl mx-auto">
          
          {/* Container avec overflow hidden */}
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-1000 ease-in-out" // Transition plus fluide et lente
              style={{ transform: `translateX(-${currentIndex * 33.33}%)` }} // 33.33% pour 3 images visibles
            >
              {items.map((item, index) => (
                <div key={index} className="flex-none w-1/3 px-3"> {/* w-1/3 pour 3 images visibles, plus d'espace */}
                  
                  {/* Bulle glass au-dessus de chaque image */}
                  <div className="flex justify-center mb-4">
                    <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 border border-white/30 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{item.emoji}</span> {/* Emoji plus grand */}
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Image plus grande */}
                  <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-primary-100 to-pink-100 flex items-center justify-center">
                    <span className="text-7xl opacity-40"> {/* Emoji dans l'image plus grand */}
                      {item.emoji}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boutons navigation */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg z-10"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg z-10"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>

          {/* Indicateurs */}
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: items.length - 2 }).map((_, index) => ( // Ajusté pour 3 images visibles
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}