'use client';

import { Camera, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GallerySection() {
  // Données temporaires - à remplacer par vos vraies images
  const galleryImages = [
    { id: 1, title: "Bouquet de roses rouges", category: "Bouquets", image: "🌹" },
    { id: 2, title: "Composition moderne", category: "Compositions", image: "🏺" },
    { id: 3, title: "Mariage champêtre", category: "Événements", image: "💒" },
    { id: 4, title: "Bouquet cascade", category: "Mariages", image: "💐" },
    { id: 5, title: "Centre de table", category: "Compositions", image: "🌸" },
    { id: 6, title: "Orchidées blanches", category: "Plantes", image: "🌺" },
  ];

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
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Découvrez quelques-unes de nos réalisations récentes. 
            Chaque création est unique et reflète la personnalité de nos clients.
          </p>
        </div>

        {/* Grille galerie */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {galleryImages.map((item, index) => (
            <div 
              key={item.id}
              className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Image placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 to-pink-100 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300">
                {item.image}
              </div>
              
              {/* Overlay au hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white text-gray-900 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Voir plus
                </Button>
              </div>
              
              {/* Info */}
              <div className="p-6">
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" variant="outline" className="border-2">
            Voir toute la galerie
            <Camera className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}