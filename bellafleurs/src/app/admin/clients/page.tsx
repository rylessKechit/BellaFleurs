// src/app/admin/clients/page.tsx - Version corrigée avec la bonne API
'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  ShoppingCart,
  MoreHorizontal,
  Download,
  RefreshCw,
  AlertCircle,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';

// Types basés sur votre modèle User existant
interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  role: 'client' | 'admin';
  emailVerified?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  // Champs calculés côté client
  ordersCount?: number;
  totalSpent?: number;
  lastOrderDate?: string;
}

interface ClientStats {
  totalUsers: number;
  totalClients: number;
  totalAdmins: number;
  newUsersThisMonth: number;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [searchTerm, filterRole, sortBy, sortOrder, currentPage]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer les utilisateurs depuis la nouvelle API
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        ...(filterRole !== 'all' && { role: filterRole }),
        ...(searchTerm && { search: searchTerm }),
        sortBy,
        sortOrder
      });

      const usersResponse = await fetch(`/api/admin/users?${params}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!usersResponse.ok) {
        throw new Error('Erreur lors du chargement des utilisateurs');
      }

      const userData = await usersResponse.json();
      const usersData = userData.data?.users || [];
      setStats(userData.data?.stats || null);
      setTotalPages(userData.data?.pagination?.totalPages || 1);

      // Récupérer les commandes pour calculer les statistiques
      const ordersResponse = await fetch('/api/admin/orders?limit=1000', {
        method: 'GET',
        credentials: 'include'
      });

      let ordersData = [];
      if (ordersResponse.ok) {
        const orderData = await ordersResponse.json();
        ordersData = orderData.data?.orders || [];
      }
      setOrders(ordersData);

      // Enrichir les données utilisateur avec les statistiques de commandes
      const enrichedClients = usersData.map((user: any) => {
        const userOrders = ordersData.filter((order: any) => 
          order.user?._id === user._id || order.user === user._id
        );
        
        return {
          ...user,
          ordersCount: userOrders.length,
          totalSpent: userOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0),
          lastOrderDate: userOrders.length > 0 
            ? userOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
            : null
        };
      });

      setClients(enrichedClients);
      
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les données des clients');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Nom', 'Email', 'Téléphone', 'Rôle', 'Commandes', 'Total dépensé', 'Date création'].join(','),
      ...clients.map(client => [
        client.name,
        client.email,
        client.phone || '',
        client.role,
        client.ordersCount || 0,
        client.totalSpent || 0,
        new Date(client.createdAt).toLocaleDateString('fr-FR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'clients-bella-fleurs.csv';
    link.click();
  };

  const getClientDetails = (client: Client) => {
    const clientOrders = orders.filter(order => 
      order.user?._id === client._id || order.user === client._id
    );
    return clientOrders;
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
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Clients</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Gérez votre base de clients et leurs informations
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              onClick={fetchData}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button 
              variant="outline" 
              onClick={exportToCSV}
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clients</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalClients}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.totalAdmins}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clients actifs</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {clients.filter(c => c.ordersCount && c.ordersCount > 0).length}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher un client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="admin">Administrateurs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Liste des clients */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des clients</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun client trouvé
              </div>
            ) : (
              <div className="space-y-4">
                {clients.map((client) => (
                  <div
                    key={client._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{client.name}</h3>
                          <p className="text-sm text-gray-500">{client.email}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={client.role === 'admin' ? 'default' : 'secondary'}>
                            {client.role}
                          </Badge>
                          
                          {client.ordersCount !== undefined && (
                            <Badge variant="outline">
                              {client.ordersCount} commande{client.ordersCount !== 1 ? 's' : ''}
                            </Badge>
                          )}
                          
                          {client.totalSpent !== undefined && client.totalSpent > 0 && (
                            <Badge variant="outline" className="text-green-600">
                              {formatCurrency(client.totalSpent)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Inscrit le {formatDate(client.createdAt)}
                        </div>
                        
                        {client.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </div>
                        )}
                        
                        {client.address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {client.address.city}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3 sm:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedClient(client)}
                      >
                        <Eye className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Voir</span>
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                    <p className="text-sm text-gray-500">
                      Page {currentPage} sur {totalPages}
                    </p>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog détails client */}
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails du client</DialogTitle>
            </DialogHeader>
            
            {selectedClient && (
              <div className="space-y-6">
                {/* Informations personnelles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nom complet</label>
                    <p className="text-base font-medium">{selectedClient.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-base">{selectedClient.email}</p>
                  </div>
                  
                  {selectedClient.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Téléphone</label>
                      <p className="text-base">{selectedClient.phone}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Rôle</label>
                    <Badge variant={selectedClient.role === 'admin' ? 'default' : 'secondary'} className="mt-1">
                      {selectedClient.role}
                    </Badge>
                  </div>
                </div>

                {/* Adresse */}
                {selectedClient.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Adresse</label>
                    <div className="mt-1 text-sm">
                      <p>{selectedClient.address.street}</p>
                      <p>{selectedClient.address.zipCode} {selectedClient.address.city}</p>
                      <p>{selectedClient.address.country}</p>
                    </div>
                  </div>
                )}

                {/* Statistiques */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedClient.ordersCount || 0}</p>
                    <p className="text-sm text-gray-600">Commandes</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedClient.totalSpent || 0)}
                    </p>
                    <p className="text-sm text-gray-600">Total dépensé</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {selectedClient.lastOrderDate 
                        ? formatDate(selectedClient.lastOrderDate)
                        : 'Aucune commande'
                      }
                    </p>
                    <p className="text-sm text-gray-600">Dernière commande</p>
                  </div>
                </div>

                {/* Historique des commandes */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Historique des commandes</h3>
                  {(() => {
                    const clientOrders = getClientDetails(selectedClient);
                    return clientOrders.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Aucune commande trouvée</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {clientOrders.slice(0, 5).map((order: any) => (
                          <div key={order._id} className="flex justify-between items-center p-3 border rounded">
                            <div>
                              <p className="font-medium">#{order.orderNumber}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                              <Badge variant="outline" className="text-xs">
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {clientOrders.length > 5 && (
                          <p className="text-center text-sm text-gray-500 pt-2">
                            ... et {clientOrders.length - 5} autres commandes
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Dates importantes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-500">Date d'inscription</label>
                    <p>{formatDate(selectedClient.createdAt)}</p>
                  </div>
                  
                  <div>
                    <label className="text-gray-500">Dernière modification</label>
                    <p>{formatDate(selectedClient.updatedAt)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      if (selectedClient.email) {
                        window.location.href = `mailto:${selectedClient.email}`;
                      }
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer un email
                  </Button>
                  
                  {selectedClient.phone && (
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        window.location.href = `tel:${selectedClient.phone}`;
                      }}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Appeler
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}