// src/app/zone-livraison/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zone de Livraison - Fleuriste Brétigny-sur-Orge | Bella Fleurs',
  description: 'Découvrez notre zone de livraison : Brétigny-sur-Orge, Sainte-Geneviève-des-Bois, Arpajon, Fleury-Mérogis. Livraison 24h de vos bouquets en Essonne.',
  keywords: [
    'livraison fleurs brétigny',
    'livraison fleurs essonne',
    'fleuriste sainte geneviève des bois',
    'fleuriste arpajon',
    'livraison bouquet 91'
  ]
};

export default function ZoneLivraisonPage() {
  return (
    <main className="pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-green-800 mb-8">
          Zone de Livraison - Fleuriste Brétigny-sur-Orge
        </h1>
        
        <p className="text-lg mb-6">
          Bella Fleurs, votre fleuriste à Brétigny-sur-Orge, livre vos bouquets 
          et compositions florales dans toute l'Essonne en 24h maximum.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Villes desservies</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            'Brétigny-sur-Orge',
            'Sainte-Geneviève-des-Bois', 
            'Arpajon',
            'Fleury-Mérogis',
            'Longjumeau',
            'Montlhéry',
            'Saint-Michel-sur-Orge'
          ].map(city => (
            <div key={city} className="bg-green-50 p-3 rounded-lg">
              <span className="text-green-800 font-medium">{city}</span>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-semibold mb-4">Pourquoi choisir notre service de livraison ?</h2>
        <ul className="space-y-2">
          <li>• Fleuriste locale à Brétigny-sur-Orge depuis 20 ans</li>
          <li>• Livraison express 24h en Essonne</li>
          <li>• Bouquets frais préparés le jour même</li>
          <li>• Service personnalisé par votre fleuriste Bella Fleurs</li>
        </ul>
      </div>
    </main>
  );
}