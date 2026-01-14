// src/app/corporate/orders/[orderId]/page.tsx - Page succès commande corporate
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Package,
  Building2,
  CreditCard,
  Clock,
  ArrowLeft,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  totalAmount: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
  deliveryInfo: {
    type: 'delivery' | 'pickup';
    address?: {
      street: string;
      city: string;
      zipCode: string;
    };
    date: string;
    timeSlot?: string;
    notes?: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  corporateData?: {
    companyName: string;
    monthlyLimit: number;
    paymentTerm: string;
  };
  createdAt: string;
  estimatedDelivery?: string;
}

export default function CorporateOrderSuccessPage({
  params
}: {
  params: { orderId: string }
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  useEffect(() => {
    if (success === 'true') {
      fetchOrder();
    } else {
      setError('Commande non confirmée');
      setIsLoading(false);
    }
  }, [params.orderId, success]);

  const fetchOrder = async () => {
    try {
      // ✅ CORRECTION: Utiliser /api/orders/[id] au lieu de /api/orders/[orderId]
      const response = await fetch(`/api/orders/${params.orderId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Commande introuvable');
      }

      const data = await response.json();
      if (data.success && data.data?.order) {
        setOrder(data.data.order);
      } else {
        throw new Error('Données de commande invalides');
      }
    } catch (error: any) {
      console.error('Erreur chargement commande:', error);
      setError(error.message || 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de votre commande...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center pt-16">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Commande introuvable</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/">
              <Button className="bg-green-600 hover:bg-green-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header succès */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Commande confirmée !
          </h1>
          <p className="text-gray-600 mb-2">
            Votre commande corporate <strong>#{order.orderNumber}</strong> a été enregistrée avec succès.
          </p>
          {order.corporateData && (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Building2 className="w-4 h-4" />
              <span className="font-medium">{order.corporateData.companyName}</span>
            </div>
          )}
        </div>

        {/* Informations corporate */}
        {order.corporateData && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Building2 className="w-5 h-5" />
                Commande Corporate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Mode de paiement</p>
                  <p className="text-blue-800">
                    {order.corporateData.paymentTerm === 'monthly' ? 'Facturation mensuelle' : 'Paiement immédiat'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Limite mensuelle</p>
                  <p className="text-blue-800">{formatCurrency(order.corporateData.monthlyLimit)}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Statut</p>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    En attente de traitement
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Détails de la commande */}
          <div className="lg:col-span-2 space-y-6">
            {/* Articles commandés */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Articles commandés ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div className="flex items-center space-x-4">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(item.price)} / unité</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-4 border-t font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations livraison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {order.deliveryInfo.type === 'delivery' ? (
                    <>
                      <MapPin className="w-5 h-5" />
                      Livraison
                    </>
                  ) : (
                    <>
                      <Package className="w-5 h-5" />
                      Retrait en magasin
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">Date prévue</p>
                    <p className="text-gray-600">{formatDate(order.deliveryInfo.date)}</p>
                    {order.deliveryInfo.timeSlot && (
                      <p className="text-sm text-gray-500">Créneau: {order.deliveryInfo.timeSlot}</p>
                    )}
                  </div>
                </div>

                {order.deliveryInfo.type === 'delivery' && order.deliveryInfo.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                    <div>
                      <p className="font-medium">Adresse de livraison</p>
                      <p className="text-gray-600">
                        {order.deliveryInfo.address.street}<br />
                        {order.deliveryInfo.address.zipCode} {order.deliveryInfo.address.city}
                      </p>
                    </div>
                  </div>
                )}

                {order.deliveryInfo.notes && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium text-gray-700 mb-1">Notes de livraison</p>
                    <p className="text-sm text-gray-600">{order.deliveryInfo.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations client */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Informations de contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{order.customerInfo.name}</p>
                  {order.customerInfo.company && (
                    <p className="text-sm text-blue-600">{order.customerInfo.company}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{order.customerInfo.email}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{order.customerInfo.phone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Informations paiement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Paiement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Méthode</span>
                    <span className="font-medium">
                      {order.paymentMethod === 'corporate_monthly' ? 'Facturation mensuelle' : 'Autre'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut</span>
                    <Badge 
                      variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}
                      className={order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                    >
                      {order.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Link href="/corporate/dashboard">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Building2 className="w-4 h-4 mr-2" />
                  Tableau de bord corporate
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continuer mes achats
                </Button>
              </Link>
            </div>

            {/* Note informative */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 text-blue-600" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 mb-1">Prochaines étapes</p>
                    <p className="text-blue-700">
                      Votre commande sera traitée par notre équipe. Vous recevrez un email de confirmation 
                      et des mises à jour sur le statut de votre commande.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer d'aide */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">
            Une question concernant votre commande ?
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <Link href="/contact">
              <Button variant="outline" size="sm">
                Nous contacter
              </Button>
            </Link>
            <span className="text-gray-400 hidden sm:block">•</span>
            <Link href="/corporate/help">
              <Button variant="outline" size="sm">
                Aide corporate
              </Button>
            </Link>
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
}