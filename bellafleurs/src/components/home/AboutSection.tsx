'use client';

import { Heart, Award, Users, Sparkles } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="apropos" className="py-20 bg-gradient-to-b from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Image côté */}
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 flex items-center justify-center">
                <span className="text-6xl opacity-40">🌿</span>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 via-transparent to-transparent flex items-end">
                <div className="p-8 text-white">
                  <blockquote className="text-lg font-medium mb-2">
                    "Chaque fleur raconte une histoire, chaque bouquet porte une émotion."
                  </blockquote>
                  <cite className="text-sm opacity-90">— Aurélie, Fondatrice</cite>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-100 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-green-100 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Contenu */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full">
                <Heart className="w-4 h-4 text-emerald-700 mr-2" />
                <span className="text-sm font-medium text-emerald-800">Notre Histoire</span>
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

            {/* Statistiques */}
            <div className="grid grid-cols-2 gap-6 py-6">
              <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="text-3xl font-bold text-emerald-700 mb-2">500+</div>
                <div className="text-sm text-gray-600">Créations réalisées</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="text-3xl font-bold text-green-700 mb-2">127</div>
                <div className="text-sm text-gray-600">Clients satisfaits</div>
              </div>
            </div>

            {/* Nos valeurs */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">Nos Valeurs</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 p-4 border border-emerald-100 rounded-lg hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors">
                  <Award className="w-6 h-6 text-emerald-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Excellence</h4>
                    <p className="text-sm text-gray-600">Qualité premium et fraîcheur garantie</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border border-green-100 rounded-lg hover:border-green-200 hover:bg-green-50/50 transition-colors">
                  <Heart className="w-6 h-6 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Émotion</h4>
                    <p className="text-sm text-gray-600">Chaque création raconte votre histoire</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border border-emerald-100 rounded-lg hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors">
                  <Sparkles className="w-6 h-6 text-emerald-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Créativité</h4>
                    <p className="text-sm text-gray-600">Designs uniques et personnalisés</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border border-green-100 rounded-lg hover:border-green-200 hover:bg-green-50/50 transition-colors">
                  <Users className="w-6 h-6 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Proximité</h4>
                    <p className="text-sm text-gray-600">Relation client privilégiée</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Équipe */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-100">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center">
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