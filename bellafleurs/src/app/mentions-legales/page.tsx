// src/app/mentions-legales/page.tsx
'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';

export default function MentionsLegalesPage() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* En-tête */}
          <div className="max-w-4xl mx-auto mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Mentions légales</h1>
            <p className="text-lg text-gray-600">
              Informations légales relatives à l'utilisation du site Bella Fleurs
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">

            {/* 1. Éditeur du site */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Éditeur du site</h2>
                <div className="space-y-2">
                  <p><strong>Raison sociale :</strong> Bella Fleurs</p>
                  <p><strong>Statut juridique :</strong> Entreprise individuelle</p>
                  <p><strong>Adresse :</strong>91220 Brétigny-sur-Orge, France</p>
                  <p><strong>Téléphone :</strong> 07 80 66 27 32</p>
                  <p><strong>Email :</strong> contact@bellafleurs.fr</p>
                </div>
              </CardContent>
            </Card>

            {/* 3. Propriété intellectuelle */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Propriété intellectuelle</h2>
                <div className="space-y-3">
                  <p>
                    L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
                    Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                  </p>
                  <p>
                    La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite 
                    sauf autorisation expresse du directeur de la publication.
                  </p>
                  <p>
                    Les marques citées sur ce site sont déposées par les sociétés qui en sont propriétaires.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 4. Données personnelles */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Données personnelles</h2>
                <div className="space-y-3">
                  <p>
                    Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), 
                    vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition au traitement de vos données personnelles.
                  </p>
                  <p>
                    Pour exercer ces droits, vous pouvez nous contacter à l'adresse : 
                    <a href="mailto:contact@bellafleurs.fr" className="text-blue-600 hover:underline ml-1">contact@bellafleurs.fr</a>
                  </p>
                  <p>
                    Les informations recueillies font l'objet d'un traitement informatique destiné à la gestion de votre commande et à l'amélioration de nos services.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 5. Cookies */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies</h2>
                <div className="space-y-3">
                  <p>
                    Le site utilise des cookies pour améliorer l'expérience utilisateur, réaliser des statistiques de visites et vous proposer 
                    des publicités adaptées à vos centres d'intérêts.
                  </p>
                  <p>
                    Vous pouvez vous opposer à l'enregistrement de cookies en configurant votre navigateur. 
                    Cependant, votre expérience utilisateur risque d'être dégradée.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 6. Responsabilité */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation de responsabilité</h2>
                <div className="space-y-3">
                  <p>
                    Les informations contenues sur ce site sont aussi précises que possible et le site est périodiquement remis à jour, 
                    mais peut toutefois contenir des inexactitudes, des omissions ou des lacunes.
                  </p>
                  <p>
                    Si vous constatez une lacune, erreur ou ce qui paraît être un dysfonctionnement, merci de bien vouloir le signaler par email à 
                    <a href="mailto:contact@bellafleurs.fr" className="text-blue-600 hover:underline ml-1">contact@bellafleurs.fr</a> 
                    en décrivant le problème de la manière la plus précise possible.
                  </p>
                  <p>
                    Bella Fleurs ne pourra en aucune circonstance être tenue responsable de tout dommage de quelque nature qu'il soit 
                    résultant de l'interprétation ou de l'utilisation des informations et/ou documents disponibles sur ce site.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 7. Droit applicable */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Droit applicable et juridiction</h2>
                <div className="space-y-3">
                  <p>
                    Les présentes mentions légales sont régies par le droit français.
                  </p>
                  <p>
                    En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 8. Contact */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-green-800 mb-4">8. Nous contacter</h2>
                <div className="space-y-2 text-green-700">
                  <p>Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter :</p>
                  <p><strong>Par email :</strong> <a href="mailto:contact@bellafleurs.fr" className="text-green-600 hover:underline">contact@bellafleurs.fr</a></p>
                  <p><strong>Par téléphone :</strong> 07 80 66 27 32</p>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Footer info */}
          <div className="max-w-4xl mx-auto mt-12 text-center">
            <p className="text-sm text-gray-500">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}