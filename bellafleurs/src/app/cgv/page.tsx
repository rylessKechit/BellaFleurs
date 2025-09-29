// src/app/cgv/page.tsx
'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, ShoppingCart, Truck, CreditCard, RotateCcw, AlertTriangle } from 'lucide-react';

export default function CGVPage() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* En-tête */}
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-green-100 rounded-full">
                <FileText className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Conditions Générales de Vente</h1>
            <p className="text-lg text-gray-600">
              Les présentes conditions générales de vente régissent les relations contractuelles 
              entre Bella Fleurs et ses clients.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">

            {/* Article 1 - Informations légales */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 1 - Informations légales</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <p><strong>Raison sociale :</strong> Bella Fleurs</p>
                    <p><strong>Forme juridique :</strong> Entreprise individuelle</p>
                    <p><strong>Email :</strong> <a href="mailto:contact@bellafleurs.fr" className="text-blue-600 hover:underline">contact@bellafleurs.fr</a></p>
                    <p><strong>Téléphone :</strong> 07 80 66 27 32</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Article 2 - Champ d'application */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 2 - Champ d'application</h2>
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Les présentes conditions générales de vente s'appliquent à toutes les commandes passées 
                    sur le site internet <strong>bella-fleurs.fr</strong> par des consommateurs pour un usage non professionnel.
                  </p>
                  <p className="text-gray-600">
                    Toute commande implique l'acceptation pleine et entière des présentes conditions générales de vente 
                    qui prévalent sur toutes autres conditions.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      <strong>Important :</strong> Nous nous réservons le droit de modifier les présentes CGV à tout moment. 
                      Les conditions applicables sont celles en vigueur au moment de la commande.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Article 3 - Produits et services */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start space-x-3 mb-4">
                  <ShoppingCart className="w-6 h-6 text-green-600 mt-1" />
                  <h2 className="text-2xl font-semibold text-gray-900">Article 3 - Produits et services</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">3.1 Description des produits</h3>
                    <p className="text-gray-600 mb-3">
                      Bella Fleurs propose la vente et la livraison de compositions florales fraîches, 
                      bouquets et arrangements floraux.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Bouquets de saison</li>
                      <li>Compositions florales sur mesure</li>
                      <li>Arrangements pour événements</li>
                      <li>Plantes d'intérieur et d'extérieur</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Nature des produits</h4>
                        <p className="text-yellow-700 text-sm mt-1">
                          Les fleurs étant des produits naturels et périssables, l'aspect, la couleur et la taille 
                          peuvent légèrement varier selon les arrivages et la saison. Nous nous engageons à respecter 
                          l'esprit de la composition commandée.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">3.2 Disponibilité</h3>
                    <p className="text-gray-600">
                      Nos offres sont valables tant qu'elles sont visibles sur le site, dans la limite des stocks disponibles. 
                      En cas d'indisponibilité d'un produit, nous vous contacterons pour vous proposer un produit de substitution 
                      de qualité équivalente ou supérieure, ou le remboursement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Article 4 - Commandes */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 4 - Modalités de commande</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">4.1 Processus de commande</h3>
                    <ol className="list-decimal list-inside text-gray-600 space-y-1">
                      <li>Sélection des produits et ajout au panier</li>
                      <li>Vérification du contenu du panier</li>
                      <li>Saisie des informations de livraison et de facturation</li>
                      <li>Choix du mode de livraison et de la date</li>
                      <li>Validation et paiement sécurisé</li>
                      <li>Confirmation de commande par email</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">4.2 Confirmation de commande</h3>
                    <p className="text-gray-600">
                      Toute commande est considérée comme définitive après validation du paiement. 
                      Un email de confirmation contenant les détails de votre commande vous sera envoyé.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">4.3 Données personnelles</h3>
                    <p className="text-gray-600">
                      Les informations recueillies lors de la commande sont nécessaires à son traitement et à la livraison. 
                      Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de ces données.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Article 5 - Prix */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start space-x-3 mb-4">
                  <CreditCard className="w-6 h-6 text-green-600 mt-1" />
                  <h2 className="text-2xl font-semibold text-gray-900">Article 5 - Prix et paiement</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">5.1 Prix</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Les prix sont indiqués en euros, toutes taxes comprises (TTC)</li>
                      <li>Les prix peuvent être modifiés à tout moment, mais n'affectent pas les commandes déjà validées</li>
                      <li>Les frais de livraison sont indiqués avant validation de la commande</li>
                      <li>Livraison gratuite à partir de 50€ d'achat</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">5.2 Modalités de paiement</h3>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <p className="text-green-800 mb-2"><strong>Modes de paiement acceptés :</strong></p>
                      <ul className="list-disc list-inside text-green-700 space-y-1">
                        <li>Carte bancaire (Visa, Mastercard, American Express)</li>
                        <li>Apple Pay</li>
                        <li>Google Pay</li>
                      </ul>
                      <p className="text-green-700 text-sm mt-2">
                        Tous les paiements sont sécurisés par notre partenaire Stripe, certifié PCI DSS.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">5.3 Facturation</h3>
                    <p className="text-gray-600">
                      La facturation s'effectue au moment de la validation de la commande. 
                      Une facture électronique vous sera envoyée par email et sera accessible dans votre espace client.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Article 6 - Livraison */}
            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-start space-x-3 mb-4">
                    <Truck className="w-6 h-6 text-green-600 mt-1" />
                    <h2 className="text-2xl font-semibold text-gray-900">Article 6 - Livraison</h2>
                    </div>
                    
                    <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">6.1 Zone de livraison</h3>
                        <p className="text-gray-600 mb-3">
                        Nos livraisons s'effectuent actuellement dans la zone suivante :
                        </p>
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <div>
                            <h4 className="font-medium text-green-800">Brétigny-sur-Orge et alentours</h4>
                            <p className="text-green-700 text-sm mt-1">
                                Livraison dans un rayon de 15 km autour de Brétigny-sur-Orge (91220)
                            </p>
                            </div>
                        </div>
                        </div>
                        <p className="text-gray-600 text-sm mt-3">
                        Communes desservies : Brétigny-sur-Orge, La Norville, Le Plessis-Pâté, Saint-Germain-lès-Arpajon, 
                        Arpajon, Marolles-en-Hurepoix, Linas, Montlhéry, et autres communes limitrophes.
                        </p>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">6.2 Tarifs de livraison</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-orange-50 border border-orange-200 p-4 rounded">
                            <h4 className="font-medium text-orange-800">Commande inférieure à 50€</h4>
                            <p className="text-orange-700 text-sm mt-1">
                            Frais de livraison : <strong>5,00€</strong>
                            </p>
                        </div>
                        <div className="bg-green-50 border border-green-200 p-4 rounded">
                            <h4 className="font-medium text-green-800">Commande de 50€ et plus</h4>
                            <p className="text-green-700 text-sm mt-1">
                            Livraison <strong>gratuite</strong>
                            </p>
                        </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">6.3 Délais et créneaux</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                            <h4 className="font-medium text-blue-800">Créneaux disponibles</h4>
                            <ul className="text-blue-700 text-sm mt-1 space-y-1">
                            <li>• Matin : 9h - 13h</li>
                            <li>• Après-midi : 14h - 19h</li>
                            </ul>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 p-3 rounded">
                            <h4 className="font-medium text-purple-800">Délais</h4>
                            <ul className="text-purple-700 text-sm mt-1 space-y-1">
                            <li>• Commande avant 15h = livraison J+1</li>
                            <li>• Commande après 15h = livraison J+1</li>
                            </ul>
                        </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">6.4 Modalités de livraison</h3>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>Livraison à l'adresse indiquée lors de la commande</li>
                        <li>Remise en main propre ou à un tiers désigné</li>
                        <li>En cas d'absence, remise au voisin ou dépôt sécurisé selon vos instructions</li>
                        <li>Suivi de livraison par SMS et email</li>
                        </ul>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-2">⚠️ Produits périssables</h4>
                        <p className="text-red-700 text-sm">
                        Les fleurs étant des produits frais et périssables, il est impératif qu'une personne soit présente 
                        à l'adresse de livraison au créneau convenu. En cas d'absence répétée, les frais de re-livraison 
                        seront à votre charge.
                        </p>
                    </div>
                    </div>
                </CardContent>
            </Card>

            {/* Article 7 - Droit de rétractation */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start space-x-3 mb-4">
                  <RotateCcw className="w-6 h-6 text-orange-600 mt-1" />
                  <h2 className="text-2xl font-semibold text-gray-900">Article 7 - Droit de rétractation</h2>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-orange-800">Exclusion du droit de rétractation</h4>
                      <p className="text-orange-700 text-sm mt-1">
                        Conformément à l'article L121-21-8 du Code de la consommation, 
                        <strong> les fleurs fraîches sont exclues du droit de rétractation</strong> en raison de leur caractère périssable.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-gray-600">
                    En raison de la nature périssable des fleurs et compositions florales, 
                    aucun retour ou échange ne pourra être accepté sauf en cas de :
                  </p>
                  
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Erreur de livraison de notre part</li>
                    <li>Produit endommagé lors du transport</li>
                    <li>Non-conformité manifeste du produit livré</li>
                  </ul>
                  
                  <p className="text-gray-600">
                    Dans ces cas, vous disposez de <strong>24 heures</strong> après livraison pour nous signaler 
                    le problème par email avec photos à l'appui.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Article 8 - Garantie et SAV */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 8 - Garanties et service après-vente</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">8.1 Garantie qualité</h3>
                    <p className="text-gray-600 mb-3">
                      Nous garantissons la fraîcheur de nos fleurs et la qualité de nos compositions. 
                      Toutes nos créations sont réalisées par des artisans fleuristes expérimentés.
                    </p>
                    
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800">Nos engagements qualité :</h4>
                      <ul className="list-disc list-inside text-green-700 text-sm mt-2 space-y-1">
                        <li>Fleurs fraîches sélectionnées quotidiennement</li>
                        <li>Respect des commandes et des coloris demandés</li>
                        <li>Emballage soigné pour préserver la fraîcheur</li>
                        <li>Livraison dans les délais convenus</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">8.2 Réclamations</h3>
                    <p className="text-gray-600 mb-3">
                      En cas de non-conformité ou de problème avec votre commande :
                    </p>
                    
                    <ol className="list-decimal list-inside text-gray-600 space-y-1">
                      <li>Contactez-nous dans les <strong>24h suivant la livraison</strong></li>
                      <li>Envoyez un email à <a href="mailto:contact@bellafleurs.fr" className="text-blue-600 hover:underline">contact@bellafleurs.fr</a></li>
                      <li>Joignez des photos du produit concerné</li>
                      <li>Précisez votre numéro de commande</li>
                    </ol>
                    
                    <p className="text-gray-600 mt-3">
                      Nous nous engageons à vous répondre sous 48h et à trouver une solution adaptée 
                      (nouvelle livraison, avoir ou remboursement).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Article 9 - Responsabilité */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 9 - Limitation de responsabilité</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">9.1 Responsabilité de Bella Fleurs</h3>
                    <p className="text-gray-600">
                      Notre responsabilité est limitée à la valeur des produits vendus. 
                      Nous ne pourrons être tenus responsables de dommages indirects tels que :
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 mt-2">
                      <li>Préjudice moral</li>
                      <li>Perte d'exploitation</li>
                      <li>Perte de données</li>
                      <li>Dommages consécutifs à un mauvais usage</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">9.2 Force majeure</h3>
                    <p className="text-gray-600">
                      Bella Fleurs ne peut être tenue responsable de l'inexécution de ses obligations 
                      en cas de force majeure ou de circonstances exceptionnelles (grève, intempéries, pandémie, etc.).
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">9.3 Responsabilité du client</h3>
                    <p className="text-gray-600">
                      Le client s'engage à fournir des informations exactes et à être présent 
                      (ou faire être présent un tiers désigné) à l'adresse de livraison au créneau convenu.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Article 10 - Propriété intellectuelle */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 10 - Propriété intellectuelle</h2>
                <div className="space-y-3">
                  <p className="text-gray-600">
                    L'ensemble des éléments du site bella-fleurs.fr (textes, images, photographies, logos, 
                    graphismes, etc.) sont protégés par les droits d'auteur et de propriété intellectuelle.
                  </p>
                  <p className="text-gray-600">
                    Toute reproduction, représentation, modification, publication, transmission ou dénaturation, 
                    totale ou partielle du site ou de son contenu, par quelque procédé que ce soit, 
                    est interdite sans autorisation écrite préalable de Bella Fleurs.
                  </p>
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                    <p className="text-purple-700 text-sm">
                      <strong>Marque déposée :</strong> "Bella Fleurs" est une marque déposée. 
                      Toute utilisation non autorisée est interdite et passible de poursuites.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Article 11 - Données personnelles */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 11 - Protection des données personnelles</h2>
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, 
                    vos données personnelles sont collectées et traitées pour les besoins de la gestion de votre commande.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                      <h4 className="font-medium text-blue-800">Vos droits</h4>
                      <ul className="text-blue-700 text-sm mt-1 space-y-1">
                        <li>• Droit d'accès</li>
                        <li>• Droit de rectification</li>
                        <li>• Droit d'effacement</li>
                        <li>• Droit d'opposition</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-3 rounded">
                      <h4 className="font-medium text-green-800">Contact</h4>
                      <p className="text-green-700 text-sm mt-1">
                        Pour exercer vos droits :<br />
                        <a href="mailto:contact@bellafleurs.fr" className="underline">contact@bellafleurs.fr</a>
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm">
                    Pour plus d'informations, consultez notre 
                    <a href="/confidentialite" className="text-blue-600 hover:underline ml-1">Politique de confidentialité</a>.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Article 12 - Cookies */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 12 - Cookies</h2>
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Le site utilise des cookies pour améliorer votre expérience de navigation et réaliser des statistiques de visite.
                  </p>
                  
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Types de cookies utilisés :</h4>
                    <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                      <li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site (panier, connexion)</li>
                      <li><strong>Cookies analytiques :</strong> Statistiques de fréquentation (anonymisées)</li>
                      <li><strong>Cookies fonctionnels :</strong> Préférences utilisateur</li>
                    </ul>
                  </div>
                  
                  <p className="text-gray-600 text-sm">
                    Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur ou notre bandeau de consentement.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Article 13 - Médiation et règlement des litiges */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 13 - Médiation et règlement des litiges</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">13.1 Résolution amiable</h3>
                    <p className="text-gray-600">
                      En cas de litige, nous privilégions une résolution amiable. 
                      Contactez notre service client qui s'efforcera de trouver une solution satisfaisante.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">13.2 Médiation de la consommation</h3>
                    <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
                      <p className="text-indigo-800 mb-2">
                        <strong>En cas de litige non résolu, vous pouvez recourir gratuitement à la médiation :</strong>
                      </p>
                      <div className="text-indigo-700 text-sm space-y-1">
                        <p><strong>Médiateur de la consommation :</strong> CNPM - MÉDIATION CONSOMMATION</p>
                        <p><strong>Site internet :</strong> <a href="https://cnpm-mediation-consommation.eu" className="underline">cnpm-mediation-consommation.eu</a></p>
                        <p><strong>Adresse :</strong> 27 avenue de la libération, 42400 Saint-Chamond</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">13.3 Plateforme européenne de résolution des litiges</h3>
                    <p className="text-gray-600">
                      La Commission Européenne a mis en place une plateforme de résolution des litiges accessible à l'adresse : 
                      <a href="https://ec.europa.eu/consumers/odr/" className="text-blue-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                        ec.europa.eu/consumers/odr/
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Article 14 - Droit applicable */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 14 - Droit applicable et juridiction</h2>
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Les présentes conditions générales de vente sont régies par le droit français.
                  </p>
                  <p className="text-gray-600">
                    En cas de litige et à défaut d'accord amiable, les tribunaux français seront seuls compétents, 
                    nonobstant pluralité de défendeurs ou appel en garantie.
                  </p>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-gray-700 text-sm">
                      <strong>Juridiction compétente :</strong> Tribunal de commerce d'Évry-Courcouronnes 
                      ou, à défaut, le tribunal du lieu de domicile du défendeur.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Article 15 - Dispositions diverses */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 15 - Dispositions diverses</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">15.1 Intégralité</h3>
                    <p className="text-gray-600">
                      Les présentes CGV constituent l'intégralité des conditions contractuelles. 
                      Aucune condition générale ou spécifique figurant dans les documents du client ne pourra s'y intégrer.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">15.2 Nullité partielle</h3>
                    <p className="text-gray-600">
                      Si une ou plusieurs stipulations des présentes CGV étaient déclarées nulles, 
                      les autres stipulations conserveraient toute leur force et leur portée.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">15.3 Modification</h3>
                    <p className="text-gray-600">
                      Bella Fleurs se réserve le droit de modifier à tout moment les présentes CGV. 
                      Les conditions applicables sont celles en vigueur au moment de la passation de la commande.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">15.4 Conservation</h3>
                    <p className="text-gray-600">
                      Les présentes CGV sont conservées sur support durable et vous seront communiquées 
                      sur demande pendant la durée d'exécution du contrat.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact et informations */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-green-800 mb-4">Nous contacter</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-green-800 mb-3">Service client</h3>
                    <div className="space-y-2 text-green-700">
                      <p><strong>Email :</strong> <a href="mailto:contact@bellafleurs.fr" className="underline">contact@bellafleurs.fr</a></p>
                      <p><strong>Téléphone :</strong> 07 80 66 27 32</p>
                      <p><strong>Horaires :</strong> Lundi - Vendredi : 9h - 18h</p>
                      <p><strong>Samedi :</strong> 9h - 17h</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-green-800 mb-3">Adresse</h3>
                    <div className="text-green-700">
                      <p>Bella Fleurs</p>
                      <p>91220 Brétigny-sur-Orge</p>
                      <p>France</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-green-300">
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-green-800 font-medium">Livraison rapide</p>
                      <p className="text-green-600 text-sm">24-48h en Île-de-France</p>
                    </div>
                    <div>
                      <p className="text-green-800 font-medium">Fleurs fraîches</p>
                      <p className="text-green-600 text-sm">Sélectionnées quotidiennement</p>
                    </div>
                    <div>
                      <p className="text-green-800 font-medium">Satisfaction garantie</p>
                      <p className="text-green-600 text-sm">Service client réactif</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Footer info */}
          <div className="max-w-4xl mx-auto mt-12 text-center">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-lg font-semibold text-gray-900 mb-2">Conditions Générales de Vente</p>
              <p className="text-sm text-gray-600 mb-1">
                Version 3.2 - Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
              <p className="text-sm text-gray-500">
                En passant commande sur notre site, vous acceptez expressément les présentes conditions générales de vente.
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}