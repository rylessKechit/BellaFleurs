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
    <section id="evenements" className="py-12 sm:py-16 md:py-20 relative flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-12 lg:p-16 mx-3 sm:mx-6">
        
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-green-50 rounded-full shadow-lg mb-4 sm:mb-6">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 mr-2 sm:mr-3" />
            <span className="text-sm sm:text-base font-semibold text-green-800">Nos Événements</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 mb-4 sm:mb-6">
            Chaque occasion mérite ses fleurs
          </h2>
          
          <div className="p-4 sm:p-6 md:p-8">
            <p className="text-base sm:text-lg md:text-xl text-green-800 leading-relaxed">
              De votre anniversaire spécial aux moments de recueillement, nous créons 
              des arrangements floraux qui subliment tous vos moments importants.
            </p>
          </div>
        </div>

        {/* Grille d'événements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 text-center">
          {events.map((event, index) => {
            return (
              <div
                key={index}
                className="group relative"
              >
                {/* Carte principale */}
                <div className="bg-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  
                  {/* Contenu */}
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-green-800 mb-3 sm:mb-4">
                    {event.title}
                  </h3>
                  
                  <p className="text-sm sm:text-base text-green-700 leading-relaxed mb-4 sm:mb-6">
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}