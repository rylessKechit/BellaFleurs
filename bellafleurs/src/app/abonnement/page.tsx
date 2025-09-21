// src/app/abonnement/page.tsx
'use client';

import { useState } from 'react';
import { Check, Star, Calendar, Gift, Truck, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';


export default function AbonnementPage() {
  const [selectedFrequency, setSelectedFrequency] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        
        {/* Hero Section - RESPONSIVE APPLIQUÉ */}
        <section className="bg-gradient-to-b from-primary-50 to-white py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-4 sm:mb-6 bg-primary-100 text-primary-700 hover:bg-primary-100">
                🌸 Nouveauté 2024
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Abonnement Floral
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed px-4 sm:px-0">
                Recevez chaque mois une création florale unique, sélectionnée avec soin 
                par notre fleuriste experte. Transformez votre quotidien en un jardin de bonheur.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 mr-2" />
                  Livraison gratuite
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 mr-2" />
                  Flexible et sans engagement
                </div>
                <div className="flex items-center">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 mr-2" />
                  Créations exclusives
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA final - RESPONSIVE APPLIQUÉ */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Prêt(e) à transformer votre quotidien ?
            </h2>
            <p className="text-lg sm:text-xl text-primary-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Commencez votre abonnement floral dès aujourd'hui et recevez 
              votre première création dans 48h !
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100 px-6 sm:px-8">
                Commencer mon abonnement
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600 px-6 sm:px-8">
                Questions fréquentes
              </Button>
            </div>
            
            <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-primary-100">
              ✓ Sans engagement • ✓ Pause à tout moment • ✓ Livraison gratuite
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}