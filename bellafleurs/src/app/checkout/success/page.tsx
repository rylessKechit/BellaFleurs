// src/app/checkout/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, Calendar, MapPin, Mail, Phone, Download, Share2, ArrowRight, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface OrderDetails {
  orderNumber: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  deliveryInfo: {
    type: 'delivery' | 'pickup';
    date: string;
    timeSlot: string;
    address?: string;
  };
  totalAmount: number;
  status: string;
  estimatedDelivery: string;
}

// Mock order data
const mockOrderDetails: OrderDetails = {
  orderNumber: 'BF-20241215-0001',
  customerInfo: {
    name: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    phone: '01 23 45 67 89'
  },
  items: [
    { name: 'Bouquet Romantique Éternel', quantity: 1, price: 45.90 },
    { name: 'Composition Zen Moderne', quantity: 1, price: 65.00 }
  ],
  deliveryInfo: {
    type: 'delivery',
    date: '2024-12-16',
    timeSlot: '14h-17h',
    address: '123 Rue de la Paix, 75001 Paris'
  },
  totalAmount: 110.90,
  status: 'confirmed',
  estimatedDelivery: '16 décembre 2024 entre 14h et 17h'
};

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);

  const orderNumber = searchParams.get('order');

  useEffect(() => {
    if (!orderNumber) {
      router.push('/');
      return;
    }

    // Simulation du chargement des détails de commande
    setTimeout(() => {
      setOrderDetails(mockOrderDetails);
      setIsLoading(false);
      setShowAnimation(true);
    }, 1000);
  }, [orderNumber, router]);

  const downloadInvoice = () => {
    // Simulation du téléchargement de facture
    console.log('Téléchargement de la facture...');
  };

  const shareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: `Commande ${orderDetails?.orderNumber} - Bella Fleurs`,
        text: 'Ma commande de fleurs chez Bella Fleurs',
        url: window.location.href,
      });
    } else {
      // Fallback pour copier le lien
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Confirmation de votre commande...</p>
          </div>
        </main>
      </>
    );
  }

  if (!orderDetails) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Commande introuvable</h1>
            <Button onClick={() => router.push('/')}>Retour à l'accueil</Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* Animation de succès */}
          <div className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 ${
              showAnimation ? 'animate-bounce' : ''
            }`}>
              <Check className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Commande confirmée ! 🎉
            </h1>
            
            <p className="text-xl text-gray-600 mb-2">
              Merci {orderDetails.customerInfo.name} pour votre confiance
            </p>
            
            <div className="inline-flex items-center bg-white px-6 py-3 rounded-full shadow-md">
              <span className="text-sm text-gray-600 mr-2">Numéro de commande :</span>
              <Badge className="bg-green-100 text-green-800 font-mono">
                {orderDetails.orderNumber}
              </Badge>
            </div>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Informations principales */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Détails de livraison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {orderDetails.deliveryInfo.type === 'delivery' ? (
                      <MapPin className="w-5 h-5 mr-2 text-green-600" />
                    ) : (
                      <Calendar className="w-5 h-5 mr-2 text-green-600" />
                    )}
                    {orderDetails.deliveryInfo.type === 'delivery' ? 'Livraison' : 'Retrait'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-4 h-4 text-green-600 mr-2" />
                        <span className="font-medium text-green-800">
                          {orderDetails.estimatedDelivery}
                        </span>
                      </div>
                      {orderDetails.deliveryInfo.type === 'delivery' && (
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                          <span className="text-green-700 text-sm">
                            {orderDetails.deliveryInfo.address}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">Préparation</div>
                        <div className="text-gray-600">2-4h</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">
                          {orderDetails.deliveryInfo.type === 'delivery' ? 'Transport' : 'Disponible'}
                        </div>
                        <div className="text-gray-600">
                          {orderDetails.deliveryInfo.type === 'delivery' ? '24-48h' : 'Dès demain'}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="font-medium text-green-800">
                          {orderDetails.deliveryInfo.type === 'delivery' ? 'Livraison' : 'Retrait'}
                        </div>
                        <div className="text-green-600">{orderDetails.deliveryInfo.timeSlot}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Articles commandés */}
              <Card>
                <CardHeader>
                  <CardTitle>Votre commande</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">🌸</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">Quantité : {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-lg font-medium text-gray-900">
                          {(item.price * item.quantity).toFixed(2)}€
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total</span>
                        <span className="text-green-600">{orderDetails.totalAmount.toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Que se passe-t-il maintenant ? */}
              <Card>
                <CardHeader>
                  <CardTitle>Que se passe-t-il maintenant ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        step: 1,
                        title: 'Confirmation reçue',
                        description: 'Nous avons bien reçu votre commande et votre paiement',
                        status: 'completed',
                        time: 'Maintenant'
                      },
                      {
                        step: 2,
                        title: 'Préparation en cours',
                        description: 'Notre fleuriste sélectionne et prépare vos fleurs avec soin',
                        status: 'current',
                        time: 'Dans 2-4h'
                      },
                      {
                        step: 3,
                        title: orderDetails.deliveryInfo.type === 'delivery' ? 'Livraison' : 'Prêt au retrait',
                        description: orderDetails.deliveryInfo.type === 'delivery' 
                          ? 'Vos fleurs sont en route vers votre adresse'
                          : 'Vos fleurs vous attendent en boutique',
                        status: 'upcoming',
                        time: orderDetails.deliveryInfo.timeSlot
                      }
                    ].map((step) => (
                      <div key={step.step} className="flex items-start space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step.status === 'completed' 
                            ? 'bg-green-100 text-green-600' 
                            : step.status === 'current'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {step.status === 'completed' ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            step.step
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${
                              step.status === 'current' ? 'text-blue-600' : 'text-gray-900'
                            }`}>
                              {step.title}
                            </h4>
                            <span className="text-sm text-gray-500">{step.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar actions */}
            <div className="space-y-6">
              
              {/* Informations de contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Vos informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">{orderDetails.customerInfo.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">{orderDetails.customerInfo.phone}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={downloadInvoice} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger la facture
                  </Button>
                  
                  <Button onClick={shareOrder} variant="outline" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Partager la commande
                  </Button>
                  
                  <Button asChild className="w-full">
                    <a href={`/commande/${orderDetails.orderNumber}`}>
                      Suivre ma commande
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Support */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-green-800 mb-2">Besoin d'aide ?</h3>
                  <p className="text-sm text-green-700 mb-4">
                    Notre équipe est là pour vous accompagner
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center text-green-700">
                      <Phone className="w-4 h-4 mr-2" />
                      01 23 45 67 89
                    </div>
                    <div className="flex items-center justify-center text-green-700">
                      <Mail className="w-4 h-4 mr-2" />
                      contact@bellafleurs.fr
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA pour continuer les achats */}
          <div className="text-center mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Envie de découvrir d'autres créations ?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/produits">
                  Voir nos créations
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/abonnement">
                  Découvrir l'abonnement
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}