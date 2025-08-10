'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';

export default function GallerySection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Catégories avec leurs images
  const items = [
    { name: 'Bouquets' },
    { name: 'Fleurs de saisons' },
    { name: 'Compositions piquées' },
    { name: 'Roses' },
    { name: 'Orchidées' },
    { name: 'Deuil' },
    { name: 'Abonnements particuliers' },
    { name: 'Abonnements professionnels' }
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
    <section id="galerie" className="py-20 relative flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl p-12 md:p-16 mx-6">
        
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-green-50 rounded-full shadow-lg mb-6">
            <Camera className="w-5 h-5 text-green-700 mr-3" />
            <span className="text-base font-semibold text-green-800">Notre Galerie</span>
          </div>
          
          <h2 className="text-4xl font-bold text-green-800 mb-6">
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
                  
                  {/* Bulle white au-dessus de chaque image */}
                  <div className="flex justify-center mb-4">
                    <div className="bg-green-50 rounded-xl px-4 py-2 shadow-lg">
                      <span className="text-sm font-medium text-green-800">{item.name}</span>
                    </div>
                  </div>

                  {/* Image avec fond dégradé */}
                  <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg bg-green-50 flex items-center justify-center">
                    <span className="text-lg font-medium text-green-700">
                      {item.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boutons navigation */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-green-50 rounded-full flex items-center justify-center hover:shadow-xl transition-all shadow-lg z-10"
          >
            <ChevronLeft className="w-6 h-6 text-green-700" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-green-50 rounded-full flex items-center justify-center hover:shadow-xl transition-all shadow-lg z-10"
          >
            <ChevronRight className="w-6 h-6 text-green-700" />
          </button>

          {/* Indicateurs */}
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: items.length - 2 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-green-600' : 'bg-green-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}