'use client';

import { Heart, Award, Users, Sparkles } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="apropos" className="py-12 sm:py-16 md:py-20 relative flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-12 lg:p-16 mx-3 sm:mx-6">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Contenu centré */}
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-green-50 rounded-full shadow-lg">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 mr-2 sm:mr-3" />
                <span className="text-sm sm:text-base font-semibold text-green-800">Notre Histoire</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 mb-4 sm:mb-6 leading-tight">
                L'art floral au cœur de Paris
              </h2>
              
              <div className="p-4 sm:p-6 md:p-8">
                <p className="text-base sm:text-lg md:text-xl text-green-800 leading-relaxed">
                  Fleuriste passionnée depuis plus de 20 ans, j'ai commencé mon apprentissage à 17 ans sur le bassin d'Arcachon.
                </p>
                <p className="text-base sm:text-lg md:text-xl text-green-800 leading-relaxed mt-3 sm:mt-4">
                  Par la suite, je suis allée d'expérience en expérience. J'ai eu la chance d'apprendre différentes techniques dans plusieurs boutiques (MIN, fleuriste traditionnel, fleuriste de luxe, fleuriste franchisé.)
                </p>
                <p className="text-base sm:text-lg md:text-xl text-green-800 leading-relaxed mt-3 sm:mt-4">
                  Puis j'ai ouvert ma propre boutique de fleurs à Cagnes-sur-Mer, sur les bords de la Méditerranée. Je l'ai gérée pendant six ans avec mon mari. Ce fut une très belle histoire de fleurs et de rencontres humaines. Notre amour a grandi et une nouvelle fleur a éclos : notre fille Bella.
                </p>
                <p className="text-base sm:text-lg md:text-xl text-green-800 leading-relaxed mt-3 sm:mt-4">
                  Aujourd'hui, nous avons posé nos valises à Bretigny-sur-Orge. Me voilà prête pour vivre une nouvelle aventure avec mon site internet www.bellafleurs.com . Cela fait 20 ans que les fleurs, les compositions et les bouquets font partie de ma vie. Avec www.bellafleurs.com, mon savoir-faire et ma passion, je vous propose des créations florales originales et de saison pour accompagner vos plus beaux instants de vie et créer des souvenirs inoubliables.
                </p>
              </div>
            </div>

            {/* Section valeurs/qualités */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12">
              <div className="p-4 sm:p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 text-sm sm:text-base">Passion</h4>
                    <p className="text-green-700 text-xs sm:text-sm mt-1">20 ans d'expérience</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <Award className="w-6 h-6 sm:w-8 sm:h-8 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 text-sm sm:text-base">Qualité</h4>
                    <p className="text-green-700 text-xs sm:text-sm mt-1">Créations sur mesure</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 text-sm sm:text-base">Créativité</h4>
                    <p className="text-green-700 text-xs sm:text-sm mt-1">Designs originaux</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 text-sm sm:text-base">Proximité</h4>
                    <p className="text-green-700 text-xs sm:text-sm mt-1">Relation client privilégiée</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Équipe */}
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-lg sm:text-xl font-semibold text-green-700">A</span>
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="font-semibold text-green-800 text-base sm:text-lg">Aurélie</h4>
                  <p className="text-green-700 text-sm sm:text-base">Fleuriste passionnée & Fondatrice</p>
                  <p className="text-xs sm:text-sm text-green-600 mt-1">
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