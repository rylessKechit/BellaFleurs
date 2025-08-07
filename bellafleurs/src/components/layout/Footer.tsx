// src/components/layout/Footer.tsx
'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, Heart, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section principale */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* À propos */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-2">🌸</span>
              Bella Fleurs
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Créateur de moments magiques depuis 2020. 
              Nous transformons vos émotions en créations florales uniques, 
              avec passion et savoir-faire artisanal.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://facebook.com"
                target="_blank"
                className="text-gray-400 hover:text-primary-600 transition-colors duration-200"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                className="text-gray-400 hover:text-primary-600 transition-colors duration-200"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                className="text-gray-400 hover:text-primary-600 transition-colors duration-200"
              >
                <Twitter className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Navigation rapide */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {[
                { name: 'Accueil', href: '/' },
                { name: 'Nos produits', href: '/produits' },
                { name: 'À propos', href: '/#apropos' },
                { name: 'Galerie', href: '/#galerie' },
                { name: 'Contact', href: '/#contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Nos services</h4>
            <ul className="space-y-2 text-sm">
              {[
                'Bouquets sur mesure',
                'Compositions florales',
                'Mariages & événements',
                'Livraison express',
                'Abonnements floraux',
                'Conseils d\'entretien'
              ].map((service) => (
                <li key={service} className="text-gray-600 flex items-start">
                  <span className="text-primary-500 mr-2 mt-0.5">•</span>
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Horaires */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <div className="text-gray-600">
                  <p>123 Avenue des Fleurs</p>
                  <p>75015 Paris, France</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <a
                  href="tel:+33123456789"
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  01 23 45 67 89
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <a
                  href="mailto:contact@bellafleurs.fr"
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  contact@bellafleurs.fr
                </a>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <div className="text-gray-600">
                  <p>Lun-Sam: 9h-19h</p>
                  <p>Dimanche: 9h-13h</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section newsletter */}
        <div className="py-8 border-t border-gray-200">
          <div className="max-w-md mx-auto text-center space-y-4">
            <h4 className="font-semibold text-gray-900">
              Restez au parfum de nos nouveautés ! 🌺
            </h4>
            <p className="text-sm text-gray-600">
              Recevez nos offres spéciales et conseils floraux
            </p>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         text-sm"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700
                         text-white rounded-lg hover:from-primary-700 hover:to-primary-800
                         focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                         font-medium text-sm transition-all duration-200
                         shadow-md hover:shadow-lg"
              >
                S'abonner
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="py-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center text-sm text-gray-600">
            <span>© 2024 Bella Fleurs. Fait avec</span>
            <Heart className="w-4 h-4 text-red-500 mx-1" fill="currentColor" />
            <span>à Paris</span>
          </div>
          
          <div className="flex space-x-6 text-sm">
            <Link
              href="/mentions-legales"
              className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
            >
              Mentions légales
            </Link>
            <Link
              href="/confidentialite"
              className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
            >
              Confidentialité
            </Link>
            <Link
              href="/cgv"
              className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
            >
              CGV
            </Link>
          </div>
        </div>
      </div>

      {/* Pétales flottants décoratifs */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-20 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-10"
            style={{
              left: `${15 + i * 15}%`,
              bottom: `${Math.random() * 10}px`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
              fontSize: '20px'
            }}
          >
            🌸
          </div>
        ))}
      </div>
    </footer>
  );
}