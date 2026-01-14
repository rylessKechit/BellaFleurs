// src/app/corporate/orders/page.tsx - Liste complète des commandes corporate
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Calendar,
  DollarSign,
  Eye,
  Filter,
  Search,
  Download
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  deliveryInfo: {
    type: 'delivery' | 'pickup';
    date: string;
    address?: {
      street: string;
      city: string;
      zipCode: string;
    };
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function CorporateOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      const user = session.user as any;
      if (user.accountType !== 'corporate') {
        router.push('/mon-compte');
      } else {
        fetchOrders();
      }
    }
  }, [status, session, page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/orders?${queryParams}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des commandes');
      }

      const data = await response.json();
      if (data.success) {
        // Filtrer les commandes corporate uniquement
        const corporateOrders = data.data.orders.filter((order: any) =>
          order.paymentMethod === 'corporate_monthly'
        );
        setOrders(corporateOrders);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      payée: { className: 'bg-green-100 text-green-800', label: 'Payée' },
      en_creation: { className: 'bg-blue-100 text-blue-800', label: 'En création' },
      prête: { className: 'bg-purple-100 text-purple-800', label: 'Prête' },
      en_livraison: { className: 'bg-yellow-100 text-yellow-800', label: 'En livraison' },
      livrée: { className: 'bg-gray-100 text-gray-800', label: 'Livrée' }
    };
    const variant = variants[status] || { className: 'bg-gray-100 text-gray-600', label: status };
    return (
      <Badge className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      pending_monthly: { className: 'bg-blue-100 text-blue-800', label: 'Facturation mensuelle' },
      paid: { className: 'bg-green-100 text-green-800', label: 'Payée' },
      pending: { className: 'bg-yellow-100 text-yellow-800', label: 'En attente' }
    };
    const variant = variants[status] || { className: 'bg-gray-100 text-gray-600', label: status };
    return (
      <Badge className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Package className="w-8 h-8 text-blue-600" />
                  Mes commandes
                </h1>
                <p className="text-gray-600 mt-1">
                  Historique complet de vos commandes corporate
                </p>
              </div>
              <Link href="/corporate/dashboard">
                <Button variant="outline">
                  Retour au dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total commandes</p>
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Montant total</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ce mois-ci</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {orders.filter(order => {
                        const orderDate = new Date(order.createdAt);
                        const now = new Date();
                        return orderDate.getMonth() === now.getMonth() &&
                               orderDate.getFullYear() === now.getFullYear();
                      }).length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres et recherche */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par numéro de commande..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Statut:</span>
                  <div className="flex gap-2">
                    {['all', 'payée', 'en_creation', 'prête', 'en_livraison', 'livrée'].map((filter) => (
                      <Button
                        key={filter}
                        variant={statusFilter === filter ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setStatusFilter(filter);
                          setPage(1);
                        }}
                      >
                        {filter === 'all' ? 'Toutes' : filter.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des commandes */}
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune commande
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Aucune commande ne correspond à votre recherche' : 'Vos commandes apparaîtront ici'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-lg font-bold text-gray-900">
                            {order.orderNumber}
                          </h3>
                          {getStatusBadge(order.status)}
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Date:</span>{' '}
                            {formatDate(order.createdAt)}
                          </div>
                          <div>
                            <span className="font-medium">Articles:</span>{' '}
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                          </div>
                          <div>
                            <span className="font-medium">Livraison:</span>{' '}
                            {formatDate(order.deliveryInfo.date)}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span>{' '}
                            {order.deliveryInfo.type === 'delivery' ? 'Livraison' : 'Retrait'}
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="text-sm text-gray-600">Total:</span>{' '}
                          <span className="font-bold text-lg text-green-600">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link href={`/corporate/orders/${order._id}?success=true`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Voir
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Précédent
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {page} sur {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
