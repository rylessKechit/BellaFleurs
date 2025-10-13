'use client';

import React from 'react';
import { Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GallerySection() {
  const router = useRouter();

  // 7 catégories de services avec mapping vers les catégories API
  const items = [
    { 
      name: 'Fleurs de saisons', 
      image: '/images/fleurs-saisons.webp',
      category: 'Fleurs de saisons'
    },
    { 
      name: 'Incontournable', 
      image: '/images/incontournables.webp',
      category: 'Incontournable'
    },
    { 
      name: 'Bouquets', 
      image: '/images/bouquets.webp',
      category: 'Bouquets' // Nom exact de la catégorie dans l'API
    },
    { 
      name: 'Roses', 
      image: '/images/roses.webp',
      category: 'Roses'
    },
    { 
      name: 'Compositions piquées', 
      image: '/images/compositions.webp',
      category: 'Compositions piquées'
    },
    { 
      name: 'Orchidées', 
      image: '/images/orchidees.webp',
      category: 'Orchidées'
    },
    { 
      name: 'Deuil', 
      image: '/images/deuil.webp',
      category: 'Deuil'
    },
  ];

  // Fonction pour naviguer vers la page produits avec filtre
  const handleCategoryClick = (categoryName: string) => {
    // Encoder le nom de catégorie pour l'URL
    const encodedCategory = encodeURIComponent(categoryName);
    
    // Naviguer vers /produits avec le paramètre de catégorie
    router.push(`/produits?category=${encodedCategory}`);
  };

  return (
    <section id="galerie" className="py-12 sm:py-16 md:py-20 relative flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-12 lg:p-16 mx-3 sm:mx-6">
        
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-green-50 rounded-full shadow-lg mb-4 sm:mb-6">
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 mr-2 sm:mr-3" />
            <span className="text-sm sm:text-base font-semibold text-green-800">Notre Galerie</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 mb-4 sm:mb-6">
            Mes créations
          </h2>
          
          <p className="text-sm sm:text-base text-green-600">
            Cliquez sur une catégorie pour découvrir nos créations
          </p>
        </div>

        {/* Grille responsive - 7 services */}
        <div className="max-w-6xl mx-auto">
          
          {/* Mobile : Une colonne */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:hidden">
            {items.map((item, index) => (
              <div
                key={index}
                className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => handleCategoryClick(item.category)}
              >
                {/* Image de fond avec overlay */}
                <div 
                  className="h-48 sm:h-56 bg-cover bg-center relative"
                  style={{ 
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url(${item.image})`
                  }}
                >
                  {/* Bulle avec le nom du service */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg group-hover:bg-green-50/95 group-hover:scale-110 transition-all duration-300">
                      <span className="text-sm font-semibold text-green-800">
                        {item.name}
                      </span>
                    </div>
                  </div>
                  
                  {/* Overlay d'hover */}
                  <div className="absolute inset-0 bg-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop : 2 lignes (4 + 3) */}
          <div className="hidden md:block space-y-6 lg:space-y-8">
            
            {/* Première ligne : 4 photos */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {items.slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => handleCategoryClick(item.category)}
                >
                  {/* Image de fond avec overlay */}
                  <div 
                    className="h-56 lg:h-72 bg-cover bg-center relative"
                    style={{ 
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url(${item.image})`
                    }}
                  >
                    {/* Bulle avec le nom du service */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/95 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-lg group-hover:bg-green-50/95 group-hover:scale-110 transition-all duration-300">
                        <span className="text-sm sm:text-base font-semibold text-green-800">
                          {item.name}
                        </span>
                      </div>
                    </div>
                    
                    {/* Overlay d'hover */}
                    <div className="absolute inset-0 bg-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Indicateur cliquable */}
                    <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Camera className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Deuxième ligne : 3 photos centrées */}
            <div className="grid grid-cols-3 gap-4 lg:gap-8 max-w-4xl lg:max-w-5xl mx-auto">
              {items.slice(4, 7).map((item, index) => (
                <div
                  key={index + 4}
                  className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => handleCategoryClick(item.category)}
                >
                  {/* Image de fond avec overlay */}
                  <div 
                    className="h-56 lg:h-72 bg-cover bg-center relative"
                    style={{ 
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url(${item.image})`
                    }}
                  >
                    {/* Bulle avec le nom du service */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/95 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-lg group-hover:bg-green-50/95 group-hover:scale-110 transition-all duration-300">
                        <span className="text-sm sm:text-base font-semibold text-green-800">
                          {item.name}
                        </span>
                      </div>
                    </div>
                    
                    {/* Overlay d'hover */}
                    <div className="absolute inset-0 bg-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Indicateur cliquable */}
                    <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Camera className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
        
        {/* CTA vers la page produits */}
        <div className="text-center mt-12 sm:mt-16">
          <button
            onClick={() => router.push('/produits')}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            <Camera className="w-5 h-5 mr-2" />
            Voir toutes nos créations
          </button>
        </div>
      </div>
    </section>
  );
}