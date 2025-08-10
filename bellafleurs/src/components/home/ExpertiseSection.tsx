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

  const services = [
    {
      title: "Bouquets sur mesure",
      description: "Créations uniques adaptées à vos goûts et à l'occasion",
      features: ["Consultation personnalisée", "Fleurs de saison", "Emballage élégant"],
    },
    {
      title: "Événements & mariages",
      description: "Décoration florale complète pour vos moments exceptionnels",
      features: ["Bouquet de mariée", "Centres de table", "Décoration d'église"]
    },
    {
      title: "Compositions modernes",
      description: "Arrangements contemporains pour décorer votre intérieur",
      features: ["Designs actuels", "Vases inclus", "Entretien facile"]
    },
    {
      title: "Plantes & jardinage",
      description: "Sélection de plantes d'intérieur et conseils d'entretien",
      features: ["Plantes dépolluantes", "Conseils inclus", "Rempotage offert"]
    }
  ];

  return (
    <section id="savoir-faire" className="py-20 relative flex justify-center">
      {/* Container blanc centré avec plus de largeur */}
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl p-12 md:p-16 mx-6">
        
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-green-50 rounded-full shadow-lg mb-6">
            <Scissors className="w-5 h-5 text-green-700 mr-3" />
            <span className="text-base font-semibold text-green-800">Notre Expertise</span>
          </div>
          
          <h2 className="text-4xl font-bold text-green-800 mb-6">
            Un savoir-faire d'exception
          </h2>
          
          <div className="p-8">
            <p className="text-xl text-green-800 leading-relaxed">
              Découvrez notre processus artisanal, de la sélection des fleurs 
              à la livraison de votre création. Chaque étape est pensée pour 
              vous offrir une expérience unique.
            </p>
          </div>
        </div>

        {/* Processus simplifié */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="bg-green-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                <h2 className="text-3xl font-bold text-green-800 mb-4">
                  {step.index}
                </h2>
                <h3 className="text-xl font-semibold text-green-800 mb-3">
                  {step.title}
                </h3>
                
                <p className="text-green-700">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="p-6 group text-center"
            >
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-green-800 mb-3">
                  {service.title}
                </h3>
                <p className="text-green-700 text-sm">
                  {service.description}
                </p>
              </div>
              
              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center justify-center text-sm text-green-700">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}