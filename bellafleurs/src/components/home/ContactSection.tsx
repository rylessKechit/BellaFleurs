'use client';

import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function ContactSection() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter l'envoi du formulaire
    console.log('Formulaire soumis');
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-full mb-6">
            <MessageCircle className="w-4 h-4 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-primary-700">Contact</span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Parlons de votre projet floral
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Une question ? Un projet spécial ? N'hésitez pas à nous contacter. 
            Nous serons ravis de discuter de vos envies florales !
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Informations de contact */}
          <div className="space-y-8">
            
            {/* Carte boutique */}
            <Card className="overflow-hidden shadow-lg">
              <CardContent className="p-0">
                {/* Image/Map placeholder */}
                <div className="h-48 bg-gradient-to-br from-green-100 to-primary-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🏪</div>
                    <div className="text-sm text-gray-600">Notre boutique parisienne</div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Venez nous rendre visite
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900">123 Avenue des Fleurs</div>
                        <div className="text-gray-600">75015 Paris, France</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-primary-600 flex-shrink-0" />
                      <a href="tel:+33123456789" className="text-gray-600 hover:text-primary-600">
                        01 23 45 67 89
                      </a>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-primary-600 flex-shrink-0" />
                      <a href="mailto:contact@bellafleurs.fr" className="text-gray-600 hover:text-primary-600">
                        contact@bellafleurs.fr
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Horaires */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-6 h-6 text-primary-600" />
                  <h3 className="text-xl font-bold text-gray-900">Nos horaires</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  {[
                    { day: 'Lundi - Vendredi', hours: '9h00 - 19h00', isOpen: true },
                    { day: 'Samedi', hours: '9h00 - 19h00', isOpen: true },
                    { day: 'Dimanche', hours: '9h00 - 13h00', isOpen: false }
                  ].map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <span className="text-gray-600">{schedule.day}</span>
                      <span className={`font-medium ${schedule.isOpen ? 'text-green-600' : 'text-orange-600'}`}>
                        {schedule.hours}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 text-sm font-medium">Ouvert maintenant</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services rapides */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Services express
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Commande par téléphone</div>
                      <div className="text-sm text-gray-600">Prêt en 2h, livraison possible</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900">Conseil personnalisé</div>
                      <div className="text-sm text-gray-600">Aide au choix selon l'occasion</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulaire de contact */}
          <div>
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Envoyez-nous un message
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Votre prénom"
                        className="w-full"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Votre nom"
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      className="w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone (optionnel)
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="01 23 45 67 89"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="occasion" className="block text-sm font-medium text-gray-700 mb-2">
                      Occasion
                    </label>
                    <select 
                      id="occasion"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Sélectionnez une occasion</option>
                      <option value="mariage">Mariage</option>
                      <option value="anniversaire">Anniversaire</option>
                      <option value="naissance">Naissance</option>
                      <option value="deuil">Deuil</option>
                      <option value="entreprise">Événement d'entreprise</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder="Décrivez-nous votre projet, vos goûts, votre budget..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <input
                      id="consent"
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="consent" className="text-sm text-gray-600">
                      J'accepte que mes données soient utilisées pour me recontacter concernant ma demande.
                    </label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Envoyer le message
                  </Button>
                </form>
                
                <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <MessageCircle className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div className="text-sm text-primary-700">
                      <strong>Réponse rapide :</strong> Nous vous recontactons sous 24h pour discuter de votre projet !
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section newsletter */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto shadow-lg">
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="text-4xl mb-4">💌</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Restez au parfum de nos nouveautés !
                </h3>
                <p className="text-gray-600">
                  Recevez nos offres spéciales, conseils d'entretien et inspirations florales
                </p>
              </div>
              
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Votre adresse email"
                  className="flex-1"
                  required
                />
                <Button type="submit" className="sm:w-auto">
                  S'abonner
                </Button>
              </form>
              
              <p className="text-xs text-gray-500 mt-4">
                Pas de spam, désinscription facile à tout moment
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}