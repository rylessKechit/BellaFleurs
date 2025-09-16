// src/app/admin/clients/page.tsx - Version complète responsive - ADAPTÉE AUX APIs EXISTANTES
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

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
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
      
      // Récupérer les utilisateurs depuis l'API auth existante
      const usersResponse = await fetch('/api/auth/users', {
        method: 'GET',
        credentials: 'include'
      });

      let usersData = [];
      if (usersResponse.ok) {
        const userData = await usersResponse.json();
        usersData = userData.users || [];
      } else {
        // Fallback: Essayer une route générique ou simuler des données
        console.warn('Route /api/auth/users non disponible, données simulées');
        usersData = [];
      }

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
            : undefined
        };
      });

      // Appliquer les filtres côté client
      let filteredClients = enrichedClients;

      // Filtre par rôle
      if (filterRole !== 'all') {
        filteredClients = filteredClients.filter((client: Client) => client.role === filterRole);
      }

      // Filtre par recherche
      if (searchTerm) {
        filteredClients = filteredClients.filter((client: Client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Tri
      filteredClients.sort((a: Client, b: Client) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'ordersCount':
            aValue = a.ordersCount || 0;
            bValue = b.ordersCount || 0;
            break;
          case 'totalSpent':
            aValue = a.totalSpent || 0;
            bValue = b.totalSpent || 0;
            break;
          case 'lastOrderDate':
            aValue = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
            bValue = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
            break;
          default: // createdAt
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
        }

        if (sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });

      // Pagination côté client (simple pour cette démo)
      const itemsPerPage = 20;
      const totalItems = filteredClients.length;
      const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

      setClients(paginatedClients);
      setTotalPages(calculatedTotalPages);
      
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les clients');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportClients = async () => {
    try {
      // Export simple CSV côté client
      const csvContent = [
        'Nom,Email,Téléphone,Rôle,Commandes,Total dépensé,Inscription',
        ...clients.map(client => [
          client.name,
          client.email,
          client.phone || '',
          client.role,
          client.ordersCount || 0,
          (client.totalSpent || 0).toFixed(2) + '€',
          new Date(client.createdAt).toLocaleDateString('fr-FR')
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Export réalisé avec succès');
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'export des clients');
    }
  };

  // Statistiques calculées côté client
  const stats = {
    total: clients.length,
    admins: clients.filter(c => c.role === 'admin').length,
    clients: clients.filter(c => c.role === 'client').length,
    activeClients: clients.filter(c => (c.ordersCount || 0) > 0).length,
    totalRevenue: clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0)
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <Badge className="bg-purple-100 text-purple-800 text-xs">Admin</Badge>
    ) : (
      <Badge variant="outline" className="text-xs">Client</Badge>
    );
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
              onClick={handleExportClients}
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Statistiques rapides - RESPONSIVE APPLIQUÉ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs sm:text-sm text-gray-600">Total utilisateurs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.clients}</p>
              <p className="text-xs sm:text-sm text-gray-600">Clients</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats.admins}</p>
              <p className="text-xs sm:text-sm text-gray-600">Admins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.activeClients}</p>
              <p className="text-xs sm:text-sm text-gray-600">Clients actifs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold text-orange-600">{stats.totalRevenue.toFixed(0)}€</p>
              <p className="text-xs sm:text-sm text-gray-600">CA Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche - RESPONSIVE APPLIQUÉ */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher un client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm sm:text-base"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:w-auto">
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-full sm:w-40 text-sm sm:text-base">
                    <SelectValue placeholder="Rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="client">Clients</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48 text-sm sm:text-base">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date d'inscription</SelectItem>
                    <SelectItem value="name">Nom</SelectItem>
                    <SelectItem value="ordersCount">Nb commandes</SelectItem>
                    <SelectItem value="totalSpent">Montant dépensé</SelectItem>
                    <SelectItem value="lastOrderDate">Dernière commande</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full sm:w-32 text-sm sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Décroissant</SelectItem>
                    <SelectItem value="asc">Croissant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des clients - RESPONSIVE APPLIQUÉ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Clients ({clients.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {clients.length === 0 ? (
              <div className="text-center py-8 sm:py-12 px-4">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-sm sm:text-base text-gray-500">Aucun client trouvé</p>
              </div>
            ) : (
              <>
                {/* Table responsive pour desktop - RESPONSIVE APPLIQUÉ */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rôle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commandes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CA Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Inscription
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clients.map((client) => (
                        <tr key={client._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                  <User className="h-5 w-5 text-gray-500" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {client.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {client.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {client.phone || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {client.address ? `${client.address.city}` : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getRoleBadge(client.role)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {client.ordersCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {client.totalSpent?.toFixed(2)}€
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(client.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedClient(client)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Voir détails
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a href={`mailto:${client.email}`}>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Envoyer email
                                  </a>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cards pour mobile et tablet - RESPONSIVE APPLIQUÉ */}
                <div className="lg:hidden space-y-3 sm:space-y-4 p-4 sm:p-6">
                  {clients.map((client) => (
                    <Card key={client._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <User className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                  {client.name}
                                </h3>
                                {getRoleBadge(client.role)}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">
                                {client.email}
                              </p>
                              {client.phone && (
                                <p className="text-xs sm:text-sm text-gray-500">
                                  {client.phone}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center sm:text-left">
                              <div>
                                <p className="text-xs text-gray-500">Commandes</p>
                                <p className="text-sm sm:text-base font-medium">{client.ordersCount}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">CA Total</p>
                                <p className="text-sm sm:text-base font-medium text-green-600">
                                  {client.totalSpent?.toFixed(2)}€
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedClient(client)}
                                className="flex-1 sm:flex-none"
                              >
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Détails</span>
                              </Button>
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                asChild
                                className="flex-1 sm:flex-none"
                              >
                                <a href={`mailto:${client.email}`}>
                                  <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                          <div className="flex justify-between items-center">
                            <span>Inscrit le {formatDate(client.createdAt)}</span>
                            {client.lastOrderDate && (
                              <span>Dernière commande: {formatDate(client.lastOrderDate)}</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pagination - RESPONSIVE APPLIQUÉ */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-sm text-gray-700">
              Page {currentPage} sur {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}

        {/* Dialog de détail client - RESPONSIVE APPLIQUÉ */}
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Détails du client
              </DialogTitle>
            </DialogHeader>
            
            {selectedClient && (
              <div className="space-y-4 sm:space-y-6">
                {/* Informations générales - RESPONSIVE APPLIQUÉ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Informations personnelles</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{selectedClient.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{selectedClient.email}</span>
                      </div>
                      {selectedClient.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{selectedClient.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <div>Rôle: {getRoleBadge(selectedClient.role)}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Statistiques</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <ShoppingCart className="w-4 h-4 text-gray-500" />
                        <span>{selectedClient.ordersCount} commandes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-green-600">
                          {selectedClient.totalSpent?.toFixed(2)}€ dépensés
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Inscrit le {formatDate(selectedClient.createdAt)}</span>
                      </div>
                      {selectedClient.lastOrderDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>Dernière commande: {formatDate(selectedClient.lastOrderDate)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Adresse - RESPONSIVE APPLIQUÉ */}
                {selectedClient.address && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Adresse</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <div>{selectedClient.address.street}</div>
                          <div>
                            {selectedClient.address.zipCode} {selectedClient.address.city}
                          </div>
                          <div>{selectedClient.address.country}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions rapides - RESPONSIVE APPLIQUÉ */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button asChild className="w-full sm:w-auto">
                    <a href={`mailto:${selectedClient.email}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Envoyer un email
                    </a>
                  </Button>
                  {selectedClient.phone && (
                    <Button variant="outline" asChild className="w-full sm:w-auto">
                      <a href={`tel:${selectedClient.phone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Appeler
                      </a>
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