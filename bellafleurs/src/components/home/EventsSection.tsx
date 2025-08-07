'use client';

import { Calendar, Heart, Star, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EventsSection() {
  const events = [
    {
      icon: Heart,
      title: "Mariages",
      description: "Bouquets de mariée, centres de table, décoration d'église",
      image: "💒",
      color: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      icon: Gift,
      title: "Anniversaires",
      description: "Compositions personnalisées pour marquer ce jour spécial",
      image: "🎂",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      icon: Star,
      title: "Naissances",
      description: "Bouquets tendres pour célébrer l'arrivée d'un nouveau-né",
      image: "👶",
      color: "text-pink-500",
      bgColor: "bg-pink-50"
    },
    {
      icon: Calendar,
      title: "Entreprises",
      description: "Décorations florales pour vos événements professionnels",
      image: "🏢",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    }
  ];

  return (
    <section id="evenements" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-full mb-6">
            <Calendar className="w-4 h-4 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-primary-700">Nos Événements</span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Chaque occasion mérite ses fleurs
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            De votre mariage de rêve à la naissance d'un enfant, nous créons 
            des arrangements floraux qui subliment tous vos moments importants.
          </p>
        </div>

        {/* Grid événements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {events.map((event, index) => {
            const Icon = event.icon;
            return (
              <div 
                key={index}
                className="group bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="flex items-start space-x-6">
                  <div className={`w-16 h-16 ${event.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 ${event.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {event.description}
                    </p>
                    
                    <Button variant="ghost" className="p-0 h-auto text-primary-600 hover:text-primary-700">
                      Découvrir nos créations →
                    </Button>
                  </div>
                  
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    {event.image}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section témoignages */}
        <div className="bg-gradient-to-r from-primary-50 to-pink-50 p-8 rounded-2xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ils nous ont fait confiance
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 text-sm mb-4">
                "Bouquet de mariée absolument magnifique ! Marie a su comprendre exactement ce que je voulais."
              </p>
              <div className="text-sm">
                <div className="font-semibold text-gray-900">Sarah M.</div>
                <div className="text-gray-500">Mariée - Juin 2024</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 text-sm mb-4">
                "Service impeccable pour l'anniversaire de ma maman. Les fleurs étaient splendides !"
              </p>
              <div className="text-sm">
                <div className="font-semibold text-gray-900">Thomas L.</div>
                <div className="text-gray-500">Anniversaire - Mars 2024</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 text-sm mb-4">
                "Décoration florale parfaite pour notre événement d'entreprise. Très professionnel !"
              </p>
              <div className="text-sm">
                <div className="font-semibold text-gray-900">Julie R.</div>
                <div className="text-gray-500">Événement pro - Janvier 2024</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}