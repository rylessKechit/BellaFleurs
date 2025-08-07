'use client';

import { useState } from 'react';
import { Scissors, Palette, Truck, Heart, CheckCircle } from 'lucide-react';
import React from 'react';

export default function ExpertiseSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 0,
      icon: Heart,
      title: "Écoute & Conseil",
      description: "Nous échangeons sur vos envies, votre budget et l'occasion pour créer le bouquet parfait.",
      details: "Chaque création commence par un échange personnalisé. Nous prenons le temps de comprendre vos goûts, l'événement et le message que vous souhaitez transmettre.",
      color: "text-red-500"
    },
    {
      id: 1,
      icon: Palette,
      title: "Sélection des fleurs",
      description: "Choix minutieux des plus belles fleurs fraîches selon la saison et vos préférences.",
      details: "Nos fleurs sont sélectionnées quotidiennement chez les meilleurs producteurs français. Fraîcheur et qualité garanties.",
      color: "text-purple-500"
    },
    {
      id: 2,
      icon: Scissors,
      title: "Création artisanale",
      description: "Réalisation de votre bouquet avec technique et passion par notre fleuriste experte.",
      details: "Chaque geste est maîtrisé : coupe, conditionnement, assemblage. Nos techniques artisanales préservent la beauté et la longévité de vos fleurs.",
      color: "text-primary-500"
    },
    {
      id: 3,
      icon: Truck,
      title: "Livraison soignée",
      description: "Livraison délicate et rapide pour préserver la fraîcheur de votre création.",
      details: "Emballage protecteur, transport soigné et livraison aux créneaux de votre choix. Vos fleurs arrivent dans un état parfait.",
      color: "text-blue-500"
    }
  ];

  const services = [
    {
      title: "Bouquets sur mesure",
      description: "Créations uniques adaptées à vos goûts et à l'occasion",
      image: "🌹",
      features: ["Consultation personnalisée", "Fleurs de saison", "Emballage élégant"]
    },
    {
      title: "Événements & mariages",
      description: "Décoration florale complète pour vos moments exceptionnels",
      image: "💒",
      features: ["Bouquet de mariée", "Centres de table", "Décoration d'église"]
    },
    {
      title: "Compositions modernes",
      description: "Arrangements contemporains pour décorer votre intérieur",
      image: "🏺",
      features: ["Designs actuels", "Vases inclus", "Entretien facile"]
    },
    {
      title: "Plantes & jardinage",
      description: "Sélection de plantes d'intérieur et conseils d'entretien",
      image: "🌿",
      features: ["Plantes dépolluantes", "Conseils inclus", "Rempotage offert"]
    }
  ];

  return (
    <section id="savoir-faire" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-full mb-6">
            <Scissors className="w-4 h-4 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-primary-700">Notre Expertise</span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Un savoir-faire d'exception
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Découvrez notre processus artisanal, de la sélection des fleurs 
            à la livraison de votre création. Chaque étape est pensée pour 
            vous offrir une expérience unique.
          </p>
        </div>

        {/* Processus de création */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Notre processus de création
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Steps navigation */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.id}
                    className={`flex items-start space-x-4 p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      activeStep === index
                        ? 'border-primary-200 bg-primary-50 shadow-md'
                        : 'border-gray-100 bg-white hover:border-primary-100 hover:bg-primary-25'
                    }`}
                    onClick={() => setActiveStep(index)}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      activeStep === index 
                        ? 'bg-primary-100' 
                        : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${step.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{step.title}</h4>
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                          Étape {index + 1}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </div>
                    
                    {activeStep === index && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step details */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <div className="text-center mb-6">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  'bg-primary-100'
                }`}>
                  {React.createElement(steps[activeStep].icon, { 
                    className: `w-10 h-10 ${steps[activeStep].color}` 
                  })}
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  {steps[activeStep].title}
                </h4>
              </div>
              
              <p className="text-gray-600 text-center leading-relaxed text-lg">
                {steps[activeStep].details}
              </p>
              
              {/* Progress bar */}
              <div className="mt-8">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>Étape {activeStep + 1} sur {steps.length}</span>
                  <span>{Math.round(((activeStep + 1) / steps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nos services */}
        <div>
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Nos services
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {service.image}
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button className="w-full text-primary-600 hover:text-primary-700 text-sm font-medium hover:bg-primary-50 py-2 rounded-lg transition-colors duration-200">
                    En savoir plus →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Garanties */}
        <div className="mt-20 bg-gradient-to-r from-primary-50 to-pink-50 p-8 rounded-2xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Nos garanties qualité
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Votre satisfaction est notre priorité. Nous nous engageons sur la qualité 
              et la fraîcheur de nos créations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Fraîcheur garantie</h4>
              <p className="text-sm text-gray-600">Fleurs sélectionnées le matin même</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Livraison soignée</h4>
              <p className="text-sm text-gray-600">Transport sécurisé et ponctuel</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Satisfaction client</h4>
              <p className="text-sm text-gray-600">Échange ou remboursement si nécessaire</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}