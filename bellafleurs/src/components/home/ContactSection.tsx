'use client';

import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-emerald-50 rounded-full mb-6 border border-emerald-100">
            <MessageCircle className="w-4 h-4 text-emerald-600 mr-2" />
            <span className="text-sm font-medium text-emerald-700">Contact</span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Parlons de votre projet floral
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Une question ? Un projet spécial ? N'hésitez pas à nous contacter. 
            Nous serons ravis de discuter de vos envies florales !
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Section Venez nous rendre visite */}
          <div>
            <div className="bg-white shadow-lg rounded-2xl border border-emerald-100">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Venez nous rendre visite
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">123 Avenue des Fleurs</div>
                      <div className="text-gray-600">75015 Paris, France</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <a href="tel:+33123456789" className="text-gray-600 hover:text-emerald-600 transition-colors">
                      01 23 45 67 89
                    </a>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <a href="mailto:contact@bellafleurs.fr" className="text-gray-600 hover:text-emerald-600 transition-colors">
                      contact@bellafleurs.fr
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div>
            <div className="bg-white shadow-lg rounded-2xl border border-emerald-100">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Envoyez-nous un message
                </h3>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        placeholder="Votre prénom"
                        className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        placeholder="Votre nom"
                        className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone (optionnel)
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="01 23 45 67 89"
                      className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="occasion" className="block text-sm font-medium text-gray-700 mb-2">
                      Occasion
                    </label>
                    <select 
                      id="occasion"
                      className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                      required
                    >
                      <option value="">Sélectionnez une occasion</option>
                      <option value="anniversaire">Anniversaire</option>
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
                      className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-colors"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <input
                      id="consent"
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-emerald-300 rounded"
                      required
                    />
                    <label htmlFor="consent" className="text-sm text-gray-600">
                      J'accepte que mes données soient utilisées pour me recontacter concernant ma demande.
                    </label>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full flex justify-center items-center py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-green-800 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Envoyer le message
                  </button>
                </form>
                
                <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="flex items-start space-x-3">
                    <MessageCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div className="text-sm text-emerald-700">
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