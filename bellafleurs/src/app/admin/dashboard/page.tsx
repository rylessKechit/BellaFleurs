// src/app/admin/dashboard/page.tsx
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
  Truck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/admin/AdminLayout';

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
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
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

interface LowStockProduct {
  _id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  image: string;
}

// Mock data
const mockStats: DashboardStats = {
  totalRevenue: 12450.80,
  totalOrders: 89,
  totalCustomers: 156,
  totalProducts: 45,
  revenueGrowth: 12.5,
  ordersGrowth: 8.3,
  customersGrowth: 15.2,
  productsGrowth: 4.1
};

const mockRecentOrders: RecentOrder[] = [
  {
    _id: '1',
    orderNumber: 'BF-20241215-0001',
    customerName: 'Marie Dubois',
    customerEmail: 'marie.dubois@email.com',
    totalAmount: 85.40,
    status: 'confirmed',
    createdAt: '2024-12-15T10:30:00Z',
    itemsCount: 3
  },
  {
    _id: '2',
    orderNumber: 'BF-20241215-0002',
    customerName: 'Jean Martin',
    customerEmail: 'jean.martin@email.com',
    totalAmount: 65.90,
    status: 'preparing',
    createdAt: '2024-12-15T09:15:00Z',
    itemsCount: 2
  },
  {
    _id: '3',
    orderNumber: 'BF-20241214-0008',
    customerName: 'Sophie Laurent',
    customerEmail: 'sophie.laurent@email.com',
    totalAmount: 120.00,
    status: 'ready',
    createdAt: '2024-12-14T16:45:00Z',
    itemsCount: 1
  },
  {
    _id: '4',
    orderNumber: 'BF-20241214-0007',
    customerName: 'Pierre Durand',
    customerEmail: 'pierre.durand@email.com',
    totalAmount: 45.90,
    status: 'delivered',
    createdAt: '2024-12-14T14:20:00Z',
    itemsCount: 2
  }
];

const mockTopProducts: TopProduct[] = [
  {
    _id: '1',
    name: 'Bouquet Romantique',
    category: 'bouquets',
    sales: 23,
    revenue: 1055.70,
    image: '/api/placeholder/80/80'
  },
  {
    _id: '2',
    name: 'Composition Zen',
    category: 'compositions',
    sales: 18,
    revenue: 1170.00,
    image: '/api/placeholder/80/80'
  },
  {
    _id: '3',
    name: 'Orchidée Premium',
    category: 'plantes',
    sales: 15,
    revenue: 448.50,
    image: '/api/placeholder/80/80'
  }
];

const mockLowStockProducts: LowStockProduct[] = [
  {
    _id: '1',
    name: 'Roses Rouges Premium',
    category: 'bouquets',
    stock: 2,
    minStock: 10,
    image: '/api/placeholder/60/60'
  },
  {
    _id: '2',
    name: 'Vase Céramique Blanc',
    category: 'accessoires',
    stock: 1,
    minStock: 5,
    image: '/api/placeholder/60/60'
  },
  {
    _id: '3',
    name: 'Plante Dépolluante',
    category: 'plantes',
    stock: 3,
    minStock: 8,
    image: '/api/placeholder/60/60'
  }
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>(mockRecentOrders);
  const [topProducts, setTopProducts] = useState<TopProduct[]>(mockTopProducts);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>(mockLowStockProducts);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: RecentOrder['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  // Fonction pour obtenir le label du statut
  const getStatusLabel = (status: RecentOrder['status']) => {
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      preparing: 'En préparation',
      ready: 'Prête',
      delivered: 'Livrée',
      cancelled: 'Annulée'
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

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Vue d'ensemble de votre activité Bella Fleurs
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Chiffre d'affaires */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString('fr-FR')}€</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +{stats.revenueGrowth}% ce mois
              </div>
            </CardContent>
          </Card>

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
              <CardTitle className="text-sm font-medium">Produits actifs</CardTitle>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Commandes récentes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Commandes récentes</CardTitle>
                <Button variant="outline" size="sm">
                  Voir tout
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium text-gray-900">
                          {order.orderNumber}
                        </span>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>{order.customerName}</div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span>{formatDate(order.createdAt)}</span>
                          <span>{order.itemsCount} article{order.itemsCount > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-primary-600">
                        {order.totalAmount.toFixed(2)}€
                      </div>
                      <div className="flex space-x-1 mt-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Produits les plus vendus */}
          <Card>
            <CardHeader>
              <CardTitle>Produits les plus vendus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product._id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-pink-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🌸</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        {product.category} • {product.sales} ventes
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary-600">
                        {product.revenue.toFixed(2)}€
                      </div>
                      <div className="text-xs text-gray-500">
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertes */}
        <div className="space-y-6">
          
          {/* Stock faible */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-900">Alertes stock faible</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lowStockProducts.map((product) => (
                  <div key={product._id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-orange-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-pink-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm">🌸</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate text-sm">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        Stock: {product.stock} (min: {product.minStock})
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                      Réapprovisionner
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button className="h-20 flex flex-col space-y-2">
                  <Package className="h-6 w-6" />
                  <span className="text-sm">Nouveau produit</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="text-sm">Voir commandes</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Gestion clients</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">Statistiques</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}