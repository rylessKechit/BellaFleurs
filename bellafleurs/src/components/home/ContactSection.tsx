'use client';

import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 relative flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl p-12 md:p-16 mx-6">
        
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-green-50 rounded-full shadow-lg mb-6">
            <MessageCircle className="w-5 h-5 text-green-700 mr-3" />
            <span className="text-base font-semibold text-green-800">Contact</span>
          </div>
          
          <h2 className="text-4xl font-bold text-green-800 mb-6">
            Parlons de votre projet floral
          </h2>
          
          <div className="bg-green-50 rounded-2xl p-8 shadow-lg">
            <p className="text-xl text-green-800 leading-relaxed">
              Une question ? Un projet spécial ? N'hésitez pas à nous contacter. 
              Nous serons ravis de discuter de vos envies florales !
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Section Venez nous rendre visite */}
          <div>
            <div className="bg-green-50 shadow-lg rounded-2xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-green-800 mb-4 text-center">
                  Venez nous rendre visite
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-green-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-green-800">123 Avenue des Fleurs</div>
                      <div className="text-green-700">75015 Paris, France</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-green-700 flex-shrink-0" />
                    <a href="tel:+33123456789" className="text-green-700 hover:text-green-800 transition-colors">
                      01 23 45 67 89
                    </a>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-green-700 flex-shrink-0" />
                    <a href="mailto:contact@bellafleurs.fr" className="text-green-700 hover:text-green-800 transition-colors">
                      contact@bellafleurs.fr
                    </a>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-green-700" />
                    Horaires d'ouverture
                  </h4>
                  <div className="space-y-1 text-sm text-green-700">
                    <div className="flex justify-between">
                      <span>Lundi - Vendredi</span>
                      <span>9h00 - 19h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Samedi</span>
                      <span>9h00 - 17h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimanche</span>
                      <span className="text-orange-600">Fermé</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <Button 
                    className="bg-green-100 text-green-800 hover:bg-green-200 transition-all"
                    asChild
                  >
                    <a 
                      href="https://maps.google.com/?q=123+Avenue+des+Fleurs,+75015+Paris" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Voir sur la carte
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div>
            <div className="bg-green-50 shadow-lg rounded-2xl">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-green-800 mb-6">
                  Envoyez-nous un message
                </h3>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-green-800 mb-2">
                        Prénom
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        placeholder="Votre prénom"
                        className="w-full px-3 py-2 bg-green-50 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-green-800 placeholder-green-600"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-green-800 mb-2">
                        Nom
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        placeholder="Votre nom"
                        className="w-full px-3 py-2 bg-green-50 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-green-800 placeholder-green-600"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-green-800 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      className="w-full px-3 py-2 bg-green-50 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-green-800 placeholder-green-600"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-green-800 mb-2">
                      Téléphone (optionnel)
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="01 23 45 67 89"
                      className="w-full px-3 py-2 bg-green-50 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-green-800 placeholder-green-600"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="occasion" className="block text-sm font-medium text-green-800 mb-2">
                      Occasion
                    </label>
                    <select 
                      id="occasion"
                      className="w-full px-3 py-2 bg-green-50 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-green-800"
                      required
                    >
                      <option value="" className="bg-white">Sélectionnez une occasion</option>
                      <option value="anniversaire" className="bg-white">Anniversaire</option>
                      <option value="deuil" className="bg-white">Deuil</option>
                      <option value="entreprise" className="bg-white">Événement d'entreprise</option>
                      <option value="autre" className="bg-white">Autre</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-green-800 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder="Décrivez-nous votre projet, vos goûts, votre budget..."
                      className="w-full px-3 py-2 bg-green-50 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-colors text-green-800 placeholder-green-600"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <input
                      id="consent"
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-green-300 rounded bg-green-50"
                      required
                    />
                    <label htmlFor="consent" className="text-sm text-green-700">
                      J'accepte que mes données soient utilisées pour me recontacter concernant ma demande.
                    </label>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full flex justify-center items-center py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Envoyer le message
                  </button>
                </form>
                
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <MessageCircle className="w-5 h-5 text-green-700 mt-0.5" />
                    <div className="text-sm text-green-700">
                      <strong>Réponse rapide :</strong> Nous vous recontactons sous 24h pour discuter de votre projet !
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}