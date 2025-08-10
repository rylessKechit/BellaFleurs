'use client';

import React from 'react';
import { Camera } from 'lucide-react';

export default function GallerySection() {

  // 7 catégories de services
  const items = [
    { name: 'Bouquets', image: '/images/bouquets.jpg' },
    { name: 'Fleurs de saisons', image: '/images/fleurs-saisons.jpg' },
    { name: 'Compositions piquées', image: '/images/compositions.jpg' },
    { name: 'Roses', image: '/images/roses.jpg' },
    { name: 'Orchidées', image: '/images/orchidees.jpg' },
    { name: 'Deuil', image: '/images/deuil.jpg' },
    { name: 'Abonnements', image: '/images/abonnements.jpg' }
  ];

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

        {/* Grille responsive - 7 services */}
        <div className="max-w-6xl mx-auto">
          
          {/* Mobile : Une colonne */}
          <div className="grid grid-cols-1 gap-8 md:hidden">
            {items.map((item, index) => (
              <div
                key={index}
                className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Image de fond avec overlay */}
                <div 
                  className="h-64 bg-cover bg-center relative"
                  style={{ 
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.0), rgba(0,0,0,0.1)), url(${item.image})`
                  }}
                >
                  {/* Bulle avec le nom du service */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg group-hover:bg-green-50/90 transition-all duration-300">
                      <span className="text-sm font-semibold text-green-800">
                        {item.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop : 2 lignes (4 + 3) */}
          <div className="hidden md:block space-y-8">
            
            {/* Première ligne : 4 photos */}
            <div className="grid grid-cols-4 gap-8">
              {items.slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {/* Image de fond avec overlay */}
                  <div 
                    className="h-72 bg-cover bg-center relative"
                    style={{ 
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${item.image})`
                    }}
                  >
                    {/* Bulle avec le nom du service */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg group-hover:bg-green-50/90 transition-all duration-300">
                        <span className="text-base font-semibold text-green-800">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Deuxième ligne : 3 photos centrées */}
            <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto">
              {items.slice(4, 7).map((item, index) => (
                <div
                  key={index + 4}
                  className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {/* Image de fond avec overlay */}
                  <div 
                    className="h-72 bg-cover bg-center relative"
                    style={{ 
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${item.image})`
                    }}
                  >
                    {/* Bulle avec le nom du service */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg group-hover:bg-green-50/90 transition-all duration-300">
                        <span className="text-base font-semibold text-green-800">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}