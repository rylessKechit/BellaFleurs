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
        
        {/* Hero Section - RESPONSIVE APPLIQUÉ */}
        <section className="bg-gradient-to-b from-primary-50 to-white py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-4 sm:mb-6 bg-primary-100 text-primary-700 hover:bg-primary-100">
                🌸 Nouveauté 2024
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Abonnement Floral
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed px-4 sm:px-0">
                Recevez chaque mois une création florale unique, sélectionnée avec soin 
                par notre fleuriste experte. Transformez votre quotidien en un jardin de bonheur.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 mr-2" />
                  Livraison gratuite
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 mr-2" />
                  Flexible et sans engagement
                </div>
                <div className="flex items-center">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 mr-2" />
                  Créations exclusives
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sélecteur de fréquence - RESPONSIVE APPLIQUÉ */}
        <section className="py-8 sm:py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Choisissez votre fréquence
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Plus vous vous engagez, plus vous économisez
              </p>
            </div>
            
            <div className="flex justify-center mb-8 sm:mb-12">
              <div className="bg-gray-100 p-1 rounded-xl flex flex-col sm:flex-row w-full sm:w-auto">
                {frequencies.map((frequency) => (
                  <button
                    key={frequency.id}
                    onClick={() => setSelectedFrequency(frequency.id)}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-xs sm:text-sm transition-all relative ${
                      selectedFrequency === frequency.id
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {frequency.label}
                    {frequency.discount && (
                      <Badge className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-green-500 text-white text-xs scale-75 sm:scale-100">
                        -{frequency.discount}%
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Plans d'abonnement - RESPONSIVE APPLIQUÉ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => {
                const discountedPrice = getDiscountedPrice(plan.price);
                const totalPrice = getTotalPrice(plan.price);
                const isSelected = selectedPlan === plan.id;
                
                return (
                  <Card 
                    key={plan.id}
                    className={`relative transition-all duration-300 hover:shadow-xl ${
                      plan.popular 
                        ? 'ring-2 ring-primary-500 shadow-lg scale-105' 
                        : 'hover:shadow-lg hover:scale-105'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary-500 text-white px-3 sm:px-4 py-1">
                          ⭐ Le plus populaire
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4 sm:pb-6">
                      <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        {plan.name}
                      </CardTitle>
                      <p className="text-sm sm:text-base text-gray-600 mb-4">
                        {plan.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-center">
                          <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                            {discountedPrice.toFixed(2)}€
                          </span>
                          <span className="text-sm sm:text-base text-gray-600 ml-2">
                            {plan.frequency}
                          </span>
                        </div>
                        
                        {selectedFrequency !== 'monthly' && (
                          <div className="text-xs sm:text-sm text-gray-500">
                            <span className="line-through">{plan.price.toFixed(2)}€</span>
                            <span className="ml-2 text-green-600 font-medium">
                              Économisez {((plan.price - discountedPrice) * frequencies.find(f => f.id === selectedFrequency)!.multiplier).toFixed(2)}€
                            </span>
                          </div>
                        )}
                        
                        <div className="text-lg sm:text-xl font-semibold text-primary-600">
                          Total: {totalPrice.toFixed(2)}€
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <Button 
                        className="w-full mb-4 sm:mb-6" 
                        variant={plan.popular ? "default" : "outline"}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        {isSelected ? 'Sélectionné' : 'Choisir ce plan'}
                      </Button>
                      
                      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 border-b pb-2">
                          Ce qui est inclus :
                        </div>
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start">
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Livraisons:</span>
                          <span className="font-medium">{plan.included.deliveries}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Valeur fleurs:</span>
                          <span className="font-medium text-green-600">{plan.included.value}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Support:</span>
                          <span className="font-medium">{plan.included.support}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Témoignages - RESPONSIVE APPLIQUÉ */}
        <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Ce que disent nos abonnées
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Découvrez pourquoi elles nous font confiance
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <div className="flex text-yellow-400">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                        ))}
                      </div>
                      <Badge variant="outline" className="ml-2 sm:ml-3 text-xs">
                        {testimonial.plan}
                      </Badge>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 italic">
                      "{testimonial.comment}"
                    </p>
                    <div className="text-xs sm:text-sm">
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-gray-600">{testimonial.location}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final - RESPONSIVE APPLIQUÉ */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Prêt(e) à transformer votre quotidien ?
            </h2>
            <p className="text-lg sm:text-xl text-primary-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Commencez votre abonnement floral dès aujourd'hui et recevez 
              votre première création dans 48h !
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100 px-6 sm:px-8">
                Commencer mon abonnement
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600 px-6 sm:px-8">
                Questions fréquentes
              </Button>
            </div>
            
            <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-primary-100">
              ✓ Sans engagement • ✓ Pause à tout moment • ✓ Livraison gratuite
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}