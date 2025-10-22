// src/app/admin/commandes/page.tsx - Version corrigée avec bouton facture
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
    timeSlot?: string;  // ✅ AJOUTER
    notes?: string;
  };
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  isGift?: boolean;      // ✅ AJOUTER
  giftInfo?: {           // ✅ AJOUTER
    recipientName: string;
    senderName: string;
    message?: string;
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
  // AJOUT: État pour le téléchargement de facture
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState<string | null>(null);

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

  const formatTimeSlot = (timeSlot: string) => {
    const timeSlots = {
      '9h-13h': '9h - 13h (matin)',
      '14h-19h': '14h - 19h (après-midi)'
    };
    return timeSlots[timeSlot as keyof typeof timeSlots] || timeSlot;
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
        toast.success('Statut de la commande mis à jour');
        fetchOrders();
        setSelectedOrder(null);
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  // AJOUT: Fonction pour télécharger la facture côté admin
  const handleDownloadInvoice = async (orderId: string, orderNumber: string) => {
    try {
      setIsDownloadingInvoice(orderId);
      
      const response = await fetch(`/api/admin/orders/${orderId}/invoice`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur lors de la génération de la facture');
      }

      // Récupérer le contenu HTML de la facture
      const htmlContent = await response.text();
      
      // Créer un blob et déclencher le téléchargement
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-admin-${orderNumber}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL
      window.URL.revokeObjectURL(url);
      
      toast.success('Facture téléchargée avec succès !');
      
    } catch (error: any) {
      console.error('Erreur téléchargement facture:', error);
      toast.error(error.message || 'Erreur lors du téléchargement de la facture');
    } finally {
      setIsDownloadingInvoice(null);
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

  // Statistiques
  const stats = {
    payée: orders.filter(o => o.status === 'payée').length,
    en_creation: orders.filter(o => o.status === 'en_creation').length,
    prête: orders.filter(o => o.status === 'prête').length,
    en_livraison: orders.filter(o => o.status === 'en_livraison').length,
    livrée: orders.filter(o => o.status === 'livrée').length
  };

  const getStatusBadge = (status: OrderStatus) => {
    const config = {
      'payée': { label: 'Payée', className: 'bg-green-100 text-green-800' },
      'en_creation': { label: 'En création', className: 'bg-blue-100 text-blue-800' },
      'prête': { label: 'Prête', className: 'bg-orange-100 text-orange-800' },
      'en_livraison': { label: 'En livraison', className: 'bg-purple-100 text-purple-800' },
      'livrée': { label: 'Livrée', className: 'bg-emerald-100 text-emerald-800' },
      'annulée': { label: 'Annulée', className: 'bg-red-100 text-red-800' }
    };

    const statusConfig = config[status] || {
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
              <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.payée}</p>
              <p className="text-xs sm:text-sm text-gray-600">Nouvelles commandes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold text-orange-600">{stats.en_creation}</p>
              <p className="text-xs sm:text-sm text-gray-600">En cours</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.prête}</p>
              <p className="text-xs sm:text-sm text-gray-600">Prêtes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats.en_livraison}</p>
              <p className="text-xs sm:text-sm text-gray-600">En livraison</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold text-pink-600">{stats.livrée}</p>
              <p className="text-xs sm:text-sm text-gray-600">Livrée</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche - RESPONSIVE APPLIQUÉ */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher une commande..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="text-sm sm:text-base">
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
            </div>
          </CardContent>
        </Card>

        {/* Liste des commandes - RESPONSIVE APPLIQUÉ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Commandes ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 sm:py-12 px-4">
                <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-sm sm:text-base text-gray-500">Aucune commande trouvée</p>
              </div>
            ) : (
              <>
                {/* Table responsive pour desktop - RESPONSIVE APPLIQUÉ */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
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
                      {filteredOrders.map((order) => {
                        // AJOUT: Vérifier si cette commande est en cours de téléchargement
                        const isDownloading = isDownloadingInvoice === order._id;
                        
                        return (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {order.orderNumber}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {order.items.length} article{order.items.length > 1 ? 's' : ''}
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.totalAmount.toFixed(2)}€
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(order.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {/* MODIFICATION: Ajout du bouton facture */}
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Voir détails
                                </Button>
                                
                                {order.status === 'livrée' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDownloadInvoice(order._id, order.orderNumber)}
                                    disabled={isDownloading}
                                  >
                                    {isDownloading ? (
                                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <Download className="w-4 h-4 mr-2" />
                                    )}
                                    {isDownloading ? 'Génération...' : 'Facture'}
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Cards pour mobile et tablet - RESPONSIVE APPLIQUÉ */}
                <div className="lg:hidden space-y-3 sm:space-y-4 p-4 sm:p-6">
                  {filteredOrders.map((order) => {
                    // AJOUT: Vérifier si cette commande est en cours de téléchargement
                    const isDownloading = isDownloadingInvoice === order._id;
                    
                    return (
                      <Card key={order._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                                  {order.orderNumber}
                                </h3>
                                {getStatusBadge(order.status)}
                              </div>
                              
                              <div className="space-y-1">
                                <p className="text-sm text-gray-600">
                                  <strong>{order.customerInfo.name}</strong>
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500">
                                  {order.customerInfo.email}
                                </p>
                              </div>

                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">
                                  {order.items.length} article{order.items.length > 1 ? 's' : ''}
                                </span>
                                <span className="font-bold text-green-600">
                                  {order.totalAmount.toFixed(2)}€
                                </span>
                              </div>
                              
                              <p className="text-xs text-gray-500">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            
                            {/* MODIFICATION: Ajout du bouton facture pour mobile */}
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedOrder(order)}
                                className="w-full sm:w-auto"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Voir détails
                              </Button>
                              
                              {order.status === 'livrée' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDownloadInvoice(order._id, order.orderNumber)}
                                  disabled={isDownloading}
                                  className="w-full sm:w-auto"
                                >
                                  {isDownloading ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4 mr-2" />
                                  )}
                                  {isDownloading ? 'Génération...' : 'Facture'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Dialog de détail commande - RESPONSIVE APPLIQUÉ */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Commande {selectedOrder?.orderNumber}
              </DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-4 sm:space-y-6">
                {/* Statut et informations générales - RESPONSIVE APPLIQUÉ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Statut</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {getStatusBadge(selectedOrder.status)}
                        <div className="space-y-2">
                          <Label className="text-sm">Changer le statut :</Label>
                          <Select
                            value={selectedOrder.status}
                            onValueChange={(value) => handleStatusUpdate(selectedOrder._id, value as OrderStatus)}
                          >
                            <SelectTrigger className="text-sm">
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
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Informations client</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{selectedOrder.customerInfo.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{selectedOrder.customerInfo.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{selectedOrder.customerInfo.phone}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Articles commandés - RESPONSIVE APPLIQUÉ */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Articles commandés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={item.image || '/api/placeholder/80/80'}
                            alt={item.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover mx-auto sm:mx-0"
                          />
                          <div className="flex-1 text-center sm:text-left">
                            <h4 className="font-medium text-sm sm:text-base">{item.name}</h4>
                            <p className="text-xs sm:text-sm text-gray-600">Quantité: {item.quantity}</p>
                          </div>
                          <div className="text-center sm:text-right">
                            <p className="font-bold text-sm sm:text-base">{(item.price * item.quantity).toFixed(2)}€</p>
                            <p className="text-xs text-gray-500">{item.price.toFixed(2)}€ x {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border-t pt-3 flex justify-between items-center font-bold text-base sm:text-lg">
                        <span>Total:</span>
                        <span className="text-green-600">{selectedOrder.totalAmount.toFixed(2)}€</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Informations de livraison - RESPONSIVE APPLIQUÉ */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Livraison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Date: {formatDate(selectedOrder.deliveryInfo.date)}</span>
                      </div>
                      
                      {/* ✅ AJOUTER l'affichage du créneau horaire */}
                      {selectedOrder.deliveryInfo.timeSlot && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>Créneau: {formatTimeSlot(selectedOrder.deliveryInfo.timeSlot)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="w-4 h-4 text-gray-500" />
                        <span>Type: {selectedOrder.deliveryInfo.type === 'delivery' ? 'Livraison' : 'Retrait'}</span>
                      </div>
                      {selectedOrder.deliveryInfo.address && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                          <div>
                            <div>{selectedOrder.deliveryInfo.address.street}</div>
                            <div>{selectedOrder.deliveryInfo.address.zipCode} {selectedOrder.deliveryInfo.address.city}</div>
                          </div>
                        </div>
                      )}
                      {selectedOrder.deliveryInfo.notes && (
                        <div className="text-sm">
                          <strong>Notes:</strong> {selectedOrder.deliveryInfo.notes}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* ✅ AJOUTER APRÈS la Card de livraison - Section cadeau */}
                {selectedOrder.isGift && selectedOrder.giftInfo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        🎁 Informations cadeau
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Destinataire:</span>
                          <span className="font-medium">{selectedOrder.giftInfo.recipientName}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Expéditeur:</span>
                          <span className="font-medium">{selectedOrder.giftInfo.senderName}</span>
                        </div>
                        
                        {selectedOrder.giftInfo.message && (
                          <div className="text-sm">
                            <span className="text-gray-500 block mb-2">💌 Message:</span>
                            <div className="bg-pink-50 p-3 rounded border italic text-pink-800 border-pink-200">
                              "{selectedOrder.giftInfo.message}"
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}