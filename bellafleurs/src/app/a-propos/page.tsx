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

  const values = [
    {
      icon: Award,
      title: "Excellence",
      description: "Qualité artisanale reconnue dans chaque création",
      color: "blue"
    },
    {
      icon: Sparkles,
      title: "Créativité",
      description: "Créations uniques et originales pour chaque client",
      color: "purple"
    },
    {
      icon: Heart,
      title: "Passion",
      description: "Amour du métier transmis depuis 23 ans",
      color: "red"
    },
    {
      icon: Users,
      title: "Proximité",
      description: "Relation client privilégiée et conseils personnalisés",
      color: "green"
    }
  ];

  const stats = [
    { number: "2019", label: "Année de création" },
    { number: "1000+", label: "Clients satisfaits" },
    { number: "23", label: "Années d'expérience" },
    { number: "365", label: "Jours de fraîcheur garantie" }
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        
        {/* Hero Section */}
        <section className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-6 py-3 bg-green-100 rounded-full shadow-lg mb-8">
                <Heart className="w-6 h-6 text-green-700 mr-3" />
                <span className="text-lg font-semibold text-green-800">Notre Histoire</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-green-800 mb-8">
                L'art floral au cœur de Paris
              </h1>
              
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

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-green-700 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Notre histoire - Timeline */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-green-800 mb-6">
                Notre parcours
              </h2>
              <p className="text-lg text-green-600 max-w-2xl mx-auto">
                Une histoire de passion qui s'écrit depuis plus de 20 ans
              </p>
            </div>

            <div className="space-y-8">
              {timeline.map((event, index) => (
                <div
                  key={index}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} gap-8`}
                >
                  <div className="flex-1">
                    <div className={`bg-green-50 rounded-xl p-6 shadow-lg ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {event.year}
                      </div>
                      <h3 className="text-xl font-semibold text-green-800 mb-3">
                        {event.title}
                      </h3>
                      <p className="text-green-700">
                        {event.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-4 h-4 bg-green-600 rounded-full flex-shrink-0"></div>
                  
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* L'équipe */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-green-800 mb-6">
                Notre équipe
              </h2>
              <p className="text-lg text-green-600 max-w-2xl mx-auto">
                Des passionnées au service de vos émotions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {team.map((member, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-green-700">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      {member.name}
                    </h3>
                    <p className="text-green-600 font-medium mb-1">
                      {member.role}
                    </p>
                    <p className="text-sm text-green-500 mb-2">
                      {member.experience}
                    </p>
                    <p className="text-sm text-green-500 font-medium">
                      Spécialité : {member.speciality}
                    </p>
                  </div>
                  <p className="text-green-700 text-center">
                    {member.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nos valeurs */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-green-800 mb-6">
                Nos valeurs
              </h2>
              <p className="text-lg text-green-600 max-w-2xl mx-auto">
                Les principes qui guident notre quotidien
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-green-50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <value.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-green-800 mb-3">
                        {value.title}
                      </h3>
                      <p className="text-green-700">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact rapide */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-green-600 rounded-2xl p-8 md:p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-6">
                Prêt à créer quelque chose de magique ?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Contactez-nous pour discuter de votre projet floral
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center justify-center space-x-3">
                  <MapPin className="w-5 h-5" />
                  <span>Paris 15ème</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <Phone className="w-5 h-5" />
                  <span>01 23 45 67 89</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <Mail className="w-5 h-5" />
                  <span>contact@bellafleurs.fr</span>
                </div>
              </div>
              
              <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-200">
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