// src/app/corporate/dashboard/page.tsx - Dashboard corporate complet
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  CreditCard,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Package,
  Euro,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
  Eye,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Types basés sur l'API corporate
interface CorporateStats {
  currentMonth: {
    amount: number;
    count: number;
    limit: number;
    remainingBudget: number;
    utilizationPercent: number;
  };
  lastMonth: {
    amount: number;
    count: number;
  };
  growth: {
    monthlyGrowth: number;
    isPositive: boolean;
  };
  totals: {
    allTimeOrders: number;
    allTimeAmount: number;
  };
  breakdown: {
    ordersByStatus: Record<string, number>;
    averageOrderValue: number;
  };
}

interface Order {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: 'payée' | 'en_creation' | 'prête' | 'en_livraison' | 'livrée' | 'annulée';
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  deliveryInfo: {
    date: string;
    type: 'delivery' | 'pickup';
  };
}

export default function CorporateDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<CorporateStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ CORRECTION: Tous les hooks AVANT les conditions de redirect
  useEffect(() => {
    if (session?.user && (session.user as any).accountType === 'corporate') {
      fetchDashboardData();
    }
  }, [session]);

  // Redirection si non authentifié
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Vérifier si c'est un compte corporate
  const user = session.user as any;
  if (user.accountType !== 'corporate') {
    redirect('/mon-compte');
  }

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [statsResponse, ordersResponse] = await Promise.all([
        fetch('/api/corporate/dashboard/stats', { credentials: 'include' }),
        fetch('/api/orders?limit=10', { credentials: 'include' })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success && statsData.data.stats) {
          setStats(statsData.data.stats);
        }
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        if (ordersData.success && ordersData.data.orders) {
          setRecentOrders(ordersData.data.orders);
        }
      }

    } catch (error) {
      console.error('❌ Erreur dashboard corporate:', error);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: Order['status']) => {
    const config = {
      'payée': { label: 'Payée', className: 'bg-green-100 text-green-800' },
      'en_creation': { label: 'En création', className: 'bg-blue-100 text-blue-800' },
      'prête': { label: 'Prête', className: 'bg-orange-100 text-orange-800' },
      'en_livraison': { label: 'En livraison', className: 'bg-purple-100 text-purple-800' },
      'livrée': { label: 'Livrée', className: 'bg-gray-100 text-gray-800' },
      'annulée': { label: 'Annulée', className: 'bg-red-100 text-red-800' }
    };
    const { label, className } = config[status];
    return (
      <Badge variant="secondary" className={className}>
        {label}
      </Badge>
    );
  };

  const getBudgetStatus = () => {
    if (!stats) return { color: 'gray', message: 'Chargement...' };
    
    const utilizationPercent = stats.currentMonth.utilizationPercent;
    
    if (utilizationPercent <= 50) {
      return { color: 'green', message: 'Budget sous contrôle' };
    } else if (utilizationPercent <= 80) {
      return { color: 'yellow', message: 'Attention au budget' };
    } else {
      return { color: 'red', message: 'Budget presque épuisé' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre dashboard...</p>
        </div>
      </div>
    );
  }

  const budgetStatus = getBudgetStatus();

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
                <Building2 className="w-8 h-8 text-blue-600" />
                {user.company?.name || 'Dashboard Corporate'}
              </h1>
              <p className="text-gray-600 mt-1">
                Dashboard Corporate Bella Fleurs
              </p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Contact: {user.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CreditCard className="w-4 h-4" />
                  <span>Facturation mensuelle</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={refreshData} 
                variant="outline" 
                size="sm"
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              
              <Link href="/produits">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle commande
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Alerte budget si nécessaire */}
        {stats && stats.currentMonth.utilizationPercent > 80 && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Budget presque épuisé</h3>
                <p className="text-red-700 text-sm mt-1">
                  Vous avez utilisé {stats.currentMonth.utilizationPercent}% de votre budget mensuel. 
                  Restant: {formatCurrency(stats.currentMonth.remainingBudget)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cartes principales */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Budget ce mois */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Budget ce mois
                </CardTitle>
                <Euro className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(stats.currentMonth.amount)}
                </div>
                <span className="text-sm text-gray-500">
                  / {formatCurrency(stats.currentMonth.limit)}
                </span>
                
                <Progress 
                  value={stats.currentMonth.utilizationPercent} 
                  className="mt-3"
                />
                
                <div className="flex items-center mt-2">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    budgetStatus.color === 'green' ? 'bg-green-500' :
                    budgetStatus.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-xs text-gray-600">
                    {budgetStatus.message}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Commandes ce mois */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Commandes ce mois
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.currentMonth.count}
                </div>
                
                {stats.growth.monthlyGrowth !== 0 && (
                  <div className={`flex items-center text-sm ${
                    stats.growth.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.growth.isPositive ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    <span>{Math.abs(stats.growth.monthlyGrowth)}% vs mois dernier</span>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-1">
                  Mois dernier: {stats.lastMonth.count}
                </p>
              </CardContent>
            </Card>

            {/* Total cette année */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total cette année
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(stats.totals.allTimeAmount)}
                </div>
                <p className="text-xs text-gray-500">
                  {stats.totals.allTimeOrders} commande{stats.totals.allTimeOrders !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            {/* Panier moyen */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Panier moyen
                </CardTitle>
                <Package className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(stats.breakdown.averageOrderValue)}
                </div>
                <p className="text-xs text-gray-500">
                  Ce mois: {stats.currentMonth.count} commandes
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Commandes récentes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-green-600" />
                    Commandes récentes
                  </div>
                  <Link href="/corporate/orders">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Voir toutes
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucune commande récente</p>
                    <Link href="/produits">
                      <Button className="mt-4 bg-green-600 hover:bg-green-700">
                        Passer ma première commande
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.slice(0, 5).map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-gray-900">
                              {order.orderNumber}
                            </span>
                            {getStatusBadge(order.status)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{formatDate(order.createdAt)}</span>
                            <span>•</span>
                            <span>{order.items.length} article{order.items.length > 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span>Livraison {formatDate(order.deliveryInfo.date)}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-bold text-lg text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar info */}
          <div className="space-y-6">
            
            {/* Informations compte */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                  Informations compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Entreprise</span>
                  <span className="font-medium">{user.company?.name || 'Non renseigné'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact</span>
                  <span className="font-medium">{user.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-sm">{user.email}</span>
                </div>
                
                {stats && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget restant</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(stats.currentMonth.remainingBudget)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/produits">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle commande
                  </Button>
                </Link>
                
                <Link href="/corporate/orders">
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Mes commandes
                  </Button>
                </Link>
                
                <Link href="/contact">
                  <Button variant="outline" className="w-full">
                    <Building2 className="w-4 h-4 mr-2" />
                    Support corporate
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Statut budget */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-orange-600" />
                    Statut budget
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Utilisation</span>
                      <span className="font-medium">{stats.currentMonth.utilizationPercent}%</span>
                    </div>
                    
                    <Progress value={stats.currentMonth.utilizationPercent} />
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="font-bold text-green-600">
                          {formatCurrency(stats.currentMonth.remainingBudget)}
                        </div>
                        <div className="text-xs text-gray-500">Restant</div>
                      </div>
                      
                      <div>
                        <div className="font-bold text-blue-600">
                          {formatCurrency(stats.currentMonth.limit)}
                        </div>
                        <div className="text-xs text-gray-500">Limite</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center pt-2">
                      {stats.currentMonth.utilizationPercent <= 50 ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      ) : stats.currentMonth.utilizationPercent <= 80 ? (
                        <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      <span className="text-sm text-gray-600">
                        {budgetStatus.message}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
}