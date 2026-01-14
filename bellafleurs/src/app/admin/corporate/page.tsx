// src/app/admin/corporate/page.tsx - Gestion corporate (admin)
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  FileText,
  Package,
  DollarSign,
  Calendar,
  Send,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AdminCorporatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      const user = session.user as any;
      if (user.role !== 'admin') {
        router.push('/');
      } else {
        loadStats();
      }
    }
  }, [status, session]);

  const loadStats = async () => {
    try {
      // Charger les stats des comptes corporate
      const usersRes = await fetch('/api/admin/corporate/users', {
        credentials: 'include'
      });
      const usersData = await usersRes.json();

      // Charger les factures
      const invoicesRes = await fetch('/api/admin/invoices', {
        credentials: 'include'
      });
      const invoicesData = await invoicesRes.json();

      setStats({
        corporateAccounts: usersData.data?.stats?.total || 0,
        activeAccounts: usersData.data?.stats?.active || 0,
        pendingAccounts: usersData.data?.stats?.pending || 0,
        totalInvoices: invoicesData.data?.invoices?.length || 0
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const generateMonthlyInvoices = async () => {
    if (!confirm(`Voulez-vous générer les factures pour ${getMonthName(selectedMonth)} ${selectedYear} ?`)) {
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/admin/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          year: selectedYear,
          month: selectedMonth + 1 // Les mois commencent à 0 en JS
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `✅ ${data.data.results.success} factures créées et envoyées !\n` +
          `⏭️ ${data.data.results.skipped} ignorées\n` +
          `❌ ${data.data.results.errors} erreurs`
        );
        loadStats();
      } else {
        toast.error(data.error?.message || 'Erreur lors de la génération');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la génération des factures');
    } finally {
      setIsGenerating(false);
    }
  };

  const getMonthName = (month: number) => {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return months[month];
  };

  if (status === 'loading' || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
            Gérer les comptes corporate et la facturation mensuelle
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Comptes corporate</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.corporateAccounts}</p>
                </div>
                <Building2 className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Comptes actifs</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeAccounts}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingAccounts}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Factures</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalInvoices}</p>
                </div>
                <FileText className="w-10 h-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Génération factures mensuelles */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Génération des factures mensuelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Générez et envoyez automatiquement les factures mensuelles à tous les comptes corporate.
              </p>

              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mois
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={i}>
                        {getMonthName(i)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {[2024, 2025, 2026].map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={generateMonthlyInvoices}
                  disabled={isGenerating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Génération...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Générer et envoyer
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Comment ça marche ?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Récupère toutes les commandes corporate du mois sélectionné</li>
                  <li>• Génère une facture PDF pour chaque compte</li>
                  <li>• Envoie automatiquement l'email avec la facture au client</li>
                  <li>• Ignore les comptes sans commande ce mois-là</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/admin/clients?tab=corporate')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Gérer les comptes</h3>
                  <p className="text-sm text-gray-600">Voir, modifier, créer des comptes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => window.open('/api/admin/invoices', '_blank')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Toutes les factures</h3>
                  <p className="text-sm text-gray-600">Voir l'historique des factures</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push('/admin/commandes?filter=corporate')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Commandes corporate</h3>
                  <p className="text-sm text-gray-600">Voir toutes les commandes B2B</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info supplémentaire */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Guide rapide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <h4 className="font-medium mb-2">📋 Workflow mensuel :</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>À la fin du mois, sélectionnez le mois écoulé</li>
                  <li>Cliquez sur "Générer et envoyer"</li>
                  <li>Les factures sont créées et envoyées automatiquement</li>
                  <li>Vérifiez les résultats dans la notification</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium mb-2">🔧 Modifier un compte :</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Allez dans "Gérer les comptes"</li>
                  <li>Cliquez sur le compte à modifier</li>
                  <li>Modifiez la limite mensuelle ou suspendez le compte</li>
                  <li>Les changements sont appliqués immédiatement</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
