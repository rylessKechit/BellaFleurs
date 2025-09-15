'use client';

import { Scissors, CheckCircle } from 'lucide-react';

export default function ExpertiseSection() {
  const steps = [
    {
      id: 0,
      title: "Sélection des fleurs",
      description: "Choix minutieux des plus belles fleurs fraîches selon la saison et vos préférences.",
      index: 1
    },
    {
      id: 1,
      title: "Création artisanale", 
      description: "Techniques transmises au près d'artisans côtoyés au fil des années.",
      index: 2
    },
    {
      id: 2,
      title: "Livraison soignée",
      description: "Livraison délicate et rapide pour préserver la fraîcheur de votre création.",
      index: 3
    }
  ];

  return (
    <section id="savoir-faire" className="py-12 sm:py-16 md:py-20 relative flex justify-center">
      {/* Container blanc centré avec plus de largeur */}
      <div className="w-full max-w-7xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-12 lg:p-16 mx-3 sm:mx-6">
        
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-green-50 rounded-full shadow-lg mb-4 sm:mb-6">
            <Scissors className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 mr-2 sm:mr-3" />
            <span className="text-sm sm:text-base font-semibold text-green-800">Notre Expertise</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 mb-4 sm:mb-6">
            Un savoir-faire d'exception
          </h2>
          
          <div className="p-4 sm:p-6 md:p-8">
            <p className="text-base sm:text-lg md:text-xl text-green-800 leading-relaxed">
              Découvrez notre processus artisanal, de la sélection des fleurs 
              à la livraison de votre création. Chaque étape est pensée pour 
              vous offrir une expérience unique.
            </p>
          </div>
        </div>

        {/* Processus simplifié */}
        <div className="mb-12 sm:mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="bg-green-50 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3 sm:mb-4">
                  {step.index}
                </h2>
                <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-2 sm:mb-3">
                  {step.title}
                </h3>
                
                <p className="text-sm sm:text-base text-green-700">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}