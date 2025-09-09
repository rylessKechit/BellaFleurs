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
  RefreshCw
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
type OrderStatus = 'validé' | 'en_cours_creation' | 'prête' | 'en_livraison' | 'livré';

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
    timeSlot: string;
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
  updatedAt: string;
}

const statusConfig: Record<OrderStatus, {
  label: string;
  color: string;
  icon: any;
  nextStatus: OrderStatus | null;
}> = {
  'validé': {
    label: 'Validée',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
    nextStatus: 'en_cours_creation'
  },
  'en_cours_creation': {
    label: 'En création',
    color: 'bg-purple-100 text-purple-800',
    icon: Clock,
    nextStatus: 'prête'
  },
  'prête': {
    label: 'Prête',
    color: 'bg-green-100 text-green-800',
    icon: Package,
    nextStatus: 'en_livraison'
  },
  'en_livraison': {
    label: 'En livraison',
    color: 'bg-orange-100 text-orange-800',
    icon: Truck,
    nextStatus: 'livré'
  },
  'livré': {
    label: 'Livrée',
    color: 'bg-emerald-100 text-emerald-800',
    icon: CheckCircle,
    nextStatus: null
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Composant Détails de commande
function OrderDetails({ 
  order, 
  onStatusUpdate 
}: { 
  order: Order,
  onStatusUpdate: (orderId: string, newStatus: OrderStatus, note?: string) => void 
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || '');

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(order._id, newStatus, statusNote);
      setStatusNote('');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotesUpdate = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${order._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ adminNotes })
      });

      if (response.ok) {
        toast.success('Notes mises à jour');
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des notes');
    }
  };

  const config = statusConfig[order.status];
  const Icon = config.icon;

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* En-tête avec statut */}
      <div className="flex justify-between items-start border-b pb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Commande {order.orderNumber}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Passée le {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <Badge className={config.color}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
          <p className="text-lg font-bold mt-1">
            {order.totalAmount.toFixed(2)}€
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Informations client */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{order.customerInfo.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <a 
                href={`mailto:${order.customerInfo.email}`}
                className="text-blue-600 hover:underline"
              >
                {order.customerInfo.email}
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <a 
                href={`tel:${order.customerInfo.phone}`}
                className="text-blue-600 hover:underline"
              >
                {order.customerInfo.phone}
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Informations de livraison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Livraison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>
                {new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')} 
                - {order.deliveryInfo.timeSlot}
              </span>
            </div>
            
            {order.deliveryInfo.type === 'delivery' && order.deliveryInfo.address ? (
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p>{order.deliveryInfo.address.street}</p>
                  <p>{order.deliveryInfo.address.zipCode} {order.deliveryInfo.address.city}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-gray-500" />
                <span>Retrait en boutique</span>
              </div>
            )}
            
            {order.deliveryInfo.notes && (
              <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                <strong>Note:</strong> {order.deliveryInfo.notes}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Articles commandés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{item.name}</h5>
                  <p className="text-sm text-gray-600">
                    {item.quantity} × {item.price.toFixed(2)}€
                  </p>
                </div>
                <p className="font-medium text-gray-900">
                  {(item.price * item.quantity).toFixed(2)}€
                </p>
              </div>
            ))}
            <div className="border-t pt-3">
              <div className="flex justify-between items-center font-medium text-lg">
                <span>Total</span>
                <span>{order.totalAmount.toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestion du statut */}
      {config.nextStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Changer le statut</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="statusNote">Note (optionnelle)</Label>
              <Textarea
                id="statusNote"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Ajouter une note sur ce changement de statut..."
                rows={2}
              />
            </div>
            <Button 
              onClick={() => handleStatusUpdate(config.nextStatus!)}
              disabled={isUpdating}
              className="w-full"
            >
              {isUpdating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Icon className="w-4 h-4 mr-2" />
              )}
              Passer à "{statusConfig[config.nextStatus!].label}"
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notes admin */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notes administrateur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Notes internes pour cette commande..."
            rows={3}
          />
          <Button onClick={handleNotesUpdate} variant="outline">
            Sauvegarder les notes
          </Button>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.timeline.map((step, index) => {
              const stepConfig = statusConfig[step.status];
              const StepIcon = stepConfig.icon;
              
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${stepConfig.color}`}>
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{stepConfig.label}</p>
                    <p className="text-sm text-gray-600">{formatDate(step.date)}</p>
                    {step.note && (
                      <p className="text-sm text-gray-500 mt-1">{step.note}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
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
    validé: orders.filter(o => o.status === 'validé').length,
    en_cours: orders.filter(o => o.status === 'en_cours_creation').length,
    prête: orders.filter(o => o.status === 'prête').length,
    en_livraison: orders.filter(o => o.status === 'en_livraison').length
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Commandes</h1>
          <p className="text-gray-600 mt-2">
            Suivez et gérez toutes vos commandes
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.validé}</p>
              <p className="text-sm text-gray-600">Validées</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.en_cours}</p>
              <p className="text-sm text-gray-600">En création</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.prête}</p>
              <p className="text-sm text-gray-600">Prêtes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.en_livraison}</p>
              <p className="text-sm text-gray-600">En livraison</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher par numéro, nom client, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="validé">Validées</SelectItem>
                    <SelectItem value="en_cours_creation">En création</SelectItem>
                    <SelectItem value="prête">Prêtes</SelectItem>
                    <SelectItem value="en_livraison">En livraison</SelectItem>
                    <SelectItem value="livré">Livrées</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={fetchOrders} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des commandes */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const config = statusConfig[order.status];
            const Icon = config.icon;
            
            return (
              <Card key={order._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Badge className={config.color}>
                          <Icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {order.customerInfo.name} • {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {order.totalAmount.toFixed(2)}€
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.items.length} article(s)
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Action rapide de changement de statut */}
                        {config.nextStatus && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(order._id, config.nextStatus!)}
                          >
                            → {statusConfig[config.nextStatus].label}
                          </Button>
                        )}

                        {/* Menu d'actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => window.open(`mailto:${order.customerInfo.email}`)}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Contacter client
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => window.open(`tel:${order.customerInfo.phone}`)}
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Appeler client
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  {/* Informations rapides */}
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(order.deliveryInfo.date).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center">
                        {order.deliveryInfo.type === 'delivery' ? (
                          <>
                            <MapPin className="w-4 h-4 mr-1" />
                            Livraison
                          </>
                        ) : (
                          <>
                            <Package className="w-4 h-4 mr-1" />
                            Retrait
                          </>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <img
                          key={item._id}
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 rounded-full border-2 border-white object-cover"
                          style={{ zIndex: 3 - index }}
                          title={item.name}
                        />
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune commande trouvée
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Aucune commande ne correspond à vos critères de recherche.'
                  : 'Aucune commande pour le moment.'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Dialog des détails de commande */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Détails de la commande {selectedOrder?.orderNumber}
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <OrderDetails 
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