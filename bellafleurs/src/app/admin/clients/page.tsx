// src/app/admin/clients/page.tsx - Gestion unifiée clients individual + corporate
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
  Users,
  Plus,
  Building2,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';

// Types étendus pour gérer les comptes corporate
interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'client' | 'admin';
  accountType?: 'individual' | 'corporate';
  address?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  company?: {
    name: string;
    contactPerson: string;
  };
  corporateSettings?: {
    monthlyLimit?: number;
    paymentTerm: 'immediate' | 'monthly';
    pendingActivation?: boolean;
    activatedAt?: string;
  };
  emailVerified?: string;
  createdAt: string;
  updatedAt: string;
  // Stats calculées
  ordersCount?: number;
  totalSpent?: number;
  lastOrderDate?: string;
}

interface ClientStats {
  totalUsers: number;
  totalClients: number;
  totalAdmins: number;
  newUsersThisMonth: number;
  totalCorporate: number;
  pendingCorporate: number;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form pour création corporate
  const [corporateForm, setCorporateForm] = useState({
    // Contact
    contactName: '',
    email: '',
    phone: '',
    // Entreprise
    companyName: '',
    // Adresse complète
    street: '',
    city: '',
    zipCode: '',
    country: 'France',
    // Paramètres
    monthlyLimit: 1000,
    paymentTerm: 'monthly' as 'immediate' | 'monthly',
    approvalRequired: false
  });

  useEffect(() => {
    fetchData();
  }, [searchTerm, filterRole, currentPage, activeTab]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer les utilisateurs depuis l'API étendue
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        ...(filterRole !== 'all' && { role: filterRole }),
        ...(searchTerm && { search: searchTerm }),
        ...(activeTab !== 'all' && { accountType: activeTab })
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

  const handleCreateCorporate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!corporateForm.contactName || !corporateForm.email || !corporateForm.companyName || 
        !corporateForm.street || !corporateForm.city || !corporateForm.zipCode) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsCreating(true);

    try {
      const payload = {
        // Contact
        name: corporateForm.contactName,
        email: corporateForm.email,
        phone: corporateForm.phone,
        
        // Entreprise
        companyName: corporateForm.companyName,
        contactPerson: corporateForm.contactName, // Même personne pour simplifier
        
        // Adresse
        address: {
          street: corporateForm.street,
          city: corporateForm.city,
          zipCode: corporateForm.zipCode,
          country: corporateForm.country
        },
        
        // Paramètres
        monthlyLimit: corporateForm.monthlyLimit,
        paymentTerm: corporateForm.paymentTerm,
        approvalRequired: corporateForm.approvalRequired
      };

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Compte corporate créé avec succès');
        setIsCreateDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        toast.error(data.error?.message || 'Erreur lors de la création');
      }
    } catch (error) {
      toast.error('Erreur lors de la création du compte');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setCorporateForm({
      contactName: '',
      email: '',
      phone: '',
      companyName: '',
      street: '',
      city: '',
      zipCode: '',
      country: 'France',
      monthlyLimit: 1000,
      paymentTerm: 'monthly',
      approvalRequired: false
    });
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Nom', 'Email', 'Téléphone', 'Type', 'Entreprise', 'Commandes', 'Total dépensé', 'Date création'].join(','),
      ...clients.map(client => [
        client.name,
        client.email,
        client.phone || '',
        client.accountType === 'corporate' ? 'Corporate' : 'Individual',
        client.company?.name || '',
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

  const getStatusBadge = (client: Client) => {
    if (client.accountType === 'corporate') {
      if (client.corporateSettings?.pendingActivation) {
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En attente activation</Badge>;
      }
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Corporate actif</Badge>;
    }
    return <Badge variant="secondary" className="bg-green-100 text-green-800">Client individual</Badge>;
  };

  const filteredClients = clients.filter(client => {
    switch (activeTab) {
      case 'individual':
        return client.accountType !== 'corporate';
      case 'corporate':
        return client.accountType === 'corporate';
      case 'pending':
        return client.accountType === 'corporate' && client.corporateSettings?.pendingActivation;
      default:
        return true;
    }
  });

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Clients</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Clients individuels et comptes corporate
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
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer compte corporate
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nouveau compte corporate</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleCreateCorporate} className="space-y-6">
                  {/* Informations entreprise */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Informations entreprise</h3>
                    
                    <div>
                      <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                      <Input
                        id="companyName"
                        value={corporateForm.companyName}
                        onChange={(e) => setCorporateForm(prev => ({ ...prev, companyName: e.target.value }))}
                        placeholder="Entreprise SAS"
                        required
                      />
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Personne de contact</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactName">Prénom et nom *</Label>
                        <Input
                          id="contactName"
                          value={corporateForm.contactName}
                          onChange={(e) => setCorporateForm(prev => ({ ...prev, contactName: e.target.value }))}
                          placeholder="Jean Dupont"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Adresse email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={corporateForm.email}
                          onChange={(e) => setCorporateForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="jean.dupont@entreprise.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Numéro de téléphone *</Label>
                      <Input
                        id="phone"
                        value={corporateForm.phone}
                        onChange={(e) => setCorporateForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="01 23 45 67 89"
                        required
                      />
                    </div>
                  </div>

                  {/* Adresse complète */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Adresse complète</h3>
                    
                    <div>
                      <Label htmlFor="street">Rue et numéro *</Label>
                      <Input
                        id="street"
                        value={corporateForm.street}
                        onChange={(e) => setCorporateForm(prev => ({ ...prev, street: e.target.value }))}
                        placeholder="123 Rue de la République"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="zipCode">Code postal *</Label>
                        <Input
                          id="zipCode"
                          value={corporateForm.zipCode}
                          onChange={(e) => setCorporateForm(prev => ({ ...prev, zipCode: e.target.value }))}
                          placeholder="75001"
                          maxLength={5}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="city">Ville *</Label>
                        <Input
                          id="city"
                          value={corporateForm.city}
                          onChange={(e) => setCorporateForm(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Paris"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="country">Pays</Label>
                        <Select value={corporateForm.country} onValueChange={(value) => setCorporateForm(prev => ({ ...prev, country: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="France">France</SelectItem>
                            <SelectItem value="Belgique">Belgique</SelectItem>
                            <SelectItem value="Suisse">Suisse</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Paramètres corporate */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Paramètres</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="monthlyLimit">Limite mensuelle (€)</Label>
                        <Input
                          id="monthlyLimit"
                          type="number"
                          value={corporateForm.monthlyLimit}
                          onChange={(e) => setCorporateForm(prev => ({ ...prev, monthlyLimit: parseInt(e.target.value) || 0 }))}
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="paymentTerm">Mode de paiement</Label>
                        <Select value={corporateForm.paymentTerm} onValueChange={(value) => setCorporateForm(prev => ({ ...prev, paymentTerm: value as 'immediate' | 'monthly' }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Facturation mensuelle</SelectItem>
                            <SelectItem value="immediate">Paiement immédiat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        resetForm();
                      }}
                      disabled={isCreating}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? 'Création...' : 'Créer le compte'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistiques étendues */}
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
                <CardTitle className="text-sm font-medium">Clients individuels</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.totalUsers - stats.totalCorporate}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comptes corporate</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalCorporate}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En attente activation</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingCorporate}</div>
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
                    placeholder="Rechercher par nom, email ou entreprise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Tous ({clients.length})</TabsTrigger>
            <TabsTrigger value="individual">Individuels ({clients.filter(c => c.accountType !== 'corporate').length})</TabsTrigger>
            <TabsTrigger value="corporate">Corporate ({clients.filter(c => c.accountType === 'corporate').length})</TabsTrigger>
            <TabsTrigger value="pending">En attente ({clients.filter(c => c.accountType === 'corporate' && c.corporateSettings?.pendingActivation).length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {/* Liste des clients */}
            <Card>
              <CardHeader>
                <CardTitle>Clients ({filteredClients.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucun client trouvé
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredClients.map((client) => (
                      <div
                        key={client._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                {client.accountType === 'corporate' ? (
                                  <Building2 className="w-5 h-5 text-blue-600" />
                                ) : (
                                  <User className="w-5 h-5 text-green-600" />
                                )}
                                <div>
                                  <h3 className="font-medium text-gray-900">
                                    {client.accountType === 'corporate' ? client.company?.name : client.name}
                                  </h3>
                                  <p className="text-sm text-gray-500">{client.email}</p>
                                  {client.accountType === 'corporate' && (
                                    <p className="text-xs text-gray-500">Contact: {client.name}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {getStatusBadge(client)}
                              
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

                              {client.corporateSettings?.monthlyLimit && (
                                <Badge variant="outline" className="text-blue-600">
                                  Limite: {formatCurrency(client.corporateSettings.monthlyLimit)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2 mt-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Créé le {formatDate(client.createdAt)}
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
                                {client.address.city}, {client.address.zipCode}
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
          </TabsContent>
        </Tabs>

        {/* Dialog détails client étendu */}
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedClient?.accountType === 'corporate' ? 'Détails du compte corporate' : 'Détails du client'}
              </DialogTitle>
            </DialogHeader>
            
            {selectedClient && (
              <div className="space-y-6">
                {/* Informations principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedClient.accountType === 'corporate' ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Entreprise</label>
                        <p className="text-base font-medium">{selectedClient.company?.name}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Personne de contact</label>
                        <p className="text-base">{selectedClient.name}</p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nom complet</label>
                      <p className="text-base font-medium">{selectedClient.name}</p>
                    </div>
                  )}
                  
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
                    <label className="text-sm font-medium text-gray-500">Type de compte</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedClient)}
                    </div>
                  </div>
                </div>

                {/* Paramètres corporate */}
                {selectedClient.accountType === 'corporate' && selectedClient.corporateSettings && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Paramètres corporate</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Limite mensuelle</label>
                        <p className="text-base">{formatCurrency(selectedClient.corporateSettings.monthlyLimit || 0)}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Mode de paiement</label>
                        <p className="text-base">
                          {selectedClient.corporateSettings.paymentTerm === 'monthly' ? 'Facturation mensuelle' : 'Paiement immédiat'}
                        </p>
                      </div>

                      {selectedClient.corporateSettings.activatedAt && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Activé le</label>
                          <p className="text-base">{formatDate(selectedClient.corporateSettings.activatedAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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