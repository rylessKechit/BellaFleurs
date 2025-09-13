// src/app/mes-commandes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Euro,
  ArrowLeft,
  Eye,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { toast } from 'sonner';

// Types
interface OrderItem {
  _id: string;
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'validé' | 'en_cours_creation' | 'prête' | 'en_livraison' | 'livré';
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliveryInfo: {
    type: 'delivery' | 'pickup';
    address?: {
      street: string;
      city: string;
      zipCode: string;
    };
    date: string;
    notes?: string;
  };
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  timeline: {
    status: Order['status'];
    date: string;
    note?: string;
  }[];
  createdAt: string;
  estimatedDelivery?: string;
}

const getStatusConfig = (status: Order['status']) => {
  const configs = {
    'validé': {
      label: 'Validée',
      color: 'bg-blue-100 text-blue-800',
      icon: CheckCircle,
      description: 'Votre commande a été confirmée'
    },
    'en_cours_creation': {
      label: 'En création',
      color: 'bg-purple-100 text-purple-800',
      icon: Clock,
      description: 'Votre bouquet est en cours de création'
    },
    'prête': {
      label: 'Prête',
      color: 'bg-green-100 text-green-800',
      icon: Package,
      description: 'Votre commande est prête'
    },
    'en_livraison': {
      label: 'En livraison',
      color: 'bg-orange-100 text-orange-800',
      icon: Truck,
      description: 'Votre commande est en cours de livraison'
    },
    'livré': {
      label: 'Livrée',
      color: 'bg-emerald-100 text-emerald-800',
      icon: CheckCircle,
      description: 'Votre commande a été livrée'
    }
  };
  return configs[status];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Composant Timeline
function OrderTimeline({ timeline }: { timeline: Order['timeline'] }) {
  return (
    <div className="space-y-4">
      {timeline.map((step, index) => {
        const config = getStatusConfig(step.status);
        const Icon = config.icon;
        
        return (
          <div key={index} className="flex items-start space-x-3">
            <div className={`p-2 rounded-full ${config.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{config.label}</p>
              <p className="text-sm text-gray-600">{formatDate(step.date)}</p>
              {step.note && (
                <p className="text-sm text-gray-500 mt-1">{step.note}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Composant Détails de commande
function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="border-b pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Commande {order.orderNumber}
            </h3>
            <p className="text-sm text-gray-600">
              Passée le {formatDate(order.createdAt)}
            </p>
          </div>
          <Badge className={getStatusConfig(order.status).color}>
            {getStatusConfig(order.status).label}
          </Badge>
        </div>
      </div>

      {/* Articles */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Articles commandés</h4>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{item.name}</h5>
                <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
              </div>
              <p className="font-medium text-gray-900">
                {(item.price * item.quantity).toFixed(2)}€
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Informations de livraison */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Informations de livraison</h4>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
          </div>
          
          {order.deliveryInfo.type === 'delivery' && order.deliveryInfo.address && (
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
              <div className="text-sm">
                <p>{order.deliveryInfo.address.street}</p>
                <p>{order.deliveryInfo.address.zipCode} {order.deliveryInfo.address.city}</p>
              </div>
            </div>
          )}
          
          {order.deliveryInfo.type === 'pickup' && (
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Retrait en boutique</span>
            </div>
          )}
          
          {order.deliveryInfo.notes && (
            <div className="text-sm text-gray-600">
              <strong>Note:</strong> {order.deliveryInfo.notes}
            </div>
          )}
        </div>
      </div>

      {/* Récapitulatif */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Récapitulatif</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center font-medium text-lg">
            <span>Total</span>
            <span>{order.totalAmount.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
            <span>Statut paiement</span>
            <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
              {order.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Suivi de commande</h4>
        <OrderTimeline timeline={order.timeline} />
      </div>
    </div>
  );
}

export default function MesCommandesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/user/orders', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data.orders || []);
      } else {
        throw new Error('Erreur lors du chargement des commandes');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger vos commandes');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <ProtectedRoute requireAuth>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <Link href="/mon-compte" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au compte
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Mes Commandes</h1>
            <p className="text-gray-600 mt-2">
              Suivez l'état d'avancement de vos commandes
            </p>
          </div>

          {/* Liste des commandes */}
          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune commande
                </h3>
                <p className="text-gray-600 mb-6">
                  Vous n'avez pas encore passé de commande.
                </p>
                <Button asChild>
                  <Link href="/produits">Découvrir nos créations</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const config = getStatusConfig(order.status);
                const Icon = config.icon;
                
                return (
                  <Card key={order._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Commande {order.orderNumber}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDate(order.createdAt)} • {order.items.length} article(s)
                          </p>
                        </div>
                        <Badge className={config.color}>
                          <Icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 3).map((item, index) => (
                              <img
                                key={item._id}
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                                style={{ zIndex: 3 - index }}
                              />
                            ))}
                            {order.items.length > 3 && (
                              <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {order.totalAmount.toFixed(2)}€
                            </p>
                            <p className="text-sm text-gray-600">
                              {config.description}
                            </p>
                          </div>
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              Détails
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Détails de la commande</DialogTitle>
                            </DialogHeader>
                            <OrderDetails order={order} />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}