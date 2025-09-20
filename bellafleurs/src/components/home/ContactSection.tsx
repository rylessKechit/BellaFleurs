'use client';

import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactSection() {
  return (
    <section id="contact" className="py-12 sm:py-16 md:py-20 relative flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-12 lg:p-16 mx-3 sm:mx-6">
        
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-green-50 rounded-full shadow-lg mb-4 sm:mb-6">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 mr-2 sm:mr-3" />
            <span className="text-sm sm:text-base font-semibold text-green-800">Contact</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 mb-4 sm:mb-6">
            Parlons de votre projet floral
          </h2>
          
          <div className="p-4 sm:p-6 md:p-8">
            <p className="text-base sm:text-lg md:text-xl text-green-800 leading-relaxed">
              Une question ? Un projet spécial ? N'hésitez pas à nous contacter. 
              Nous serons ravis de discuter de vos envies florales !
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 max-w-6xl mx-auto">
          
          {/* Section Contact Info */}
          <div>
            <div className="bg-white border-2 border-green-700 shadow-lg rounded-xl sm:rounded-2xl">
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-3 sm:mb-4 text-center">
                  Contactez nous !
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 flex-shrink-0" />
                    <a href="tel:+33780662732" className="text-green-700 hover:text-green-800 transition-colors text-sm sm:text-base">
                      07 80 66 27 32
                    </a>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 flex-shrink-0" />
                    <a href="mailto:contact@bellafleurs.fr" className="text-green-700 hover:text-green-800 transition-colors text-sm sm:text-base">
                      contact@bellafleurs.fr
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div>
            <div className="bg-white border-2 border-green-700 shadow-lg rounded-xl sm:rounded-2xl">
              <div className="p-4 sm:p-6 lg:p-8">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-800 mb-4 sm:mb-6">
                  Envoyez-nous un message
                </h3>
                
                <form className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-green-800 mb-1 sm:mb-2">
                        Prénom
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        placeholder="Votre prénom"
                        className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-green-800 placeholder-green-600 text-sm sm:text-base"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-green-800 mb-1 sm:mb-2">
                        Nom
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        placeholder="Votre nom"
                        className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-green-800 placeholder-green-600 text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-green-800 mb-1 sm:mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-green-800 placeholder-green-600 text-sm sm:text-base"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-green-800 mb-1 sm:mb-2">
                      Téléphone (optionnel)
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="07 80 66 27 32"
                      className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-green-800 placeholder-green-600 text-sm sm:text-base"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="occasion" className="block text-sm font-medium text-green-800 mb-1 sm:mb-2">
                      Occasion
                    </label>
                    <select 
                      id="occasion"
                      className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-green-800 text-sm sm:text-base"
                      required
                    >
                      <option value="" className="bg-white">Sélectionnez une occasion</option>
                      <option value="anniversaire" className="bg-white">Anniversaire</option>
                      <option value="mariage" className="bg-white">Mariage</option>
                      <option value="deuil" className="bg-white">Deuil</option>
                      <option value="entreprise" className="bg-white">Événement d'entreprise</option>
                      <option value="autre" className="bg-white">Autre</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-green-800 mb-1 sm:mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder="Décrivez-nous votre projet, vos goûts, votre budget..."
                      className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-colors text-green-800 placeholder-green-600 text-sm sm:text-base"
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
                    <label htmlFor="consent" className="text-xs sm:text-sm text-green-700">
                      J'accepte que mes données soient utilisées pour me recontacter concernant ma demande.
                    </label>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full flex justify-center items-center py-2 sm:py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Envoyer le message
                  </button>
                </form>
                
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 mt-0.5" />
                    <div className="text-xs sm:text-sm text-green-700">
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