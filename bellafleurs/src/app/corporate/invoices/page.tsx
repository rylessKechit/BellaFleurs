// src/app/corporate/invoices/page.tsx - Liste des factures corporate
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  period: {
    start: string;
    end: string;
  };
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentTerm: string;
  totalHT: number;
  totalTTC: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }>;
}

interface Stats {
  total: number;
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
}

export default function CorporateInvoicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      const user = session.user as any;
      if (user.accountType !== 'corporate') {
        router.push('/mon-compte');
      } else {
        fetchInvoices();
      }
    }
  }, [status, session, page, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/corporate/invoices?${queryParams}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des factures');
      }

      const data = await response.json();
      if (data.success) {
        setInvoices(data.data.invoices);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des factures');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      draft: { className: 'bg-gray-100 text-gray-800', label: 'Brouillon' },
      sent: { className: 'bg-blue-100 text-blue-800', label: 'Envoyée' },
      paid: { className: 'bg-green-100 text-green-800', label: 'Payée' },
      overdue: { className: 'bg-red-100 text-red-800', label: 'En retard' },
      cancelled: { className: 'bg-gray-100 text-gray-600', label: 'Annulée' }
    };
    const variant = variants[status] || variants.draft;
    return (
      <Badge className={variant.className}>
        {variant.label}
      </Badge>
    );
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
      month: 'long',
      day: 'numeric'
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
        <Footer />
      </>
    );
  }

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
                  <FileText className="w-8 h-8 text-blue-600" />
                  Factures
                </h1>
                <p className="text-gray-600 mt-1">
                  Historique de vos factures mensuelles
                </p>
              </div>
              <Link href="/corporate/dashboard">
                <Button variant="outline">
                  Retour au dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistiques */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total factures</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Payées</p>
                      <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total payé</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(stats.totalPaid)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">En attente</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {formatCurrency(stats.totalPending)}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filtres */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Filtrer par statut:</span>
                </div>
                <div className="flex gap-2">
                  {['all', 'sent', 'paid', 'overdue'].map((filter) => (
                    <Button
                      key={filter}
                      variant={statusFilter === filter ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setStatusFilter(filter);
                        setPage(1);
                      }}
                    >
                      {filter === 'all' && 'Toutes'}
                      {filter === 'sent' && 'Envoyées'}
                      {filter === 'paid' && 'Payées'}
                      {filter === 'overdue' && 'En retard'}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des factures */}
          {invoices.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune facture
                </h3>
                <p className="text-gray-600">
                  Vos factures mensuelles apparaîtront ici
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {invoice.invoiceNumber}
                          </h3>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Date d'émission:</span>{' '}
                            {formatDate(invoice.invoiceDate)}
                          </div>
                          <div>
                            <span className="font-medium">Date d'échéance:</span>{' '}
                            {formatDate(invoice.dueDate)}
                          </div>
                          <div>
                            <span className="font-medium">Période:</span>{' '}
                            {new Date(invoice.period.start).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-6">
                          <div>
                            <span className="text-sm text-gray-600">Total HT:</span>{' '}
                            <span className="font-semibold">{formatCurrency(invoice.totalHT)}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Total TTC:</span>{' '}
                            <span className="font-bold text-lg text-green-600">
                              {formatCurrency(invoice.totalTTC)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link href={`/corporate/invoices/${invoice._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Voir
                          </Button>
                        </Link>
                        <a
                          href={`/api/corporate/invoices/${invoice._id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Précédent
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {page} sur {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
