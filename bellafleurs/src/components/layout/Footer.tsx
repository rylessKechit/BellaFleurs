// src/components/layout/Footer.tsx - VERSION AVEC FIX HYDRATATION
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, Heart, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  // ✅ FIX HYDRATATION : État pour contrôler le rendu côté client
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600">
                  91220 Brétigny-sur-Orge
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary-600 flex-shrink-0" />
                <a 
                  href="tel:+33780662732" 
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  07 80 66 27 32
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary-600 flex-shrink-0" />
                <a 
                  href="mailto:contact@bellafleurs.fr" 
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  contact@bellafleurs.fr
                </a>
              </div>
            </div>
          </div>

          {/* Horaires */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Horaires</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-primary-600 flex-shrink-0" />
                <div>
                  <p className="font-medium">Lundi - Samedi</p>
                  <p>9h00 - 13h00 / 14h00 - 19h00</p>
                </div>
              </div>
              <div className="ml-6">
                <p className="font-medium">Dimanche</p>
                <p>Fermée</p>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              Newsletter 
              <span className="ml-2">🌺</span>
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

        {/* Navigation rapide */}
        <div className="border-t border-gray-200 py-8">
          <div className="grid grid-cols-2 gap-6">
            
            {/* Navigation */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Navigation</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/a-propos" className="text-gray-600 hover:text-primary-600 transition-colors">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link href="/savoir-faire" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Savoir-faire
                  </Link>
                </li>
                <li>
                  <Link href="/produits" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Mes créations
                  </Link>
                </li>
                <li>
                  <Link href="/abonnement" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Abonnement
                  </Link>
                </li>
              </ul>
            </div>

            {/* Nos Créations */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Nos Créations</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/produits?category=Fleurs%20de%20saisons" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Fête nouvel an
                  </Link>
                </li>
                <li>
                  <Link href="/produits?category=Incontournable" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Incontournables
                  </Link>
                </li>
                <li>
                  <Link href="/produits?category=Bouquets" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Bouquets
                  </Link>
                </li>
                <li>
                  <Link href="/produits?category=Roses" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Roses
                  </Link>
                </li>
                <li>
                  <Link href="/produits?category=Compositions%20piqu%C3%A9es" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Compositions piquées
                  </Link>
                </li>
                <li>
                  <Link href="/produits?category=Orchid%C3%A9es" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Orchidées
                  </Link>
                </li>
                <li>
                  <Link href="/produits?category=Deuil" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Deuil
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="py-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center text-sm text-gray-600">
            <span>© 2025 Bella Fleurs. Fait avec</span>
            <Heart className="w-4 h-4 text-red-500 mx-1" fill="currentColor" />
            <span>à Brétigny-sur-Orge</span>
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

      {/* ✅ PÉTALES FLOTTANTS AVEC FIX HYDRATATION */}
      {isMounted && (
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-20 pointer-events-none">
          {/* ✅ UTILISATION DE VALEURS FIXES AU LIEU DE Math.random() */}
          {[
            { left: 15, bottom: 2, delay: 0, duration: 4 },
            { left: 30, bottom: 5, delay: 0.5, duration: 4.5 },
            { left: 45, bottom: 1, delay: 1, duration: 4.2 },
            { left: 60, bottom: 7, delay: 1.5, duration: 4.8 },
            { left: 75, bottom: 3, delay: 2, duration: 4.3 },
            { left: 90, bottom: 6, delay: 2.5, duration: 4.7 },
          ].map((petal, i) => (
            <div
              key={i}
              className="absolute opacity-10 text-xl animate-float"
              style={{
                left: `${petal.left}%`,
                bottom: `${petal.bottom}px`,
                animationDelay: `${petal.delay}s`,
                animationDuration: `${petal.duration}s`,
              }}
            >
              🌸
            </div>
          ))}
        </div>
      )}
    </footer>
  );
}