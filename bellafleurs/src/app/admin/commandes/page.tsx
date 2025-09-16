// src/app/admin/commandes/page.tsx - Version corrigée
'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Package,
  Clock,
  CheckCircle,
  Truck,
  MoreHorizontal,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';

// Types corrigés
type OrderStatus = 'payée' | 'en_creation' | 'prête' | 'en_livraison' | 'livrée' | 'annulée';

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
  status: OrderStatus;
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
  adminNotes?: string;
  timeline: {
    status: OrderStatus;
    date: string;
    note?: string;
  }[];
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders', {
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
      toast.error('Impossible de charger les commandes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus, note?: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus, note })
      });

      if (response.ok) {
        toast.success('Statut mis à jour avec succès');
        fetchOrders();
        // Mettre à jour l'ordre sélectionné si c'est le même
        if (selectedOrder && selectedOrder._id === orderId) {
          const updatedOrder = { ...selectedOrder, status: newStatus };
          setSelectedOrder(updatedOrder);
        }
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  // Filtrage des commandes
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Statistiques rapides
  const stats = {
    total: orders.length,
    payée: orders.filter(o => o.status === 'payée').length,
    en_cours: orders.filter(o => o.status === 'en_creation').length,
    prête: orders.filter(o => o.status === 'prête').length,
    en_livraison: orders.filter(o => o.status === 'en_livraison').length
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
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Commandes</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Suivez et gérez toutes vos commandes
          </p>
        </div>

        {/* Statistiques rapides - RESPONSIVE APPLIQUÉ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs sm:text-sm text-gray-600">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.payée}</p>
              <p className="text-xs sm:text-sm text-gray-600">Validées</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats.en_cours}</p>
              <p className="text-xs sm:text-sm text-gray-600">En création</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.prête}</p>
              <p className="text-xs sm:text-sm text-gray-600">Prêtes</p>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-3 md:col-span-1">
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold text-orange-600">{stats.en_livraison}</p>
              <p className="text-xs sm:text-sm text-gray-600">En livraison</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche - RESPONSIVE APPLIQUÉ */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher par numéro, nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
              </div>
              
              <div className="w-full sm:w-48">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="payée">Payée</SelectItem>
                    <SelectItem value="en_creation">En création</SelectItem>
                    <SelectItem value="prête">Prête</SelectItem>
                    <SelectItem value="en_livraison">En livraison</SelectItem>
                    <SelectItem value="livrée">Livrée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={fetchOrders} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Actualiser</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des commandes - RESPONSIVE APPLIQUÉ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Commandes ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 sm:py-12 px-4">
                <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-sm sm:text-base text-gray-500">Aucune commande trouvée</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Table responsive pour desktop */}
                <table className="w-full hidden md:table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commande
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.items.length} article(s)
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.customerInfo.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customerInfo.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {order.totalAmount.toFixed(2)}€
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusBadgeClass(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier statut
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Télécharger
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Cards responsive pour mobile/tablet */}
                <div className="md:hidden space-y-3 sm:space-y-4 p-4 sm:p-6">
                  {filteredOrders.map((order) => (
                    <Card key={order._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-sm text-gray-900">{order.orderNumber}</h3>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('fr-FR')} • {order.items.length} article(s)
                            </p>
                          </div>
                          <Badge className={`${getStatusBadgeClass(order.status)} text-xs`}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Client:</span>
                            <span className="font-medium">{order.customerInfo.name}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Montant:</span>
                            <span className="font-bold text-green-600">{order.totalAmount.toFixed(2)}€</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)} className="flex-1 text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            Détails
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier statut
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Télécharger
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog pour les détails de commande - RESPONSIVE APPLIQUÉ */}
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Détails de la commande {selectedOrder?.orderNumber}
              </DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <OrderDetailsDialog 
                order={selectedOrder} 
                onStatusUpdate={handleStatusUpdate}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

// Fonctions utilitaires
function getStatusBadgeClass(status: OrderStatus): string {
  const classes = {
    'payée': 'bg-blue-100 text-blue-800',
    'en_creation': 'bg-orange-100 text-orange-800',
    'prête': 'bg-green-100 text-green-800',
    'en_livraison': 'bg-purple-100 text-purple-800',
    'livrée': 'bg-emerald-100 text-emerald-800',
    'annulée': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}

function getStatusLabel(status: OrderStatus): string {
  const labels = {
    'payée': 'Payée',
    'en_creation': 'En création',
    'prête': 'Prête',
    'en_livraison': 'En livraison',
    'livrée': 'Livrée',
    'annulée': 'Annulée'
  };
  return labels[status] || status;
}

// Composant pour les détails de commande - RESPONSIVE APPLIQUÉ
function OrderDetailsDialog({ 
  order, 
  onStatusUpdate 
}: { 
  order: Order;
  onStatusUpdate: (orderId: string, status: OrderStatus, note?: string) => void;
}) {
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  const [note, setNote] = useState('');

  const handleUpdateStatus = () => {
    if (newStatus !== order.status) {
      onStatusUpdate(order._id, newStatus, note || undefined);
      setNote('');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Informations générales - RESPONSIVE APPLIQUÉ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Informations client</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              <span>{order.customerInfo.name}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              <span>{order.customerInfo.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              <span>{order.customerInfo.phone}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Livraison</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span>{order.deliveryInfo.type === 'delivery' ? 'Livraison' : 'Retrait'}</span>
            </div>
            {order.deliveryInfo.address && (
              <div className="ml-6">
                <p>{order.deliveryInfo.address.street}</p>
                <p>{order.deliveryInfo.address.zipCode} {order.deliveryInfo.address.city}</p>
              </div>
            )}
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>{new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Articles - RESPONSIVE APPLIQUÉ */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Articles ({order.items.length})</h4>
        <div className="space-y-2 sm:space-y-3">
          {order.items.map((item) => (
            <div key={item._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base truncate">{item.name}</p>
                <p className="text-xs sm:text-sm text-gray-500">Quantité: {item.quantity}</p>
              </div>
              <p className="font-bold text-green-600 text-sm sm:text-base">{item.price.toFixed(2)}€</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modification du statut - RESPONSIVE APPLIQUÉ */}
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Modifier le statut</h4>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <Label className="text-xs sm:text-sm">Nouveau statut</Label>
            <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payée">Payée</SelectItem>
                <SelectItem value="en_creation">En création</SelectItem>
                <SelectItem value="prête">Prête</SelectItem>
                <SelectItem value="en_livraison">En livraison</SelectItem>
                <SelectItem value="livrée">Livrée</SelectItem>
                <SelectItem value="annulée">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs sm:text-sm">Note (optionnelle)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ajouter une note..."
              className="text-sm"
              rows={3}
            />
          </div>
          
          <Button onClick={handleUpdateStatus} disabled={newStatus === order.status} size="sm">
            Mettre à jour le statut
          </Button>
        </div>
      </div>
    </div>
  );
}