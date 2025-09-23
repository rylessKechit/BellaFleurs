// src/app/savoir-faire/page.tsx
'use client';

import { Scissors, Flower, Truck, Award, Clock, Heart, CheckCircle, Leaf } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function SavoirFairePage() {
  const processSteps = [
    {
      icon: Flower,
      title: "Sélection des fleurs",
      description: "Choix minutieux des plus belles fleurs fraîches selon la saison et vos préférences. Nous nous approvisionnons chez des producteurs locaux partenaires pour garantir une qualité exceptionnelle.",
      details: [
        "Fleurs cueillies le matin même",
        "Contrôle qualité rigoureux",
        "Respect de la saisonnalité",
        "Producteurs locaux certifiés"
      ]
    },
    {
      icon: Scissors,
      title: "Création artisanale",
      description: "Techniques transmises auprès d'artisans côtoyés au fil des années. Chaque création est unique et reflète notre passion pour l'art floral traditionnel français.",
      details: [
        "Techniques ancestrales préservées",
        "Formation continue aux tendances",
        "Créations 100% personnalisées",
        "Savoir-faire de 23 ans d'expérience"
      ]
    },
    {
      icon: Truck,
      title: "Livraison soignée",
      description: "Livraison délicate et rapide pour préserver la fraîcheur de votre création.",
      details: [
        "Livraison 24h à Brétigny-sur-Orge et alentours",
        "Emballage protecteur spécialisé",
        "Suivi en temps réel"
      ]
    }
  ];

  const techniques = [
    {
      name: "Bouquets français traditionnels",
      description: "Techniques classiques de la floriculture française"
    },
    {
      name: "Compositions modernes",
      description: "Créations contemporaines alliant tradition et innovation"
    },
    {
      name: "Arrangements funéraires",
      description: "Compositions respectueuses pour les moments de recueillement"
    }
  ];

  const values = [
    {
      icon: Award,
      title: "Excellence",
      description: "Qualité artisanale reconnue depuis 2019"
    },
    {
      icon: Heart,
      title: "Passion",
      description: "Amour du métier transmis avec chaque création"
    },
    {
      icon: Leaf,
      title: "Durabilité",
      description: "Engagement écologique et circuits courts"
    },
    {
      icon: Clock,
      title: "Ponctualité",
      description: "Respect des délais pour vos événements importants"
    }
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        
        {/* Hero Section - RESPONSIVE APPLIQUÉ */}
        <section className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-green-100 rounded-full shadow-lg mb-6 sm:mb-8">
                <Scissors className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-700 mr-2 sm:mr-3" />
                <span className="text-sm sm:text-base md:text-lg font-semibold text-green-800">Notre Savoir-faire</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-green-800 mb-6 sm:mb-8">
                Un art floral d'exception
              </h1>
              
              <p className="text-lg sm:text-xl text-green-700 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                Découvrez les secrets de notre métier : de la sélection rigoureuse des fleurs 
                à la livraison de votre création, chaque étape reflète notre passion pour l'excellence.
              </p>
            </div>
          </div>
        </section>

        {/* Processus de création - RESPONSIVE APPLIQUÉ */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 mb-4 sm:mb-6">
                Notre processus de création
              </h2>
              <p className="text-base sm:text-lg text-green-600 max-w-2xl mx-auto">
                Trois étapes essentielles pour vous offrir des créations florales uniques
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {processSteps.map((step, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <step.icon className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">{index + 1}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-green-800 mb-3 sm:mb-4">
                      {step.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm sm:text-base text-green-700 mb-4 sm:mb-6 leading-relaxed">
                    {step.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-green-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Techniques maîtrisées - RESPONSIVE APPLIQUÉ */}
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 mb-4 sm:mb-6">
                Techniques maîtrisées
              </h2>
              <p className="text-base sm:text-lg text-green-600 max-w-2xl mx-auto">
                Un savoir-faire diversifié acquis au fil de 23 années d'expérience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {techniques.map((technique, index) => (
                <div
                  key={index}
                  className="bg-green-50 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-2 sm:mb-3">
                    {technique.name}
                  </h3>
                  <p className="text-sm sm:text-base text-green-700">
                    {technique.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nos valeurs - RESPONSIVE APPLIQUÉ */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 mb-4 sm:mb-6">
                Nos valeurs
              </h2>
              <p className="text-base sm:text-lg text-green-600 max-w-2xl mx-auto">
                Les principes qui guident notre travail au quotidien
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <value.icon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-2 sm:mb-3">
                    {value.title}
                  </h3>
                  <p className="text-sm sm:text-base text-green-700">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}