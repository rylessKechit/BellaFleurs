// src/app/corporate/invoices/[id]/pay/page.tsx - Page de paiement Stripe
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

function CheckoutForm({ invoiceId, amount }: { invoiceId: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/corporate/invoices/${invoiceId}/success`,
      },
    });

    if (error) {
      setMessage(error.message || 'Une erreur est survenue');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {message && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {message}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          className="flex-1"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : (
            `Payer ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)}`
          )}
        </Button>
      </div>
    </form>
  );
}

export default function InvoicePaymentPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoice() {
      try {
        const response = await fetch(`/api/corporate/invoices/${invoiceId}/payment-intent`);
        const data = await response.json();

        if (!data.success) {
          // Si la facture est déjà payée, rediriger vers la page de succès
          if (data.error?.code === 'ALREADY_PAID') {
            router.push(`/corporate/invoices/${invoiceId}/success?already_paid=true`);
            return;
          }
          throw new Error(data.error?.message || 'Erreur lors du chargement');
        }

        setClientSecret(data.data.clientSecret);
        setInvoice(data.data.invoice);
      } catch (err: any) {
        console.error('Erreur:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [invoiceId, router]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Chargement...</p>
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
          <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Erreur</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </>
    );
  }

  if (!clientSecret || !invoice) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Facture introuvable</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Paiement de facture</h1>
            <p className="text-gray-600">
              Facture {invoice.invoiceNumber} - {invoice.companyName}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Montant HT</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(invoice.subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">TVA ({invoice.vatRate}%)</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(invoice.vatAmount)}
              </span>
            </div>
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="text-lg font-bold">Total TTC</span>
              <span className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(invoice.totalAmount)}
              </span>
            </div>
          </div>

          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm invoiceId={invoiceId} amount={invoice.totalAmount} />
          </Elements>

          <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
            <p>🔒 Paiement sécurisé par Stripe</p>
            <p className="mt-2">Vos informations bancaires sont protégées</p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
