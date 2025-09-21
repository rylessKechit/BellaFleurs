// src/app/abonnement/page.tsx
'use client';

import { useState } from 'react';
import { Check, Truck, Heart, Clock, Flower2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AbonnementPage() {
  const [budget, setBudget] = useState('');
  const [preferences, setPreferences] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/abonnement/demande', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budget,
          preferences,
          email,
          name,
          phone
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage('✅ Demande envoyée ! Nous vous contactons dans les 24h.');
        setBudget('');
        setPreferences('');
        setEmail('');
        setName('');
        setPhone('');
      } else {
        setSubmitMessage('❌ Erreur lors de l\'envoi. Veuillez réessayer.');
      }
    } catch (error) {
      setSubmitMessage('❌ Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        
        {/* Hero Section */}
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
                Recevez chaque semaine une création florale unique, sélectionnée avec soin 
                par notre fleuriste. Transformez votre quotidien en un jardin de bonheur.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 mr-2" />
                  Livraison gratuite
                </div>
                <div className="flex items-center">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 mr-2" />
                  Créations exclusives
                </div>
                <div className="flex items-center">
                  <Flower2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 mr-2" />
                  Fleurs de saison sélectionnées
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section principale avec formulaire de contact */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              
              {/* Prix de base */}
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  À partir de 20€ par semaine
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Parlez-nous de vos envies et de votre budget, nous créerons l'abonnement parfait pour vous
                </p>
              </div>

              {/* Grille avec avantages et formulaire */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                
                {/* Avantages */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Ce qui vous attend chaque semaine :
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Check className="w-5 h-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Livraison gratuite</h4>
                        <p className="text-gray-600 text-sm">Directement chez vous, chaque semaine</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Check className="w-5 h-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Créations florales uniques</h4>
                        <p className="text-gray-600 text-sm">Compositions exclusives adaptées à vos goûts</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Check className="w-5 h-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Fleurs de saison sélectionnées</h4>
                        <p className="text-gray-600 text-sm">Sélectionnées avec soin par notre fleuriste</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Check className="w-5 h-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Flexibilité totale</h4>
                        <p className="text-gray-600 text-sm">Pause, modification ou arrêt à tout moment</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-primary-50 rounded-lg">
                    <h4 className="font-medium text-primary-900 mb-2">
                      🌸 Transformez votre quotidien en un jardin de bonheur
                    </h4>
                    <p className="text-primary-700 text-sm">
                      Chaque livraison est une surprise florale qui illuminera votre semaine
                    </p>
                  </div>
                </div>

                {/* Formulaire de contact */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl text-center">
                      Parlons de votre abonnement idéal
                    </CardTitle>
                    <p className="text-gray-600 text-center text-sm">
                      Remplissez ce formulaire et nous vous contacterons dans les 24h
                    </p>
                  </CardHeader>
                  <CardContent>
                    {submitMessage && (
                      <div className={`mb-4 p-3 rounded-lg text-sm ${
                        submitMessage.includes('✅') 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {submitMessage}
                      </div>
                    )}
                    
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Nom complet *
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Votre nom"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="07 80 66 27 32"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="votre@email.fr"
                        />
                      </div>

                      <div>
                        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                          Budget par semaine *
                        </label>
                        <select
                          id="budget"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Sélectionnez votre budget</option>
                          <option value="20€ - 30€">20€ - 30€</option>
                          <option value="30€ - 50€">30€ - 50€</option>
                          <option value="50€ - 80€">50€ - 80€</option>
                          <option value="80€ et plus">80€ et plus</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-2">
                          Préférences et besoins *
                        </label>
                        <textarea
                          id="preferences"
                          value={preferences}
                          onChange={(e) => setPreferences(e.target.value)}
                          required
                          rows={4}
                          placeholder="Dites-nous tout : couleurs préférées, types de fleurs, occasion (maison, bureau, cadeau), style souhaité, allergies à éviter..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary-600 hover:bg-primary-700 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        size="lg"
                      >
                        {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
                        {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        Nous vous recontacterons dans les 24h pour finaliser votre abonnement personnalisé
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Section avantages */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Pourquoi choisir notre abonnement floral ?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Une expérience florale unique, pensée pour embellir votre quotidien
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Livraison Gratuite</h3>
                <p className="text-gray-600 text-sm">
                  Livraison offerte chaque semaine, directement chez vous
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Créations Exclusives</h3>
                <p className="text-gray-600 text-sm">
                  Des compositions uniques créées spécialement pour nos abonnés
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flower2 className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Fleurs de Saison</h3>
                <p className="text-gray-600 text-sm">
                  Sélectionnées avec soin par notre fleuriste expert
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Sur Mesure</h3>
                <p className="text-gray-600 text-sm">
                  Abonnement personnalisé selon vos goûts et budget
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Questions fréquentes
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Comment définissez-vous mon abonnement personnalisé ?
                  </h3>
                  <p className="text-gray-600">
                    Après réception de votre demande, notre fleuriste vous contacte pour discuter de vos goûts, contraintes et budget. Nous créons ensuite un abonnement 100% sur-mesure pour vous.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Puis-je modifier mon abonnement en cours ?
                  </h3>
                  <p className="text-gray-600">
                    Absolument ! Vous pouvez ajuster votre budget, changer vos préférences, mettre en pause ou arrêter votre abonnement à tout moment. Il suffit de nous contacter.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Que se passe-t-il si je ne suis pas satisfait(e) ?
                  </h3>
                  <p className="text-gray-600">
                    Votre satisfaction est notre priorité. Si une livraison ne vous convient pas, contactez-nous dans les 24h et nous rectifierons immédiatement pour la prochaine livraison.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Prêt(e) à créer votre abonnement sur-mesure ?
            </h2>
            <p className="text-lg sm:text-xl text-primary-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Contactez-nous avec votre budget et vos préférences, nous vous rappelons dans les 24h !
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary-600 hover:bg-gray-100 px-6 sm:px-8"
              >
                Demander mon devis gratuit
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600 px-6 sm:px-8">
                Voir nos créations
              </Button>
            </div>
            
            <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-primary-100">
              ✓ Réponse sous 24h • ✓ Devis gratuit • ✓ Sans engagement
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}