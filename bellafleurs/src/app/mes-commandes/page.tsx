// src/app/mes-commandes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Download,
  AlertCircle
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
  status: 'payée' | 'en_creation' | 'prête' | 'en_livraison' | 'livrée' | 'annulée';
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
  const configs: Record<string, any> = {
    'payée': {
      label: 'Payée - En attente de création',
      color: 'bg-blue-100 text-blue-800',
      icon: CheckCircle,
      description: 'Votre commande a été payée et est en attente de création'
    },
    'en_creation': {
      label: 'En création',
      color: 'bg-purple-100 text-purple-800',
      icon: Clock,
      description: 'Votre bouquet est en cours de création'
    },
    'prête': {
      label: 'Prête',
      color: 'bg-green-100 text-green-800',
      icon: Package,
      description: 'Votre commande est prête pour la livraison'
    },
    'en_livraison': {
      label: 'En livraison',
      color: 'bg-orange-100 text-orange-800',
      icon: Truck,
      description: 'Votre commande est en cours de livraison'
    },
    'livrée': {
      label: 'Livrée',
      color: 'bg-emerald-100 text-emerald-800',
      icon: CheckCircle,
      description: 'Votre commande a été livrée avec succès'
    },
    'annulée': {
      label: 'Annulée',
      color: 'bg-red-100 text-red-800',
      icon: AlertCircle,
      description: 'Votre commande a été annulée'
    }
  };
  
  return configs[status] || {
    label: `Statut inconnu (${status})`,
    color: 'bg-gray-100 text-gray-800',
    icon: AlertCircle,
    description: 'Statut non reconnu'
  };
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

// Composant Timeline - RESPONSIVE APPLIQUÉ
function OrderTimeline({ timeline }: { timeline: Order['timeline'] }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {timeline.map((step, index) => {
        const config = getStatusConfig(step.status);
        const Icon = config.icon;
        
        return (
          <div key={index} className="flex items-start space-x-2 sm:space-x-3">
            <div className={`p-1.5 sm:p-2 rounded-full ${config.color}`}>
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm sm:text-base">{config.label}</p>
              <p className="text-xs sm:text-sm text-gray-600">{formatDate(step.date)}</p>
              {step.note && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{step.note}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Composant Détails de commande - RESPONSIVE APPLIQUÉ
function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div className="border-b pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Commande {order.orderNumber}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Passée le {formatDate(order.createdAt)}
            </p>
          </div>
          <Badge className={`${getStatusConfig(order.status).color} text-xs sm:text-sm w-fit`}>
            {getStatusConfig(order.status).label}
          </Badge>
        </div>
      </div>

      {/* Articles */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Articles commandés</h4>
        <div className="space-y-3 sm:space-y-4">
          {order.items.map((item) => (
            <div key={item._id} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 sm:w-16 sm:h-16 relative flex-shrink-0 rounded-lg overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 48px, 64px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Package className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.name}</h5>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mt-1">
                  <p className="text-xs sm:text-sm text-gray-600">Quantité: {item.quantity}</p>
                  <p className="font-medium text-green-600 text-sm sm:text-base">{item.price.toFixed(2)}€</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Informations de livraison */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Livraison</h4>
        <div className="p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-3">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              {order.deliveryInfo.type === 'delivery' ? (
                <div>
                  <p className="text-sm sm:text-base text-gray-900">Livraison à domicile</p>
                  <p className="text-xs sm:text-sm text-gray-600">{order.deliveryInfo.address?.street}</p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {order.deliveryInfo.address?.zipCode} {order.deliveryInfo.address?.city}
                  </p>
                </div>
              ) : (
                <p className="text-sm sm:text-base text-gray-900">Retrait en magasin</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-600">
              {formatDate(order.deliveryInfo.date)}
            </p>
          </div>
          {order.deliveryInfo.notes && (
            <div className="flex items-start space-x-2 sm:space-x-3">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-gray-600">{order.deliveryInfo.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Informations client */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Informations client</h4>
        <div className="p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-3">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-600 break-all sm:break-normal">{order.customerInfo.name}</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-600">{order.customerInfo.email}</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-600">{order.customerInfo.phone}</p>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="border-t pt-3 sm:pt-4">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900 text-sm sm:text-base">Total</span>
          <span className="font-bold text-green-600 text-base sm:text-lg">
            {order.totalAmount.toFixed(2)}€
          </span>
        </div>
        <div className="mt-2">
          <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'} className="text-xs">
            {order.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
          </Badge>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Suivi de commande</h4>
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
          {/* RESPONSIVE APPLIQUÉ */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-600"></div>
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
        {/* RESPONSIVE APPLIQUÉ */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Header - RESPONSIVE APPLIQUÉ */}
          <div className="mb-6 sm:mb-8">
            <Link href="/mon-compte" className="inline-flex items-center text-green-600 hover:text-green-700 mb-3 sm:mb-4 text-sm sm:text-base">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Retour au compte
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mes Commandes</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Suivez l'état d'avancement de vos commandes
            </p>
          </div>

          {/* Liste des commandes */}
          {orders.length === 0 ? (
            <Card>
              {/* RESPONSIVE APPLIQUÉ */}
              <CardContent className="text-center py-8 sm:py-12">
                <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  Aucune commande
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Vous n'avez pas encore passé de commande.
                </p>
                <Button asChild size="sm">
                  <Link href="/produits">Découvrir nos créations</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* RESPONSIVE APPLIQUÉ */
            <div className="space-y-4 sm:space-y-6">
              {orders.map((order) => {
                const config = getStatusConfig(order.status);
                const Icon = config.icon;
                
                return (
                  <Card key={order._id} className="hover:shadow-md transition-shadow">
                    {/* RESPONSIVE APPLIQUÉ */}
                    <CardHeader className="pb-3 sm:pb-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1">
                          <CardTitle className="text-base sm:text-lg">
                            Commande {order.orderNumber}
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            {formatDate(order.createdAt)} • {order.items.length} article(s)
                          </p>
                        </div>
                        <Badge className={`${config.color} text-xs sm:text-sm w-fit`}>
                          <Icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* RESPONSIVE APPLIQUÉ */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                          <div className="flex -space-x-1 sm:-space-x-2">
                            {order.items.slice(0, 3).map((item, index) => (
                              <div key={item._id} className="w-6 h-6 sm:w-8 sm:h-8 relative border-2 border-white rounded-full overflow-hidden flex-shrink-0">
                                {item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 24px, 32px"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <Package className="w-2 h-2 sm:w-3 sm:h-3 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 border-2 border-white rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">+{order.items.length - 3}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                            <span className="font-bold text-green-600 text-sm sm:text-base">
                              {order.totalAmount.toFixed(2)}€
                            </span>
                            <span className="text-xs sm:text-sm text-gray-600">
                              {order.deliveryInfo.type === 'delivery' ? 'Livraison' : 'Retrait'} • 
                              {' '}{new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-xs sm:text-sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Détails</span>
                                <span className="sm:hidden">Voir</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-base sm:text-lg">
                                  Détails de la commande
                                </DialogTitle>
                              </DialogHeader>
                              {selectedOrder && <OrderDetails order={selectedOrder} />}
                            </DialogContent>
                          </Dialog>
                          
                          {order.status === 'livrée' && (
                            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Facture</span>
                              <span className="sm:hidden">PDF</span>
                            </Button>
                          )}
                        </div>
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