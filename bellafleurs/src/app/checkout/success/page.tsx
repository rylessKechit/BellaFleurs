'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Package, Clock, ArrowRight, Home } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  customerInfo: {
    name: string;
    email: string;
  };
  deliveryInfo: {
    date: string;
    address?: {
      street: string;
      city: string;
      zipCode: string;
    };
  };
  createdAt: string;
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Récupérer les informations de la commande
  useEffect(() => {
    const fetchOrderInfo = async () => {
      if (!paymentIntentId) {
        setIsLoading(false);
        return;
      }

      try {
        // Attendre un peu plus longtemps si c'est un retry
        const delay = retryCount * 2000;
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const response = await fetch(`/api/orders/by-payment-intent/${paymentIntentId}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json();
          setOrder(result.data.order);
          setIsLoading(false);
        } else if (retryCount < 3) {
          // Retry jusqu'à 3 fois si la commande n'est pas encore créée
          console.log(`Retry ${retryCount + 1}/3 pour trouver la commande...`);
          setRetryCount(prev => prev + 1);
        } else {
          console.warn('Commande non trouvée après 3 tentatives');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erreur récupération commande:', error);
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
        } else {
          setIsLoading(false);
        }
      }
    };

    fetchOrderInfo();
  }, [paymentIntentId, retryCount]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Message de succès principal */}
          <div className="max-w-2xl mx-auto text-center mb-8">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Paiement réussi !
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              Votre commande a été confirmée et va être traitée dans les plus brefs délais.
            </p>
          </div>

          {/* Informations de commande */}
          {isLoading ? (
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
                <p className="text-gray-600">
                  {retryCount > 0 ? `Recherche de votre commande... (${retryCount}/3)` : 'Chargement des détails...'}
                </p>
              </div>
            </div>
          ) : order ? (
            <Card className="max-w-2xl mx-auto mb-8">
              <CardHeader>
                <CardTitle>Détails de votre commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Numéro de commande :</span>
                  <span className="font-medium">{order.orderNumber}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant total :</span>
                  <span className="font-medium text-green-600">
                    {order.totalAmount.toFixed(2)}€
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut :</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {order.status}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Date de livraison :</span>
                  <span className="font-medium">
                    {new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                
                {order.deliveryInfo.address && (
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Adresse :</span>
                    <div className="text-right text-sm">
                      <div>{order.deliveryInfo.address.street}</div>
                      <div>{order.deliveryInfo.address.zipCode} {order.deliveryInfo.address.city}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-2xl mx-auto mb-8">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800 mb-1">
                      Commande en cours de traitement
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Votre paiement a été confirmé. Votre commande est en cours de création 
                      et vous recevrez un email de confirmation dans quelques instants.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prochaines étapes */}
          <Card className="max-w-2xl mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Prochaines étapes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-green-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Confirmation par email</h3>
                    <p className="text-sm text-gray-600">
                      Vous allez recevoir un email de confirmation avec tous les détails.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Création de votre bouquet</h3>
                    <p className="text-sm text-gray-600">
                      Nos fleuristes vont commencer la création de votre commande.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-purple-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Préparation pour livraison</h3>
                    <p className="text-sm text-gray-600">
                      Une fois prête, votre commande sera préparée pour la livraison.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => router.push('/mes-commandes')}
                className="flex items-center"
              >
                Suivre ma commande
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="flex items-center"
              >
                <Home className="mr-2 w-4 h-4" />
                Retour à l'accueil
              </Button>
            </div>
          </div>

          {/* Contact */}
          <div className="max-w-2xl mx-auto mt-12 text-center text-sm text-gray-500">
            <p>
              Une question ? Contactez-nous au{' '}
              <a href="tel:+33123456789" className="text-green-600 hover:underline">
                01 23 45 67 89
              </a>
              {' '}ou par email à{' '}
              <a href="mailto:contact@bellafleurs.fr" className="text-green-600 hover:underline">
                contact@bellafleurs.fr
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}