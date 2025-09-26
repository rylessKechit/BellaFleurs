// src/app/a-propos/page.tsx
'use client';

import { Heart, Award, Users, Sparkles, MapPin, Calendar, Phone, Mail } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AProposPage() {
  const team = [
    {
      name: "Aurélie",
      role: "Fleuriste passionnée & Fondatrice",
      experience: "23 ans d'expérience",
      speciality: "Art floral français",
      description: "Diplômée en art floral, Aurélie a consacré sa vie à créer des moments magiques à travers les fleurs."
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 pt-16">
        
        {/* Hero Section - RESPONSIVE APPLIQUÉ */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-green-100 rounded-full shadow-lg mb-6 sm:mb-8">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 mr-2 sm:mr-3" />
                <span className="text-sm sm:text-base font-semibold text-green-800">Notre Histoire</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-green-800 mb-6 sm:mb-8">
                À propos de Bella Fleurs
              </h1>
              
              <p className="text-lg sm:text-xl text-green-700 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                Depuis plus de 20 ans, nous créons des moments magiques à travers l'art floral. 
                Découvrez notre passion, notre savoir-faire et l'équipe qui donne vie à vos émotions.
              </p>
            </div>
          </div>
        </section>

        {/* Histoire personnelle - RESPONSIVE APPLIQUÉ */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 lg:p-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 mb-4 sm:mb-6">
                    L'histoire d'Aurélie
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl text-green-800 leading-relaxed">
                    Tout a commencé il y a plus de vingt ans, lorsque j'ai découvert ma passion pour les fleurs. 
                    Cette passion m'a menée à travers différentes expériences enrichissantes.
                  </p>
                  <p className="text-base sm:text-lg md:text-xl text-green-800 leading-relaxed mt-3 sm:mt-4">
                    J'ai eu la chance d'apprendre différentes techniques dans plusieurs boutiques (MIN, fleuriste traditionnel, fleuriste de luxe, fleuriste franchisé).
                  </p>
                  <p className="text-base sm:text-lg md:text-xl text-green-800 leading-relaxed mt-3 sm:mt-4">
                    Puis j'ai ouvert ma propre boutique de fleurs à Cagnes-sur-Mer, sur les bords de la Méditerranée. Je l'ai gérée pendant six ans avec mon mari. Ce fut une très belle histoire de fleurs et de rencontres humaines. Notre amour a grandi et une nouvelle fleur a éclos : notre fille Bella.
                  </p>
                  <p className="text-base sm:text-lg md:text-xl text-green-800 leading-relaxed mt-3 sm:mt-4">
                    Aujourd'hui, nous avons posé nos valises à Brétigny-sur-Orge. Me voilà prête pour vivre une nouvelle aventure avec mon site internet www.bellafleurs.fr . Cela fait 20 ans que les fleurs, les compositions et les bouquets font partie de ma vie. Avec www.bellafleurs.fr, mon savoir-faire et ma passion, je vous propose des créations florales originales et de saison pour accompagner vos plus beaux instants de vie et créer des souvenirs inoubliables.
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-green-200 to-green-300 rounded-full flex items-center justify-center shadow-xl">
                      <span className="text-6xl sm:text-8xl font-bold text-white">A</span>
                    </div>
                    <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-3 shadow-lg">
                      <Sparkles className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Équipe - CARD CENTRÉE ET TEXTE CENTRÉ */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 mb-4 sm:mb-6">
                Notre équipe passionnée
              </h2>
              <p className="text-base sm:text-lg text-green-600 max-w-2xl mx-auto">
                Des expertes dévouées à votre bonheur floral
              </p>
            </div>

            {/* Card centrée au milieu de la page */}
            <div className="flex justify-center">
              <div className="max-w-md">
                {team.map((member, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Contenu centré */}
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <span className="text-xl sm:text-2xl font-bold text-green-700">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-2">
                        {member.name}
                      </h3>
                      <p className="text-sm sm:text-base text-green-600 font-medium mb-1">
                        {member.role}
                      </p>
                      <p className="text-xs sm:text-sm text-green-500 mb-2">
                        {member.experience}
                      </p>
                      <p className="text-xs sm:text-sm text-green-500 font-medium mb-4">
                        Spécialité : {member.speciality}
                      </p>
                    </div>
                    {/* Description centrée */}
                    <p className="text-sm sm:text-base text-green-700 text-center leading-relaxed">
                      {member.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Nos valeurs - RESPONSIVE APPLIQUÉ */}
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 mb-4 sm:mb-6">
                Nos valeurs
              </h2>
              <p className="text-base sm:text-lg text-green-600 max-w-2xl mx-auto">
                Les principes qui guident notre travail au quotidien
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="bg-green-50 rounded-xl p-4 sm:p-6 hover:bg-green-100 transition-colors text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-green-700" />
                </div>
                <h4 className="font-semibold text-green-800 text-sm sm:text-base mb-2">Passion</h4>
                <p className="text-green-700 text-xs sm:text-sm">20 ans d'expérience et d'amour pour les fleurs</p>
              </div>
              
              <div className="bg-green-50 rounded-xl p-4 sm:p-6 hover:bg-green-100 transition-colors text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-green-700" />
                </div>
                <h4 className="font-semibold text-green-800 text-sm sm:text-base mb-2">Excellence</h4>
                <p className="text-green-700 text-xs sm:text-sm">Savoir-faire artisanal et créations sur mesure</p>
              </div>
              
              <div className="bg-green-50 rounded-xl p-4 sm:p-6 hover:bg-green-100 transition-colors text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-700" />
                </div>
                <h4 className="font-semibold text-green-800 text-sm sm:text-base mb-2">Proximité</h4>
                <p className="text-green-700 text-xs sm:text-sm">À l'écoute de vos besoins et émotions</p>
              </div>
              
              <div className="bg-green-50 rounded-xl p-4 sm:p-6 hover:bg-green-100 transition-colors text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-green-700" />
                </div>
                <h4 className="font-semibold text-green-800 text-sm sm:text-base mb-2">Créativité</h4>
                <p className="text-green-700 text-xs sm:text-sm">Compositions originales et inspirées</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact - RESPONSIVE APPLIQUÉ */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 text-white text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Créons ensemble votre projet floral
              </h2>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto">
                Contactez-nous pour donner vie à vos idées et créer des souvenirs inoubliables
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-xl mx-auto mb-6 sm:mb-8">
                <div className="flex items-center justify-center space-x-2">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">07 80 66 27 32</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">contact@bellafleurs.fr</span>
                </div>
              </div>
              
              <button className="bg-white text-green-700 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base">
                Nous contacter
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}