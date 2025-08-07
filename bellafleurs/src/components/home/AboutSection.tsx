'use client';

import { Heart, Award, Users, Sparkles } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="apropos" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Image côté */}
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              {/* Placeholder - remplacez par votre vraie image */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-green-100 via-primary-50 to-pink-100 flex items-center justify-center"
                style={{ 
                  backgroundImage: `url('/images/atelier-bella-fleurs.jpg')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <span className="text-6xl opacity-30">🌿</span>
              </div>
              
              {/* Overlay avec citation */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                <div className="p-8 text-white">
                  <blockquote className="text-lg font-medium mb-2">
                    "Chaque fleur raconte une histoire, chaque bouquet porte une émotion."
                  </blockquote>
                  <cite className="text-sm opacity-90">— Aurélie, Fondatrice</cite>
                </div>
              </div>
            </div>
            
            {/* Éléments décoratifs */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary-100 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-pink-100 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Contenu */}
          <div className="space-y-8">
            {/* En-tête */}
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-full">
                <Heart className="w-4 h-4 text-primary-600 mr-2" />
                <span className="text-sm font-medium text-primary-700">Notre Histoire</span>
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900">
                L'art floral au cœur de Paris
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Depuis 2019, Bella Fleurs crée des moments magiques à travers l'art floral. 
                Installés au cœur du 15ème arrondissement, nous mettons notre passion et notre 
                savoir-faire au service de vos plus beaux souvenirs.
              </p>
            </div>

            {/* Notre mission */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900">Notre Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                Transformer chaque émotion en création florale unique. Que ce soit pour célébrer 
                un amour, marquer une naissance, accompagner un deuil ou simplement embellir votre 
                quotidien, nous sélectionnons avec soin chaque fleur pour donner vie à vos sentiments.
              </p>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 gap-6 py-6">
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
                <div className="text-sm text-gray-600">Créations réalisées</div>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <div className="text-3xl font-bold text-pink-600 mb-2">127</div>
                <div className="text-sm text-gray-600">Clients satisfaits</div>
              </div>
            </div>

            {/* Nos valeurs */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">Nos Valeurs</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 p-4 border border-gray-100 rounded-lg hover:border-primary-200 transition-colors">
                  <Award className="w-6 h-6 text-primary-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Excellence</h4>
                    <p className="text-sm text-gray-600">Qualité premium et fraîcheur garantie</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border border-gray-100 rounded-lg hover:border-primary-200 transition-colors">
                  <Heart className="w-6 h-6 text-pink-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Émotion</h4>
                    <p className="text-sm text-gray-600">Chaque création raconte votre histoire</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border border-gray-100 rounded-lg hover:border-primary-200 transition-colors">
                  <Sparkles className="w-6 h-6 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Créativité</h4>
                    <p className="text-sm text-gray-600">Designs uniques et personnalisés</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border border-gray-100 rounded-lg hover:border-primary-200 transition-colors">
                  <Users className="w-6 h-6 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Proximité</h4>
                    <p className="text-sm text-gray-600">Relation client privilégiée</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Équipe */}
            <div className="bg-gradient-to-r from-primary-50 to-pink-50 p-6 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👩‍🎨</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Aurélie</h4>
                  <p className="text-sm text-gray-600">Fleuriste passionnée & Fondatrice</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Diplômée en art floral, 15 ans d'expérience
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}