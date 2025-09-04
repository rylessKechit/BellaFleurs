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
      description: "Livraison délicate et rapide pour préserver la fraîcheur de votre création. Nos livreurs sont formés à la manipulation des compositions florales.",
      details: [
        "Livraison 24-48h en région parisienne",
        "Emballage protecteur spécialisé",
        "Livreurs formés aux fleurs",
        "Suivi en temps réel"
      ]
    }
  ];

  const techniques = [
    {
      name: "Art floral japonais",
      description: "Maîtrise de l'ikebana pour des compositions épurées et harmonieuses"
    },
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
        
        {/* Hero Section */}
        <section className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-6 py-3 bg-green-100 rounded-full shadow-lg mb-8">
                <Scissors className="w-6 h-6 text-green-700 mr-3" />
                <span className="text-lg font-semibold text-green-800">Notre Savoir-faire</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-green-800 mb-8">
                Un art floral d'exception
              </h1>
              
              <p className="text-xl text-green-700 max-w-3xl mx-auto leading-relaxed">
                Découvrez les secrets de notre métier : de la sélection rigoureuse des fleurs 
                à la livraison de votre création, chaque étape reflète notre passion pour l'excellence.
              </p>
            </div>
          </div>
        </section>

        {/* Processus de création */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-green-800 mb-6">
                Notre processus de création
              </h2>
              <p className="text-lg text-green-600 max-w-2xl mx-auto">
                Trois étapes essentielles pour vous offrir des créations florales uniques
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {processSteps.map((step, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="w-10 h-10 text-green-600" />
                    </div>
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-white">{index + 1}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-green-800 mb-4">
                      {step.title}
                    </h3>
                  </div>
                  
                  <p className="text-green-700 mb-6 leading-relaxed">
                    {step.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                        <span className="text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Techniques maîtrisées */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-green-800 mb-6">
                Techniques maîtrisées
              </h2>
              <p className="text-lg text-green-600 max-w-2xl mx-auto">
                Un savoir-faire diversifié acquis au fil de 23 années d'expérience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {techniques.map((technique, index) => (
                <div
                  key={index}
                  className="bg-green-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-green-800 mb-3">
                    {technique.name}
                  </h3>
                  <p className="text-green-700">
                    {technique.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nos valeurs */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-green-800 mb-6">
                Nos valeurs
              </h2>
              <p className="text-lg text-green-600 max-w-2xl mx-auto">
                Les principes qui guident notre travail au quotidien
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-green-700">
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