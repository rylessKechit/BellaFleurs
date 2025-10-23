// src/app/confidentialite/page.tsx
'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Eye, Lock, UserCheck, Settings, Mail } from 'lucide-react';

export default function ConfidentialitePage() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* En-tête */}
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-green-100 rounded-full">
                <Shield className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Politique de confidentialité</h1>
            <p className="text-lg text-gray-600">
              Chez Bella Fleurs, la protection de vos données personnelles est notre priorité. 
              Découvrez comment nous collectons, utilisons et protégeons vos informations.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">

            {/* Introduction */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Eye className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h2 className="text-xl font-semibold text-blue-800 mb-3">Notre engagement</h2>
                    <p className="text-blue-700">
                      Cette politique de confidentialité explique comment Bella Fleurs collecte, utilise et protège 
                      vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) 
                      et à la loi Informatique et Libertés.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 1. Responsable du traitement */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Responsable du traitement</h2>
                <div className="space-y-2">
                  <p><strong>Entreprise :</strong> Bella Fleurs</p>
                  <p><strong>Adresse :</strong>91220 Brétigny-sur-Orge, France</p>
                  <p><strong>Email :</strong> <a href="mailto:contact@bellafleurs.fr" className="text-blue-600 hover:underline">contact@bellafleurs.fr</a></p>
                  <p><strong>Téléphone :</strong> 07 80 66 27 32</p>
                </div>
              </CardContent>
            </Card>

            {/* 2. Données collectées */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Données personnelles collectées</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Données d'identification</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Nom et prénom</li>
                      <li>Adresse email</li>
                      <li>Numéro de téléphone</li>
                      <li>Adresse postale (pour les livraisons)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Données de commande</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Historique des achats</li>
                      <li>Préférences produits</li>
                      <li>Informations de paiement (via Stripe)</li>
                      <li>Adresse de livraison</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Données de navigation</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Adresse IP</li>
                      <li>Données de géolocalisation approximative</li>
                      <li>Informations sur votre navigateur</li>
                      <li>Pages visitées et durée de visite</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Finalités du traitement */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Pourquoi nous utilisons vos données</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Gestion des commandes</h4>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• Traitement des commandes</li>
                      <li>• Livraisons</li>
                      <li>• Service client</li>
                      <li>• Facturation</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Amélioration du service</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Personnalisation</li>
                      <li>• Statistiques d'usage</li>
                      <li>• Développement produits</li>
                      <li>• Support technique</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Communication</h4>
                    <ul className="text-purple-700 text-sm space-y-1">
                      <li>• Newsletter (avec consentement)</li>
                      <li>• Offres personnalisées</li>
                      <li>• Informations importantes</li>
                      <li>• Enquêtes de satisfaction</li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Obligations légales</h4>
                    <ul className="text-orange-700 text-sm space-y-1">
                      <li>• Comptabilité</li>
                      <li>• Fiscalité</li>
                      <li>• Lutte contre la fraude</li>
                      <li>• Respect des réglementations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Base légale */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Base légale du traitement</h2>
                <div className="space-y-3">
                  <div className="border-l-4 border-green-400 pl-4">
                    <h4 className="font-medium text-gray-800">Exécution d'un contrat</h4>
                    <p className="text-gray-600 text-sm">Traitement de vos commandes et livraisons</p>
                  </div>
                  <div className="border-l-4 border-blue-400 pl-4">
                    <h4 className="font-medium text-gray-800">Intérêt légitime</h4>
                    <p className="text-gray-600 text-sm">Amélioration de nos services et lutte contre la fraude</p>
                  </div>
                  <div className="border-l-4 border-purple-400 pl-4">
                    <h4 className="font-medium text-gray-800">Consentement</h4>
                    <p className="text-gray-600 text-sm">Newsletter et communications marketing</p>
                  </div>
                  <div className="border-l-4 border-orange-400 pl-4">
                    <h4 className="font-medium text-gray-800">Obligation légale</h4>
                    <p className="text-gray-600 text-sm">Conservation des factures et déclarations fiscales</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. Partage des données */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Partage de vos données</h2>
                <div className="space-y-4">
                  <div className="bg-red-50 border-red-200 border p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Principe général</h4>
                    <p className="text-red-700 text-sm">
                      Nous ne vendons jamais vos données personnelles à des tiers. 
                      Nous ne les partageons qu'avec des partenaires de confiance dans les cas suivants :
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-800">Prestataires de services</h4>
                      <ul className="text-gray-600 text-sm list-disc list-inside mt-1 space-y-1">
                        <li>Stripe (paiements sécurisés)</li>
                        <li>Transporteurs (livraisons)</li>
                        <li>Vercel (hébergement)</li>
                        <li>Services de support client</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-800">Obligations légales</h4>
                      <p className="text-gray-600 text-sm">
                        En cas de réquisition judiciaire ou administrative légalement justifiée.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 6. Durée de conservation */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Durée de conservation</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Type de données</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Durée</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Justification</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Données de compte</td>
                        <td className="border border-gray-300 px-4 py-2">3 ans après dernière activité</td>
                        <td className="border border-gray-300 px-4 py-2">Relation commerciale</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">Données de commande</td>
                        <td className="border border-gray-300 px-4 py-2">10 ans</td>
                        <td className="border border-gray-300 px-4 py-2">Obligations comptables</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Données de navigation</td>
                        <td className="border border-gray-300 px-4 py-2">13 mois</td>
                        <td className="border border-gray-300 px-4 py-2">Réglementation cookies</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">Newsletter</td>
                        <td className="border border-gray-300 px-4 py-2">Jusqu'à désabonnement</td>
                        <td className="border border-gray-300 px-4 py-2">Consentement</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* 7. Vos droits */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start space-x-3 mb-4">
                  <UserCheck className="w-6 h-6 text-green-600 mt-1" />
                  <h2 className="text-2xl font-semibold text-gray-900">7. Vos droits</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-400 pl-3">
                      <h4 className="font-medium text-gray-800">Droit d'accès</h4>
                      <p className="text-gray-600 text-sm">Connaître les données que nous avons sur vous</p>
                    </div>
                    
                    <div className="border-l-4 border-green-400 pl-3">
                      <h4 className="font-medium text-gray-800">Droit de rectification</h4>
                      <p className="text-gray-600 text-sm">Corriger vos données inexactes</p>
                    </div>
                    
                    <div className="border-l-4 border-red-400 pl-3">
                      <h4 className="font-medium text-gray-800">Droit d'effacement</h4>
                      <p className="text-gray-600 text-sm">Supprimer vos données (sous conditions)</p>
                    </div>
                    
                    <div className="border-l-4 border-purple-400 pl-3">
                      <h4 className="font-medium text-gray-800">Droit d'opposition</h4>
                      <p className="text-gray-600 text-sm">Vous opposer au traitement</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="border-l-4 border-orange-400 pl-3">
                      <h4 className="font-medium text-gray-800">Droit à la portabilité</h4>
                      <p className="text-gray-600 text-sm">Récupérer vos données dans un format lisible</p>
                    </div>
                    
                    <div className="border-l-4 border-yellow-400 pl-3">
                      <h4 className="font-medium text-gray-800">Droit de limitation</h4>
                      <p className="text-gray-600 text-sm">Limiter le traitement de vos données</p>
                    </div>
                    
                    <div className="border-l-4 border-indigo-400 pl-3">
                      <h4 className="font-medium text-gray-800">Retrait du consentement</h4>
                      <p className="text-gray-600 text-sm">Révoquer votre consentement à tout moment</p>
                    </div>
                    
                    <div className="border-l-4 border-gray-400 pl-3">
                      <h4 className="font-medium text-gray-800">Réclamation CNIL</h4>
                      <p className="text-gray-600 text-sm">Saisir l'autorité de contrôle</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg mt-6">
                  <h4 className="font-semibold text-blue-800 mb-2">Comment exercer vos droits ?</h4>
                  <p className="text-blue-700 text-sm mb-2">
                    Envoyez-nous un email à <a href="mailto:contact@bellafleurs.fr" className="underline">contact@bellafleurs.fr</a> 
                    en précisant votre demande et en joignant une copie de votre pièce d'identité.
                  </p>
                  <p className="text-blue-700 text-sm">
                    Nous vous répondrons dans un délai maximum d'un mois.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 8. Sécurité */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start space-x-3 mb-4">
                  <Lock className="w-6 h-6 text-green-600 mt-1" />
                  <h2 className="text-2xl font-semibold text-gray-900">8. Sécurité de vos données</h2>
                </div>
                
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Mesures techniques</h4>
                      <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                        <li>Chiffrement HTTPS/SSL</li>
                        <li>Bases de données sécurisées</li>
                        <li>Sauvegardes régulières</li>
                        <li>Contrôles d'accès stricts</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Mesures organisationnelles</h4>
                      <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                        <li>Formation du personnel</li>
                        <li>Politique de confidentialité interne</li>
                        <li>Audits de sécurité</li>
                        <li>Procédures d'incident</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 9. Cookies */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start space-x-3 mb-4">
                  <Settings className="w-6 h-6 text-gray-600 mt-1" />
                  <h2 className="text-2xl font-semibold text-gray-900">9. Cookies et technologies similaires</h2>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Notre site utilise différents types de cookies pour améliorer votre expérience :
                  </p>
                  
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 p-3 rounded">
                      <h4 className="font-medium text-green-800">Cookies essentiels</h4>
                      <p className="text-green-700 text-sm">
                        Nécessaires au fonctionnement du site (panier, authentification). 
                        Ces cookies ne peuvent pas être désactivés.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                      <h4 className="font-medium text-blue-800">Cookies de performance</h4>
                      <p className="text-blue-700 text-sm">
                        Nous aident à comprendre comment vous utilisez notre site pour l'améliorer. 
                        Données anonymisées.
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 p-3 rounded">
                      <h4 className="font-medium text-purple-800">Cookies de fonctionnalité</h4>
                      <p className="text-purple-700 text-sm">
                        Permettent de mémoriser vos préférences et de personnaliser votre expérience.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Gestion des cookies</h4>
                    <p className="text-gray-600 text-sm">
                      Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur 
                      ou notre bandeau de consentement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 10. Contact et réclamations */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Mail className="w-6 h-6 text-green-600 mt-1" />
                  <h2 className="text-2xl font-semibold text-green-800">10. Nous contacter</h2>
                </div>
                
                <div className="space-y-4 text-green-700">
                  <p>
                    Pour toute question concernant le traitement de vos données personnelles :
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Délégué à la Protection des Données</h4>
                      <p className="text-sm space-y-1">
                        <span className="block"><strong>Email :</strong> contact@bellafleurs.fr</span>
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Autorité de contrôle</h4>
                      <p className="text-sm space-y-1">
                        <span className="block"><strong>CNIL</strong></span>
                        <span className="block">3 Place de Fontenoy - TSA 80715</span>
                        <span className="block">75334 PARIS CEDEX 07</span>
                        <span className="block"><strong>Site :</strong> <a href="https://www.cnil.fr" className="underline">www.cnil.fr</a></span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Footer info */}
          <div className="max-w-4xl mx-auto mt-12 text-center">
            <p className="text-sm text-gray-500">
              Politique de confidentialité mise à jour le {new Date().toLocaleDateString('fr-FR')} • Version 2.1
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}