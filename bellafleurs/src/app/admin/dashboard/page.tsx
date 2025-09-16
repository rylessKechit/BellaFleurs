// src/app/admin/dashboard/page.tsx - Version corrigée
'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  Euro, 
  ShoppingCart,
  AlertCircle,
  Calendar,
  Eye,
  Edit,
  Truck,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';

// Types
interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: 'payée' | 'en_creation' | 'prête' | 'en_livraison' | 'livrée';
  createdAt: string;
  itemsCount: number;
}

interface TopProduct {
  _id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  image: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer toutes les données en parallèle
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats', { credentials: 'include' }),
        fetch('/api/admin/dashboard/recent-orders', { credentials: 'include' }),
        fetch('/api/admin/dashboard/top-products', { credentials: 'include' })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setRecentOrders(ordersData.data || []);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setTopProducts(productsData.data || []);
      }

    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
    toast.success('Données actualisées');
  };

  const getStatusBadge = (status: string) => {
    const config = {
      'payée': { label: 'Payée', className: 'bg-blue-100 text-blue-800' },
      'en_creation': { label: 'En création', className: 'bg-orange-100 text-orange-800' },
      'prête': { label: 'Prête', className: 'bg-green-100 text-green-800' },
      'en_livraison': { label: 'En livraison', className: 'bg-purple-100 text-purple-800' },
      'livrée': { label: 'Livrée', className: 'bg-emerald-100 text-emerald-800' }
    };

    const statusConfig = config[status as keyof typeof config] || {
      label: status,
      className: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={`${statusConfig.className} text-xs`}>
        {statusConfig.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        
        {/* Header - RESPONSIVE APPLIQUÉ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Vue d'ensemble de votre activité
            </p>
          </div>
          <Button onClick={refreshData} disabled={isRefreshing} size="sm" className="self-start sm:self-auto">
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {/* Statistiques principales - RESPONSIVE APPLIQUÉ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {stats?.totalRevenue.toLocaleString()}€
                  </p>
                </div>
                <Euro className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              {stats?.revenueGrowth && (
                <div className="mt-2 flex items-center text-xs sm:text-sm">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" />
                  <span className="text-green-600">+{stats.revenueGrowth}%</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Commandes</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats?.totalOrders}</p>
                </div>
                <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              {stats?.ordersGrowth && (
                <div className="mt-2 flex items-center text-xs sm:text-sm">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" />
                  <span className="text-green-600">+{stats.ordersGrowth}%</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Clients</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats?.totalCustomers}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
              {stats?.customersGrowth && (
                <div className="mt-2 flex items-center text-xs sm:text-sm">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" />
                  <span className="text-green-600">+{stats.customersGrowth}%</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Créations</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats?.totalProducts}</p>
                </div>
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              </div>
              {stats?.productsGrowth && (
                <div className="mt-2 flex items-center text-xs sm:text-sm">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" />
                  <span className="text-green-600">+{stats.productsGrowth}%</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal - RESPONSIVE APPLIQUÉ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Commandes récentes */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="text-lg sm:text-xl">Commandes récentes</CardTitle>
                <Button variant="outline" size="sm" asChild className="self-start sm:self-auto">
                  <a href="/admin/commandes" className="text-xs sm:text-sm">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Voir tout
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <ShoppingCart className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                  <p className="text-sm sm:text-base">Aucune commande récente</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-2 sm:gap-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <p className="font-medium text-sm sm:text-base truncate">{order.orderNumber}</p>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right sm:ml-4">
                        <p className="font-bold text-green-600 text-sm sm:text-base">{order.totalAmount.toFixed(2)}€</p>
                        <p className="text-xs text-gray-500">{order.itemsCount} article{order.itemsCount > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top produits */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">Meilleures créations</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Package className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                  <p className="text-sm sm:text-base">Aucune création disponible</p>
                  <Button size="sm" className="mt-3 sm:mt-4" asChild>
                    <a href="/admin/produits">
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Créer un produit
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {topProducts.map((product) => (
                    <div key={product._id} className="flex items-center space-x-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate">{product.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-medium">{product.sales} ventes</p>
                        <p className="text-xs text-gray-500">{product.revenue}€</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides - RESPONSIVE APPLIQUÉ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Button className="h-16 sm:h-20 flex flex-col space-y-1 sm:space-y-2 text-xs sm:text-sm" asChild>
                <a href="/admin/produits">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span>Nouvelle création</span>
                </a>
              </Button>
              <Button variant="outline" className="h-16 sm:h-20 flex flex-col space-y-1 sm:space-y-2 text-xs sm:text-sm" asChild>
                <a href="/admin/commandes">
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span>Voir commandes</span>
                </a>
              </Button>
              <Button variant="outline" className="h-16 sm:h-20 flex flex-col space-y-1 sm:space-y-2 text-xs sm:text-sm" asChild>
                <a href="/admin/clients">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span>Gestion clients</span>
                </a>
              </Button>
              <Button variant="outline" className="h-16 sm:h-20 flex flex-col space-y-1 sm:space-y-2 text-xs sm:text-sm" onClick={refreshData}>
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
                <span>Actualiser données</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Message d'information - RESPONSIVE APPLIQUÉ */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 text-sm sm:text-base">Bienvenue dans votre espace administrateur</h3>
                <p className="text-xs sm:text-sm text-blue-700 mt-1">
                  Gérez vos créations florales, suivez vos commandes et développez votre activité à Brétigny-sur-Orge et alentours. 
                  Chaque création est unique et faite à la demande pour vos clients.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}