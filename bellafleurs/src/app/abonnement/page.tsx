// src/app/abonnement/page.tsx
'use client';

import { useState } from 'react';
import { Check, Star, Calendar, Gift, Truck, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const plans = [
  {
    id: 'essential',
    name: 'Essential',
    price: 29.90,
    frequency: 'par mois',
    description: 'Perfect pour découvrir nos créations florales',
    popular: false,
    features: [
      'Bouquet surprise mensuel',
      'Fleurs de saison sélectionnées',
      'Livraison gratuite',
      'Conseils d\'entretien inclus',
      'Possibilité de pause'
    ],
    included: {
      deliveries: '1 livraison/mois',
      value: '40-50€ de fleurs',
      support: 'Support client'
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 49.90,
    frequency: 'par mois',
    description: 'L\'expérience florale complète',
    popular: true,
    features: [
      'Bouquet premium mensuel',
      'Fleurs d\'exception et exotiques',
      'Livraison express gratuite',
      'Conseils personnalisés',
      'Vase offert le 1er mois',
      'Carte personnalisée',
      'Priorité sur les nouveautés'
    ],
    included: {
      deliveries: '1 livraison/mois',
      value: '70-80€ de fleurs',
      support: 'Support prioritaire'
    }
  },
  {
    id: 'luxury',
    name: 'Luxury',
    price: 79.90,
    frequency: 'par mois',
    description: 'Le summum de l\'art floral',
    popular: false,
    features: [
      'Création exclusive mensuelle',
      'Fleurs rares et importées',
      'Livraison express gratuite',
      'Consultation personnalisée',
      'Accessoires premium offerts',
      'Séance photo de votre création',
      'Accès aux événements privés',
      'Service conciergerie'
    ],
    included: {
      deliveries: '1 livraison/mois',
      value: '100-120€ de fleurs',
      support: 'Conseiller dédié'
    }
  }
];

const frequencies = [
  { id: 'monthly', label: 'Mensuel', multiplier: 1 },
  { id: 'quarterly', label: 'Trimestriel', multiplier: 3, discount: 10 },
  { id: 'yearly', label: 'Annuel', multiplier: 12, discount: 20 }
];

const testimonials = [
  {
    name: 'Sophie M.',
    location: 'Paris 16ème',
    rating: 5,
    comment: 'Mes bureaux sont transformés chaque mois ! Les compositions sont toujours magnifiques et fraîches.',
    plan: 'Premium'
  },
  {
    name: 'Claire L.',
    location: 'Neuilly-sur-Seine',
    rating: 5,
    comment: 'Service exceptionnel ! Les fleurs arrivent toujours en parfait état et durent longtemps.',
    plan: 'Essential'
  },
  {
    name: 'Marie-Helene D.',
    location: 'Boulogne',
    rating: 5,
    comment: 'L\'abonnement Luxury est un vrai plaisir chaque mois. Les créations sont uniques !',
    plan: 'Luxury'
  }
];

export default function AbonnementPage() {
  const [selectedFrequency, setSelectedFrequency] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const getDiscountedPrice = (basePrice: number) => {
    const frequency = frequencies.find(f => f.id === selectedFrequency);
    if (!frequency || !frequency.discount) return basePrice;
    return basePrice * (1 - frequency.discount / 100);
  };

  const getTotalPrice = (basePrice: number) => {
    const frequency = frequencies.find(f => f.id === selectedFrequency);
    const discountedPrice = getDiscountedPrice(basePrice);
    return discountedPrice * (frequency?.multiplier || 1);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary-50 to-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-6 bg-primary-100 text-primary-700 hover:bg-primary-100">
                🌸 Nouveauté 2024
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Abonnement Floral
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Recevez chaque mois une création florale unique, sélectionnée avec soin 
                par notre fleuriste experte. Transformez votre quotidien en un jardin de bonheur.
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Truck className="w-5 h-5 text-primary-600 mr-2" />
                  Livraison gratuite
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-primary-600 mr-2" />
                  Flexible et sans engagement
                </div>
                <div className="flex items-center">
                  <Heart className="w-5 h-5 text-primary-600 mr-2" />
                  Créations exclusives
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sélecteur de fréquence */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Choisissez votre fréquence
              </h2>
              <p className="text-gray-600">
                Plus vous vous engagez, plus vous économisez
              </p>
            </div>
            
            <div className="flex justify-center mb-12">
              <div className="bg-gray-100 p-1 rounded-xl flex">
                {frequencies.map((frequency) => (
                  <button
                    key={frequency.id}
                    onClick={() => setSelectedFrequency(frequency.id)}
                    className={`px-6 py-3 rounded-lg font-medium text-sm transition-all relative ${
                      selectedFrequency === frequency.id
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {frequency.label}
                    {frequency.discount && (
                      <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                        -{frequency.discount}%
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Plans d'abonnement */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => {
                const discountedPrice = getDiscountedPrice(plan.price);
                const totalPrice = getTotalPrice(plan.price);
                const isSelected = selectedPlan === plan.id;
                
                return (
                  <Card 
                    key={plan.id}
                    className={`relative transition-all duration-300 hover:shadow-xl ${
                      plan.popular 
                        ? 'border-primary-500 shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-primary-300'
                    } ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary-600 text-white px-4 py-1">
                          ⭐ Plus populaire
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {plan.name}
                      </CardTitle>
                      <p className="text-gray-600 text-sm mt-2">
                        {plan.description}
                      </p>
                      
                      <div className="mt-6">
                        {selectedFrequency !== 'monthly' && (
                          <div className="text-sm text-gray-500 line-through">
                            {(plan.price * (frequencies.find(f => f.id === selectedFrequency)?.multiplier || 1)).toFixed(2)}€
                          </div>
                        )}
                        <div className="text-4xl font-bold text-primary-600">
                          {totalPrice.toFixed(2)}€
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedFrequency === 'monthly' 
                            ? plan.frequency
                            : frequencies.find(f => f.id === selectedFrequency)?.label.toLowerCase()
                          }
                        </div>
                        {selectedFrequency !== 'monthly' && (
                          <div className="text-sm text-green-600 font-medium mt-1">
                            Soit {discountedPrice.toFixed(2)}€/mois
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Ce qui est inclus */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Inclus :</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Livraisons</span>
                            <span className="font-medium">{plan.included.deliveries}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Valeur fleurs</span>
                            <span className="font-medium">{plan.included.value}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Support</span>
                            <span className="font-medium">{plan.included.support}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Fonctionnalités */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Avantages :</h4>
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start text-sm">
                              <Check className="w-4 h-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button 
                        className={`w-full h-12 ${
                          plan.popular 
                            ? 'bg-primary-600 hover:bg-primary-700' 
                            : ''
                        }`}
                        variant={plan.popular ? 'default' : 'outline'}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        {isSelected ? 'Plan sélectionné' : 'Choisir ce plan'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Comment ça marche ?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Un processus simple pour recevoir vos plus belles créations florales
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  step: '1',
                  title: 'Choisissez votre abonnement',
                  description: 'Sélectionnez le plan qui vous correspond le mieux',
                  icon: '🎯'
                },
                {
                  step: '2',
                  title: 'Personnalisez vos préférences',
                  description: 'Indiquez vos couleurs et styles préférés',
                  icon: '🎨'
                },
                {
                  step: '3',
                  title: 'Recevez vos créations',
                  description: 'Chaque mois, découvrez une nouvelle surprise florale',
                  icon: '📦'
                },
                {
                  step: '4',
                  title: 'Profitez et partagez',
                  description: 'Savourez la beauté et partagez vos photos',
                  icon: '📸'
                }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    {item.icon}
                  </div>
                  <div className="mb-2">
                    <Badge className="bg-primary-600 text-white mb-3">
                      Étape {item.step}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ce que disent nos abonnés
              </h2>
              <p className="text-xl text-gray-600">
                Plus de 500 clients nous font confiance chaque mois
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-6">
                  <CardContent className="p-0">
                    <div className="flex items-center mb-4">
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {testimonial.plan}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-4 italic">
                      "{testimonial.comment}"
                    </p>
                    
                    <div className="border-t border-gray-100 pt-4">
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testimonial.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à embellir votre quotidien ?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Commencez votre abonnement floral dès aujourd'hui et recevez 
              votre première création dans 48h !
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100 px-8">
                Commencer mon abonnement
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600 px-8">
                Questions fréquentes
              </Button>
            </div>
            
            <div className="mt-8 text-sm text-primary-100">
              ✓ Sans engagement • ✓ Pause à tout moment • ✓ Livraison gratuite
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}