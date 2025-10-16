// src/app/admin/dashboard/page.tsx - Version avec vraies données
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
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';

// Types mis à jour
interface DashboardStats {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    pendingOrders: number;
    paidOrders: number;
    averageOrderValue: number;
  };
  trends: {
    ordersLast30Days: number;
    revenueLast30Days: number;
    newUsersLast30Days: number;
    orderGrowth: number;
    revenueGrowth: number;
    customerGrowth: number;
  };
  charts: {
    topProducts: RealTopProduct[];
    categoryStats: CategoryStat[];
  };
}

interface RealTopProduct {
  _id: string;
  name: string;
  category: string;
  sales: number;  // Vraies ventes
  revenue: number; // Vrai chiffre d'affaires
  image?: string;
  price?: number;
  hasVariants?: boolean;
}

interface CategoryStat {
  category: string;
  sales: number;
  revenue: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  customerInfo: {
    name: string;
    email: string;
  };
  totalAmount: number;
  status: 'payée' | 'en_creation' | 'prête' | 'en_livraison' | 'livrée' | 'annulée';
  createdAt: string;
  items: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/stats', { credentials: 'include' }),
        fetch('/api/admin/orders?limit=5&page=1', { credentials: 'include' })
      ]);

      // Récupération des vraies statistiques
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success && statsData.data.stats) {
          setStats(statsData.data.stats);
        }
      } else {
        toast.error('Erreur lors du chargement des statistiques');
      }

      // Récupération des commandes récentes
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.success && ordersData.data.orders) {
          setRecentOrders(ordersData.data.orders.slice(0, 5));
        }
      }

    } catch (error) {
      console.error('❌ Erreur dashboard:', error);
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

  // Helper pour formater les montants
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Helper pour formater les pourcentages de croissance
  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center ${colorClass}`}>
        <Icon className="w-4 h-4 mr-1" />
        <span className="text-sm font-medium">
          {isPositive ? '+' : ''}{growth.toFixed(1)}%
        </span>
      </div>
    );
  };

  // Helper pour le statut des commandes
  const getStatusBadge = (status: string) => {
    const statusMap = {
      'payée': { label: 'Payée', color: 'bg-green-100 text-green-800' },
      'en_creation': { label: 'En création', color: 'bg-yellow-100 text-yellow-800' },
      'prête': { label: 'Prête', color: 'bg-blue-100 text-blue-800' },
      'en_livraison': { label: 'En livraison', color: 'bg-purple-100 text-purple-800' },
      'livrée': { label: 'Livrée', color: 'bg-green-100 text-green-800' },
      'annulée': { label: 'Annulée', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap['payée'];
    
    return (
      <Badge className={`${config.color} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Tableau de bord
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Vue d'ensemble de votre activité
            </p>
          </div>
          
          <Button 
            onClick={refreshData} 
            disabled={isRefreshing}
            variant="outline"
            className="self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {/* Cartes de statistiques principales */}
        {stats?.overview && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Chiffre d'affaires */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Chiffre d'affaires total
                </CardTitle>
                <Euro className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(stats.overview.totalRevenue)}
                </div>
                {formatGrowth(stats.trends?.revenueGrowth || 0)}
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(stats.trends?.revenueLast30Days || 0)} ce mois
                </p>
              </CardContent>
            </Card>

            {/* Commandes */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Commandes totales
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.overview.totalOrders}
                </div>
                {formatGrowth(stats.trends?.orderGrowth || 0)}
                <p className="text-xs text-gray-500 mt-1">
                  {stats.trends?.ordersLast30Days || 0} ce mois
                </p>
              </CardContent>
            </Card>

            {/* Clients */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Clients totaux
                </CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.overview.totalUsers}
                </div>
                {formatGrowth(stats.trends?.customerGrowth || 0)}
                <p className="text-xs text-gray-500 mt-1">
                  {stats.trends?.newUsersLast30Days || 0} nouveaux ce mois
                </p>
              </CardContent>
            </Card>

            {/* Produits */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Produits actifs
                </CardTitle>
                <Package className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.overview.totalProducts}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Panier moyen: {formatCurrency(stats.overview?.averageOrderValue || 0)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Produits avec vraies données */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                Produits les plus vendus
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.charts?.topProducts && stats.charts.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {stats.charts.topProducts.slice(0, 5).map((product, index) => (
                    <div key={product._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      {/* Image du produit */}
                      <div className="flex-shrink-0 w-12 h-12 relative rounded-lg overflow-hidden bg-gray-200">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={() => {
                              // L'image sera cachée automatiquement par le navigateur
                              // Le fallback sera visible grâce au positionnement absolu
                            }}
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">
                          #{index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.category}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {product.sales} ventes
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucune vente enregistrée</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Commandes récentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Commandes récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </p>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-gray-600">
                          {order.customerInfo.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.items.length} article{order.items.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucune commande récente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="justify-start h-auto p-4" variant="outline">
                <Plus className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Nouveau produit</div>
                  <div className="text-xs text-gray-500">Ajouter au catalogue</div>
                </div>
              </Button>
              
              <Button className="justify-start h-auto p-4" variant="outline">
                <Eye className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Voir commandes</div>
                  <div className="text-xs text-gray-500">Gérer les commandes</div>
                </div>
              </Button>
              
              <Button className="justify-start h-auto p-4" variant="outline">
                <Users className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Clients</div>
                  <div className="text-xs text-gray-500">Gérer les clients</div>
                </div>
              </Button>
              
              <Button className="justify-start h-auto p-4" variant="outline">
                <BarChart3 className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Rapports</div>
                  <div className="text-xs text-gray-500">Voir les analyses</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}