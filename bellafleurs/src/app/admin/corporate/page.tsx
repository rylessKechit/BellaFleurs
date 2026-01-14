// src/app/admin/corporate/page.tsx - Gestion corporate (admin)
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  X,
  Mail,
  Calendar,
  TrendingUp,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface CorporateUser {
  _id: string;
  name: string;
  email: string;
  company: {
    name: string;
    siret?: string;
  };
  corporateSettings: {
    monthlyLimit: number;
    activatedAt: Date;
  };
  suspended: boolean;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  billingPeriod: {
    month: number;
    year: number;
  };
  createdAt: string;
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
      // Charger les stats du mois en cours
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Récupérer les commandes du mois en cours
      const ordersRes = await fetch(
        `/api/admin/orders?userId=${user._id}&month=${currentMonth}&year=${currentYear}`,
        { credentials: 'include' }
      );
      const ordersData = await ordersRes.json();

      // Récupérer toutes les factures de l'utilisateur
      const invoicesRes = await fetch(
        `/api/admin/invoices?userId=${user._id}`,
        { credentials: 'include' }
      );
      const invoicesData = await invoicesRes.json();

      const allInvoices = invoicesData.data?.invoices || [];

      // Facture du mois en cours
      const currentInvoice = allInvoices.find(
        (inv: Invoice) =>
          inv.billingPeriod.month === currentMonth &&
          inv.billingPeriod.year === currentYear
      );

      // Calculer les stats du mois en cours
      const currentOrders = ordersData.data?.orders || [];
      const corporateOrders = currentOrders.filter(
        (order: any) => order.paymentMethod === 'corporate_monthly'
      );

      setCurrentMonthStats({
        ordersCount: corporateOrders.length,
        totalAmount: corporateOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0),
        invoice: currentInvoice
      });

      // Factures des mois précédents
      const previousInvs = allInvoices.filter(
        (inv: Invoice) =>
          !(inv.billingPeriod.month === currentMonth && inv.billingPeriod.year === currentYear)
      );
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

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    if (!confirm(`Générer la facture de ${getMonthName(month - 1)} ${year} pour ${selectedUser.company.name} ?`)) {
      return;
    }

    setGeneratingInvoice(true);
    try {
      const response = await fetch('/api/admin/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          year,
          month,
          userId: selectedUser._id
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Facture générée et envoyée avec succès !');
        // Recharger les stats
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

    if (!confirm(`Renvoyer la facture ${invoice.invoiceNumber} à ${selectedUser.email} ?`)) {
      return;
    }

    setSendingInvoice(invoice._id);
    try {
      // TODO: Créer une route API pour renvoyer une facture
      const response = await fetch(`/api/admin/invoices/${invoice._id}/resend`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Facture renvoyée avec succès !');
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

  const getMonthName = (month: number) => {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return months[month];
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
      sent: { label: 'Envoyée', color: 'bg-blue-100 text-blue-800' },
      paid: { label: 'Payée', color: 'bg-green-100 text-green-800' },
      overdue: { label: 'En retard', color: 'bg-red-100 text-red-800' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            Gestion Corporate B2B
          </h1>
          <p className="text-gray-600 mt-1">
            Cliquez sur un compte pour gérer sa facturation
          </p>
        </div>

        {/* Liste des comptes corporate */}
        <Card>
          <CardHeader>
            <CardTitle>Comptes Corporate ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucun compte corporate trouvé</p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => openUserModal(user)}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{user.company.name}</h3>
                        <p className="text-sm text-gray-600">{user.name} • {user.email}</p>
                        {user.company.siret && (
                          <p className="text-xs text-gray-500">SIRET: {user.company.siret}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Limite mensuelle</p>
                        <p className="font-semibold text-gray-900">
                          {user.corporateSettings.monthlyLimit.toLocaleString('fr-FR')} €
                        </p>
                      </div>
                      {user.suspended ? (
                        <Badge className="bg-red-100 text-red-800">Suspendu</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">Actif</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de gestion d'un compte */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                {selectedUser?.company.name}
              </DialogTitle>
            </DialogHeader>

            {loadingStats ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats du mois en cours */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Mois en cours - {getMonthName(new Date().getMonth())} {new Date().getFullYear()}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Commandes</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {currentMonthStats?.ordersCount || 0}
                            </p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Montant total</p>
                            <p className="text-2xl font-bold text-green-600">
                              {(currentMonthStats?.totalAmount || 0).toFixed(2)} €
                            </p>
                          </div>
                          <FileText className="w-8 h-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {currentMonthStats?.invoice ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-green-900">
                            Facture {currentMonthStats.invoice.invoiceNumber}
                          </p>
                          <p className="text-sm text-green-700">
                            Montant: {currentMonthStats.invoice.totalAmount.toFixed(2)} €
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(currentMonthStats.invoice.status)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resendInvoice(currentMonthStats.invoice!)}
                            disabled={sendingInvoice === currentMonthStats.invoice._id}
                          >
                            {sendingInvoice === currentMonthStats.invoice._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            ) : (
                              <>
                                <Mail className="w-4 h-4 mr-1" />
                                Renvoyer
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={generateCurrentMonthInvoice}
                      disabled={generatingInvoice || (currentMonthStats?.ordersCount || 0) === 0}
                      className="w-full"
                    >
                      {generatingInvoice ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Génération...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Générer et envoyer la facture du mois
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Factures des mois précédents */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Mois précédents ({previousInvoices.length} factures)
                  </h3>

                  {previousInvoices.length === 0 ? (
                    <p className="text-center text-gray-500 py-6">Aucune facture précédente</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {previousInvoices.map((invoice) => (
                        <div
                          key={invoice._id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <p className="font-semibold text-gray-900">
                                {invoice.invoiceNumber}
                              </p>
                              {getStatusBadge(invoice.status)}
                            </div>
                            <p className="text-sm text-gray-600">
                              {getMonthName(invoice.billingPeriod.month - 1)} {invoice.billingPeriod.year}
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {invoice.totalAmount.toFixed(2)} €
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/api/corporate/invoices/${invoice._id}/download`, '_blank')}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resendInvoice(invoice)}
                              disabled={sendingInvoice === invoice._id}
                            >
                              {sendingInvoice === invoice._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              ) : (
                                <>
                                  <Mail className="w-4 h-4 mr-1" />
                                  Renvoyer
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
