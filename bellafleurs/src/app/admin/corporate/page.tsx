// src/app/admin/corporate/page.tsx - Gestion corporate (admin) - Nouvelle version
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  FileText,
  Send,
  Mail,
  Calendar,
  TrendingUp,
  Download,
  CreditCard,
  Users,
  DollarSign,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  RefreshCw,
  Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';

interface CorporateUser {
  _id: string;
  name: string;
  email: string;
  company: {
    name: string;
    siret?: string;
    address?: string;
    vatNumber?: string;
  };
  corporateSettings: {
    monthlyLimit: number;
    activatedAt: Date;
  };
  suspended: boolean;
  createdAt: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  totalAmount: number;
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  status: string;
  billingPeriod: {
    month: number;
    year: number;
  };
  createdAt: string;
  paidAt?: string;
  dueDate?: string;
  stripePaymentIntentId?: string;
  items: {
    orderId: string;
    orderNumber: string;
    orderDate: Date;
    amount: number;
    description: string;
  }[];
}

interface MonthlyStats {
  ordersCount: number;
  totalAmount: number;
  invoice?: Invoice;
}

export default function AdminCorporatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<CorporateUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<CorporateUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentMonthStats, setCurrentMonthStats] = useState<MonthlyStats | null>(null);
  const [previousInvoices, setPreviousInvoices] = useState<Invoice[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [sendingInvoice, setSendingInvoice] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      const user = session.user as any;
      if (user.role !== 'admin') {
        router.push('/');
      } else {
        loadCorporateUsers();
      }
    }
  }, [status, session]);

  const loadCorporateUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/corporate/users', {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users || []);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      toast.error('Erreur lors du chargement des comptes');
    } finally {
      setLoading(false);
    }
  };

  const openUserModal = async (user: CorporateUser) => {
    setSelectedUser(user);
    setModalOpen(true);
    setLoadingStats(true);

    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const ordersRes = await fetch(
        `/api/admin/orders?userId=${user._id}&month=${currentMonth}&year=${currentYear}`,
        { credentials: 'include' }
      );
      const ordersData = await ordersRes.json();

      const invoicesRes = await fetch(
        `/api/admin/invoices?userId=${user._id}`,
        { credentials: 'include' }
      );
      const invoicesData = await invoicesRes.json();

      const allInvoices = invoicesData.data?.invoices || [];
      const currentInvoice = allInvoices.find(
        (inv: Invoice) =>
          inv.billingPeriod.month === currentMonth &&
          inv.billingPeriod.year === currentYear
      );

      const currentOrders = ordersData.data?.orders || [];
      const corporateOrders = currentOrders.filter(
        (order: any) => order.paymentMethod === 'corporate_monthly'
      );

      setCurrentMonthStats({
        ordersCount: corporateOrders.length,
        totalAmount: corporateOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0),
        invoice: currentInvoice
      });

      const previousInvs = allInvoices
        .filter((inv: Invoice) =>
          !(inv.billingPeriod.month === currentMonth && inv.billingPeriod.year === currentYear)
        )
        .sort((a: Invoice, b: Invoice) => {
          if (a.billingPeriod.year !== b.billingPeriod.year) {
            return b.billingPeriod.year - a.billingPeriod.year;
          }
          return b.billingPeriod.month - a.billingPeriod.month;
        });

      setPreviousInvoices(previousInvs);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoadingStats(false);
    }
  };

  const generateCurrentMonthInvoice = async () => {
    if (!selectedUser) return;

    try {
      setGeneratingInvoice(true);
      const now = new Date();
      const response = await fetch('/api/admin/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: selectedUser._id,
          month: now.getMonth() + 1,
          year: now.getFullYear()
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Facture générée et envoyée avec succès !');
        openUserModal(selectedUser);
      } else {
        toast.error(data.error?.message || 'Erreur lors de la génération');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la génération de la facture');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const resendInvoice = async (invoice: Invoice) => {
    if (!selectedUser) return;

    try {
      setSendingInvoice(invoice._id);
      const response = await fetch('/api/admin/invoices/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          invoiceId: invoice._id,
          userId: selectedUser._id
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Facture renvoyée par email !');
      } else {
        toast.error(data.error?.message || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'envoi de la facture');
    } finally {
      setSendingInvoice(null);
    }
  };

  const markInvoiceAsPaid = async (invoiceId: string) => {
    if (!confirm('Confirmer que cette facture est payée ?')) return;

    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid', paidDate: new Date().toISOString() }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Facture marquée comme payée !');
        if (selectedUser) openUserModal(selectedUser);
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      paid: { label: 'Payée', className: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle2 },
      pending: { label: 'En attente', className: 'bg-orange-100 text-orange-800 border-orange-300', icon: Clock },
      overdue: { label: 'En retard', className: 'bg-red-100 text-red-800 border-red-300', icon: AlertCircle },
      cancelled: { label: 'Annulée', className: 'bg-gray-100 text-gray-800 border-gray-300', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.className} border flex items-center gap-1 px-2 py-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getMonthName = (monthIndex: number) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[monthIndex];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading || status === 'loading') {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Building2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Comptes Corporate</h1>
              <p className="text-sm text-gray-500">{users.length} compte{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}</p>
            </div>
          </div>

          <Button
            onClick={loadCorporateUsers}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total comptes</p>
                  <p className="text-3xl font-bold text-blue-900">{users.length}</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-full">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Comptes actifs</p>
                  <p className="text-3xl font-bold text-green-900">
                    {users.filter(u => !u.suspended).length}
                  </p>
                </div>
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Ce mois-ci</p>
                  <p className="text-3xl font-bold text-purple-900">
                    <FileText className="w-8 h-8 inline mr-2" />
                  </p>
                </div>
                <div className="bg-purple-100 p-4 rounded-full">
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Liste des comptes corporate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Aucun compte corporate</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <Card
                    key={user._id}
                    className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-green-500"
                    onClick={() => openUserModal(user)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <Building2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-900">
                                {user.company.name}
                              </h3>
                              <p className="text-sm text-gray-600">{user.name} • {user.email}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-1">SIRET</p>
                              <p className="font-semibold text-sm text-gray-900">
                                {user.company.siret || 'N/A'}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-1">Limite mensuelle</p>
                              <p className="font-semibold text-sm text-gray-900">
                                {formatCurrency(user.corporateSettings.monthlyLimit)}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-1">Activé le</p>
                              <p className="font-semibold text-sm text-gray-900">
                                {formatDate(user.corporateSettings.activatedAt)}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-1">Statut</p>
                              {user.suspended ? (
                                <Badge className="bg-red-100 text-red-800">Suspendu</Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800">Actif</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm" className="ml-4">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* MODAL DÉTAILS */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="bg-green-100 p-2 rounded-lg">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              {selectedUser?.company.name}
            </DialogTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {selectedUser?.email}
              </span>
              <span>•</span>
              <span>{selectedUser?.name}</span>
            </div>
          </DialogHeader>

          {loadingStats ? (
            <div className="py-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
              <p className="text-gray-600">Chargement des données...</p>
            </div>
          ) : (
            <div className="space-y-6 mt-6">
              {/* Informations entreprise */}
              <Card className="border-gray-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Informations de l'entreprise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Raison sociale</p>
                      <p className="font-semibold">{selectedUser?.company.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">SIRET</p>
                      <p className="font-semibold">{selectedUser?.company.siret || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">N° TVA</p>
                      <p className="font-semibold">{selectedUser?.company.vatNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Adresse</p>
                      <p className="font-semibold">{selectedUser?.company.address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Limite mensuelle</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(selectedUser?.corporateSettings.monthlyLimit || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Activé depuis</p>
                      <p className="font-semibold">
                        {formatDate(selectedUser?.corporateSettings.activatedAt || new Date())}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mois en cours */}
              <div>
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-green-600" />
                  Mois en cours - {getMonthName(new Date().getMonth())} {new Date().getFullYear()}
                </h3>

                {/* Stats du mois */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 mb-1">Commandes</p>
                          <p className="text-3xl font-bold text-blue-900">
                            {currentMonthStats?.ordersCount || 0}
                          </p>
                        </div>
                        <Package className="w-10 h-10 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 mb-1">Montant total</p>
                          <p className="text-3xl font-bold text-green-900">
                            {formatCurrency(currentMonthStats?.totalAmount || 0)}
                          </p>
                        </div>
                        <DollarSign className="w-10 h-10 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Facture du mois en cours */}
                {currentMonthStats?.invoice ? (
                  <Card className={`border-2 ${
                    currentMonthStats.invoice.status === 'paid'
                      ? 'border-green-500 bg-green-50'
                      : 'border-orange-500 bg-orange-50'
                  }`}>
                    <CardContent className="p-6">
                      <div className="space-y-5">
                        {/* En-tête facture */}
                        <div className="flex items-start justify-between pb-4 border-b-2 border-gray-200">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <FileText className="w-6 h-6 text-gray-700" />
                              <h4 className="text-xl font-bold text-gray-900">
                                {currentMonthStats.invoice.invoiceNumber}
                              </h4>
                            </div>
                            <p className="text-sm text-gray-600">
                              Émise le {formatDate(currentMonthStats.invoice.createdAt)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {currentMonthStats.invoice.items?.length || 0} commande(s) incluse(s)
                            </p>
                          </div>
                          {getStatusBadge(currentMonthStats.invoice.status)}
                        </div>

                        {/* Détails montants */}
                        <div className="bg-white rounded-xl p-5 border-2 border-gray-200">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Montant HT</span>
                              <span className="font-semibold text-lg">
                                {formatCurrency(currentMonthStats.invoice.subtotal || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">
                                TVA ({currentMonthStats.invoice.vatRate || 20}%)
                              </span>
                              <span className="font-semibold text-lg">
                                {formatCurrency(currentMonthStats.invoice.vatAmount || 0)}
                              </span>
                            </div>
                            <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
                              <span className="font-bold text-gray-900 text-lg">Total TTC</span>
                              <span className="font-bold text-2xl text-gray-900">
                                {formatCurrency(currentMonthStats.invoice.totalAmount)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Statut paiement */}
                        {currentMonthStats.invoice.status === 'paid' && currentMonthStats.invoice.paidAt ? (
                          <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-6 h-6 text-green-600" />
                              <div>
                                <p className="font-bold text-green-900">Facture payée</p>
                                <p className="text-sm text-green-700">
                                  Le {new Date(currentMonthStats.invoice.paidAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-orange-100 border-2 border-orange-300 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Clock className="w-6 h-6 text-orange-600" />
                                <div>
                                  <p className="font-bold text-orange-900">En attente de paiement</p>
                                  {currentMonthStats.invoice.dueDate && (
                                    <p className="text-sm text-orange-700">
                                      Échéance: {formatDate(currentMonthStats.invoice.dueDate)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => markInvoiceAsPaid(currentMonthStats.invoice!._id)}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Marquer payée
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => window.open(`/api/corporate/invoices/${currentMonthStats.invoice!._id}/download`, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger PDF
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => resendInvoice(currentMonthStats.invoice!)}
                            disabled={sendingInvoice === currentMonthStats.invoice._id}
                          >
                            {sendingInvoice === currentMonthStats.invoice._id ? (
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4 mr-2" />
                            )}
                            Renvoyer par email
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-2 border-dashed border-gray-300">
                    <CardContent className="p-8 text-center">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Aucune facture générée pour ce mois</p>
                      <Button
                        onClick={generateCurrentMonthInvoice}
                        disabled={generatingInvoice || (currentMonthStats?.ordersCount || 0) === 0}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {generatingInvoice ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Génération en cours...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Générer et envoyer la facture
                          </>
                        )}
                      </Button>
                      {(currentMonthStats?.ordersCount || 0) === 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Aucune commande ce mois-ci
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Historique */}
              <div>
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-gray-600" />
                  Historique des factures ({previousInvoices.length})
                </h3>

                {previousInvoices.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucune facture précédente</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {previousInvoices.map((invoice) => (
                      <Card
                        key={invoice._id}
                        className={`border-2 transition-all hover:shadow-lg ${
                          invoice.status === 'paid'
                            ? 'border-green-300 bg-green-50/30'
                            : 'border-orange-300 bg-orange-50/30'
                        }`}
                      >
                        <CardContent className="p-5">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <h4 className="font-bold text-lg text-gray-900">
                                    {invoice.invoiceNumber}
                                  </h4>
                                  {getStatusBadge(invoice.status)}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {getMonthName(invoice.billingPeriod.month - 1)} {invoice.billingPeriod.year}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {invoice.items?.length || 0} commande(s)
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-2xl text-gray-900">
                                  {formatCurrency(invoice.totalAmount)}
                                </p>
                                <p className="text-xs text-gray-500">TTC</p>
                              </div>
                            </div>

                            {invoice.status === 'paid' && invoice.paidAt ? (
                              <div className="bg-green-100 border border-green-200 rounded-lg px-4 py-2">
                                <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Payée le {formatDate(invoice.paidAt)}
                                </p>
                              </div>
                            ) : (
                              <div className="bg-orange-100 border border-orange-200 rounded-lg px-4 py-2 flex items-center justify-between">
                                <p className="text-sm font-medium text-orange-800 flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  En attente de paiement
                                </p>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => markInvoiceAsPaid(invoice._id)}
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Marquer payée
                                </Button>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 h-9"
                                onClick={() => window.open(`/api/corporate/invoices/${invoice._id}/download`, '_blank')}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                PDF
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 h-9"
                                onClick={() => resendInvoice(invoice)}
                                disabled={sendingInvoice === invoice._id}
                              >
                                {sendingInvoice === invoice._id ? (
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Mail className="w-4 h-4 mr-2" />
                                )}
                                Renvoyer
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
