'use client';

import { Calendar, Heart, Star, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EventsSection() {
  const events = [
    {
      title: "Anniversaires",
      description: "Compositions personnalisées pour marquer ce jour spécial"
    },
    {
      title: "Deuil",
      description: "Arrangements respectueux pour accompagner vos moments de recueillement"
    },
    {
      title: "Entreprises",
      description: "Décorations florales pour vos événements professionnels"
    }
  ];

  return (
    <section id="evenements" className="py-30 relative flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl p-12 md:p-16 mx-6">
        
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-green-50 rounded-full shadow-lg mb-6">
            <Calendar className="w-5 h-5 text-green-700 mr-3" />
            <span className="text-base font-semibold text-green-800">Nos Événements</span>
          </div>
          
          <h2 className="text-4xl font-bold text-green-800 mb-6">
            Chaque occasion mérite ses fleurs
          </h2>
          
          <div className="p-8">
            <p className="text-xl text-green-800 leading-relaxed">
              De votre anniversaire spécial aux moments de recueillement, nous créons 
              des arrangements floraux qui subliment tous vos moments importants.
            </p>
          </div>
        </div>

        {/* Grille d'événements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-center">
          {events.map((event, index) => {
            return (
              <div
                key={index}
                className="group relative"
              >
                {/* Carte principale */}
                <div className="bg-green-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  
                  {/* Contenu */}
                  <h3 className="text-2xl font-semibold text-green-800 mb-4">
                    {event.title}
                  </h3>
                  
                  <p className="text-green-700 leading-relaxed mb-6">
                    {event.description}
                  </p>
                  
                  {/* Call to action subtil */}
                  <div className="text-sm text-green-600 group-hover:text-green-800 transition-colors">
                    En savoir plus →
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section testimonial */}
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-500 fill-current" />
                ))}
              </div>
            </div>
            
            <blockquote className="text-xl text-green-800 mb-6 leading-relaxed">
              "Bella Fleurs a sublimé notre mariage avec des compositions d'une beauté 
              exceptionnelle. Un service impeccable et une créativité sans limite."
            </blockquote>
            
            <cite className="text-green-700 font-medium">
              — Sarah & Thomas, Mariage 2024
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
}