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
        fetch('/api/admin/stats', { credentials: 'include' }),
        fetch('/api/admin/orders?limit=5', { credentials: 'include' }),
        fetch('/api/admin/products?limit=3', { credentials: 'include' })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data.stats);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setRecentOrders(ordersData.data.orders.map((order: any) => ({
          _id: order._id,
          orderNumber: order.orderNumber,
          customerName: order.customerInfo.name,
          customerEmail: order.customerInfo.email,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          itemsCount: order.items.length
        })));
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        // Pour les top products, on utilise les données de base pour l'instant
        // TODO: Implémenter analytics des ventes par produit
        setTopProducts(productsData.data.products.slice(0, 3).map((product: any) => ({
          _id: product._id,
          name: product.name,
          category: product.category,
          sales: Math.floor(Math.random() * 50) + 1, // TODO: Remplacer par vraies données
          revenue: Math.floor(Math.random() * 1000) + 100,
          image: product.images[0] || '/api/placeholder/80/80'
        })));
      }

    } catch (error: any) {
      console.error('Erreur chargement dashboard:', error);
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

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: RecentOrder['status']) => {
    const colors = {
      payée: 'bg-blue-100 text-blue-800',
      en_creation: 'bg-purple-100 text-purple-800',
      prête: 'bg-green-100 text-green-800',
      en_livraison: 'bg-orange-100 text-orange-800',
      livrée: 'bg-emerald-100 text-emerald-800'
    };
    return colors[status];
  };

  // Fonction pour obtenir le label du statut
  const getStatusLabel = (status: RecentOrder['status']) => {
    const labels = {
      payée: 'Validée',
      en_creation: 'En création',
      prête: 'Prête',
      en_livraison: 'En livraison',
      livrée: 'Livrée'
    };
    return labels[status];
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Vue d'ensemble de votre activité Bella Fleurs
            </p>
          </div>
          <Button onClick={refreshData} variant="outline" disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Commandes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commandes</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +{stats.ordersGrowth}% ce mois
                </div>
              </CardContent>
            </Card>

            {/* Clients */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +{stats.customersGrowth}% ce mois
                </div>
              </CardContent>
            </Card>

            {/* Produits */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Créations actives</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +{stats.productsGrowth}% ce mois
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Commandes récentes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Commandes récentes</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <a href="/admin/commandes">
                  <Eye className="w-4 h-4 mr-2" />
                  Voir tout
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune commande récente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{order.orderNumber}</p>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {order.customerName} • {order.itemsCount} article(s)
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-medium">{order.totalAmount.toFixed(2)}€</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Créations populaires */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Créations populaires</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <a href="/admin/produits">
                  <Package className="w-4 h-4 mr-2" />
                  Gérer
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune création disponible</p>
                  <Button size="sm" className="mt-4" asChild>
                    <a href="/admin/produits">
                      <Plus className="w-4 h-4 mr-2" />
                      Créer un produit
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product) => (
                    <div key={product._id} className="flex items-center space-x-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{product.sales} ventes</p>
                        <p className="text-xs text-gray-500">{product.revenue}€</p>
                      </div>
                    </div>
                  ))}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="h-20 flex flex-col space-y-2" asChild>
                <a href="/admin/produits">
                  <Package className="h-6 w-6" />
                  <span className="text-sm">Nouvelle création</span>
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <a href="/admin/commandes">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="text-sm">Voir commandes</span>
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <a href="/admin/clients">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Gestion clients</span>
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2" onClick={refreshData}>
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">Actualiser données</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Message d'information */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Bienvenue dans votre espace administrateur</h3>
                <p className="text-sm text-blue-700 mt-1">
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