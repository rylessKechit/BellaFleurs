// src/app/corporate/invoices/[id]/success/page.tsx - Page de succès après paiement
'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';

export default function PaymentSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  const paymentIntent = searchParams.get('payment_intent');
  const alreadyPaid = searchParams.get('already_paid');

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      try {
        // Attendre un peu pour laisser le webhook se déclencher
        if (paymentIntent && !alreadyPaid) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        const response = await fetch(`/api/corporate/invoices/${invoiceId}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || 'Erreur lors de la vérification');
        }

        setInvoice(data.data);
      } catch (err: any) {
        console.error('Erreur:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (paymentIntent || alreadyPaid) {
      verifyPayment();
    } else {
      setError('Aucun paiement détecté');
      setLoading(false);
    }
  }, [invoiceId, paymentIntent, alreadyPaid]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Vérification du paiement...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">Erreur</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/corporate/dashboard')}>
              Retour au dashboard
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Paiement réussi !</h1>
            <p className="text-gray-600">
              Votre facture a été payée avec succès
            </p>
          </div>

          {invoice && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="font-bold text-lg mb-4">Détails de la facture</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Numéro de facture</span>
                  <span className="font-semibold">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Entreprise</span>
                  <span className="font-semibold">{invoice.companyName}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-600">Montant payé</span>
                  <span className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(invoice.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={() => window.open(`/api/corporate/invoices/${invoiceId}/download`, '_blank')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Télécharger la facture PDF
            </Button>

            <Button
              onClick={() => router.push('/corporate/dashboard')}
              variant="outline"
              className="w-full"
            >
              Retour au dashboard
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t text-sm text-gray-500">
            <p>📧 Un email de confirmation vous a été envoyé</p>
            <p className="mt-2">Vous pouvez retrouver toutes vos factures dans votre espace corporate</p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
