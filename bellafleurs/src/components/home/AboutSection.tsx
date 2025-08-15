'use client';

import { Heart, Award, Users, Sparkles } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="apropos" className="py-20 relative flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl p-12 md:p-16 mx-6">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Contenu centré */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-6 py-3 bg-green-50 rounded-full shadow-lg">
                <Heart className="w-5 h-5 text-green-700 mr-3" />
                <span className="text-base font-semibold text-green-800">Notre Histoire</span>
              </div>
              
              <h2 className="text-4xl font-bold text-green-800 mb-6">
                L'art floral au cœur de Paris
              </h2>
              
              <div className="p-8">
                <p className="text-xl text-green-800 leading-relaxed">
                  Depuis 2019, Bella Fleurs crée des moments magiques à travers l'art floral. 
                  Installés au cœur du 15ème arrondissement, nous mettons notre passion et notre 
                  savoir-faire au service de vos plus beaux souvenirs.
                </p>
              </div>
            </div>

            {/* Nos Valeurs */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-green-800 drop-shadow">Nos Valeurs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-6 shadow-lg">
                  <div className="flex items-start space-x-4">
                    <Award className="w-8 h-8 text-green-700 mt-1" />
                    <div>
                      <h4 className="font-semibold text-green-800 text-lg">Excellence</h4>
                      <p className="text-green-700">Qualité artisanale reconnue</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-xl p-6 shadow-lg">
                  <div className="flex items-start space-x-4">
                    <Sparkles className="w-8 h-8 text-green-700 mt-1" />
                    <div>
                      <h4 className="font-semibold text-green-800 text-lg">Créativité</h4>
                      <p className="text-green-700">Créations uniques et originales</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-xl p-6 shadow-lg">
                  <div className="flex items-start space-x-4">
                    <Heart className="w-8 h-8 text-green-700 mt-1" />
                    <div>
                      <h4 className="font-semibold text-green-800 text-lg">Passion</h4>
                      <p className="text-green-700">Amour du métier depuis 20 ans</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-xl p-6 shadow-lg">
                  <div className="flex items-start space-x-4">
                    <Users className="w-8 h-8 text-green-700 mt-1" />
                    <div>
                      <h4 className="font-semibold text-green-800 text-lg">Proximité</h4>
                      <p className="text-green-700">Relation client privilégiée</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Équipe */}
            <div className="p-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-green-700">A</span>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-green-800">Aurélie</h4>
                  <p className="text-green-700">Fleuriste passionnée & Fondatrice</p>
                  <p className="text-sm text-green-600 mt-1">
                    Diplômée en art floral, 23 ans d'expérience
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