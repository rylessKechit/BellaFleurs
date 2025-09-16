// src/app/a-propos/page.tsx
'use client';

import { Heart, Award, Users, Sparkles, MapPin, Calendar, Phone, Mail } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AProposPage() {
  const timeline = [
    {
      year: "2001",
      title: "Début de la passion",
      description: "Aurélie découvre l'art floral lors de sa formation professionnelle"
    },
    {
      year: "2010",
      title: "Perfectionnement",
      description: "Formation avancée en compositions florales et ikebana au Japon"
    },
    {
      year: "2019",
      title: "Naissance de Bella Fleurs",
      description: "Ouverture de la boutique dans le 15ème arrondissement de Paris"
    },
    {
      year: "2024",
      title: "Reconnaissance",
      description: "Fleuriste de l'année dans le 15ème, plus de 1000 clients satisfaits"
    }
  ];

  const team = [
    {
      name: "Aurélie",
      role: "Fleuriste passionnée & Fondatrice",
      experience: "23 ans d'expérience",
      speciality: "Art floral français et japonais",
      description: "Diplômée en art floral, Aurélie a consacré sa vie à créer des moments magiques à travers les fleurs. Sa passion l'a menée du Japon aux ateliers parisiens les plus prestigieux."
    },
    {
      name: "Marie",
      role: "Assistante créative",
      experience: "5 ans d'expérience",
      speciality: "Compositions modernes",
      description: "Jeune talent formée par Aurélie, Marie apporte une vision contemporaine aux créations traditionnelles de la boutique."
    }
  ];

  const stats = [
    { number: "23", label: "Ans d'expérience" },
    { number: "1000+", label: "Clients satisfaits" },
    { number: "500+", label: "Créations uniques" },
    { number: "5★", label: "Note moyenne" }
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
                    Aujourd'hui, nous avons posé nos valises à Bretigny-sur-Orge. Me voilà prête pour vivre une nouvelle aventure avec mon site internet www.bellafleurs.com . Cela fait 20 ans que les fleurs, les compositions et les bouquets font partie de ma vie. Avec www.bellafleurs.com, mon savoir-faire et ma passion, je vous propose des créations florales originales et de saison pour accompagner vos plus beaux instants de vie et créer des souvenirs inoubliables.
                  </p>
                </div>

                {/* Stats - RESPONSIVE APPLIQUÉ */}
                <div className="grid grid-cols-2 gap-6 sm:gap-8 max-w-md mx-auto lg:max-w-none">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-600 mb-2">
                        {stat.number}
                      </div>
                      <div className="text-sm sm:text-base text-green-700 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notre histoire - Timeline - RESPONSIVE APPLIQUÉ */}
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 mb-4 sm:mb-6">
                Notre parcours
              </h2>
              <p className="text-base sm:text-lg text-green-600 max-w-2xl mx-auto">
                Une histoire de passion qui s'écrit depuis plus de 20 ans
              </p>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {timeline.map((event, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 sm:gap-8`}
                >
                  <div className="flex-1">
                    <div className={`bg-green-50 rounded-xl p-4 sm:p-6 shadow-lg ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <div className="text-lg sm:text-xl font-bold text-green-600 mb-2">
                        {event.year}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-green-800 mb-2 sm:mb-3">
                        {event.title}
                      </h3>
                      <p className="text-sm sm:text-base text-green-700">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                  </div>

                  <div className="flex-1 hidden md:block"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Équipe - RESPONSIVE APPLIQUÉ */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
              {team.map((member, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
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
                    <p className="text-xs sm:text-sm text-green-500 font-medium">
                      Spécialité : {member.speciality}
                    </p>
                  </div>
                  <p className="text-sm sm:text-base text-green-700 text-center">
                    {member.description}
                  </p>
                </div>
              ))}
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
                <p className="text-green-700 text-xs sm:text-sm">20 ans d'expérience</p>
              </div>
              
              <div className="bg-green-50 rounded-xl p-4 sm:p-6 hover:bg-green-100 transition-colors text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-green-700" />
                </div>
                <h4 className="font-semibold text-green-800 text-sm sm:text-base mb-2">Qualité</h4>
                <p className="text-green-700 text-xs sm:text-sm">Créations sur mesure</p>
              </div>
              
              <div className="bg-green-50 rounded-xl p-4 sm:p-6 hover:bg-green-100 transition-colors text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-green-700" />
                </div>
                <h4 className="font-semibold text-green-800 text-sm sm:text-base mb-2">Créativité</h4>
                <p className="text-green-700 text-xs sm:text-sm">Designs originaux</p>
              </div>
              
              <div className="bg-green-50 rounded-xl p-4 sm:p-6 hover:bg-green-100 transition-colors text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-700" />
                </div>
                <h4 className="font-semibold text-green-800 text-sm sm:text-base mb-2">Proximité</h4>
                <p className="text-green-700 text-xs sm:text-sm">Relation client privilégiée</p>
              </div>
            </div>

            {/* Contact info - RESPONSIVE APPLIQUÉ */}
            <div className="bg-green-50 rounded-2xl p-6 sm:p-8 mt-12 sm:mt-16">
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-green-800 mb-3 sm:mb-4">
                  Nous contacter
                </h3>
                <p className="text-sm sm:text-base text-green-700">
                  Une question ? Un projet ? N'hésitez pas à nous contacter
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center text-center sm:text-left">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mb-2 sm:mb-0 sm:mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800 text-sm sm:text-base">Bretigny-sur-Orge</p>
                    <p className="text-green-700 text-xs sm:text-sm">Essonne (91)</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center text-center sm:text-left">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mb-2 sm:mb-0 sm:mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800 text-sm sm:text-base">06 XX XX XX XX</p>
                    <p className="text-green-700 text-xs sm:text-sm">Lun-Sam 9h-18h</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center text-center sm:text-left sm:col-span-2 md:col-span-1">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mb-2 sm:mb-0 sm:mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800 text-sm sm:text-base">contact@bellafleurs.com</p>
                    <p className="text-green-700 text-xs sm:text-sm">Réponse sous 24h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}