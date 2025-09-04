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
                  Fleuriste passionnée depuis plus de 20 ans, j’ai commencé mon apprentissage à 17 ans sur le bassin d’Arcachon.
                </p>
                <p className="text-xl text-green-800 leading-relaxed mt-4">
                  Par la suite, je suis allée d’expérience en expérience. J’ai eu la chance d’apprendre différentes techniques dans plusieurs boutiques (MIN, fleuriste traditionnel, fleuriste de luxe, fleuriste franchisé.
                </p>
                <p className="text-xl text-green-800 leading-relaxed mt-4">
                  Puis j’ai ouvert ma propre boutique de fleurs à Cagnes-sur-Mer, sur les bords de la Méditerranée. Je l’ai gérée pendant six ans avec mon mari. Ce fut une très belle histoire de fleurs et de rencontres humaines. Notre amour a grandi et une nouvelle fleur a éclos : notre fille Bella.
                </p>
                <p className="text-xl text-green-800 leading-relaxed mt-4">
                  Aujourd’hui, nous avons posé nos valises à Bretigny-sur-Orge. Me voilà prête pour vivre une nouvelle aventure avec mon site internet www.bellafleurs.com . Cela fait 20 ans que les fleurs, les compositions et les bouquets font partie de ma vie. Avec www.bellafleurs.com, mon savoir-faire et ma passion, je vous propose des créations florales originales et de saison pour accompagner vos plus beaux instants de vie et créer des souvenirs inoubliables.
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