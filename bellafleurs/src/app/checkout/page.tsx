'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  User, 
  Mail, 
  Phone,
  AlertCircle,
  Loader2,
  Package
} from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

// INTERFACE MISE À JOUR AVEC VARIANTS
interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  // NOUVEAU : Support variants
  variantId?: string;
  variantName?: string;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface DeliveryAddress {
  street: string;
  city: string;
  zipCode: string;
  complement?: string;
}

interface DeliveryInfo {
  address: DeliveryAddress;
  date: string;
  notes?: string;
}

interface OrderData {
  items: {
    product: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    // NOUVEAU : Support variants dans les commandes
    variantId?: string;
    variantName?: string;
  }[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  deliveryInfo: {
    type: 'delivery';
    address: DeliveryAddress;
    date: Date;
    notes?: string;
  };
  paymentMethod: 'card';
  totalAmount: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  
  // États
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');

  // Informations client
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  // Informations livraison
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    address: {
      street: '',
      city: '',
      zipCode: '',
      complement: ''
    },
    date: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Charger le panier
  useEffect(() => {
    loadCartData();
  }, []);

  const loadCartData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.data.items || []);
      } else {
        throw new Error('Erreur chargement panier');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement du panier');
      router.push('/panier');
    } finally {
      setLoading(false);
    }
  };

  // Calculs totaux
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 5.00;
  const total = subtotal + deliveryFee;

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validation client
    if (!customerInfo.firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!customerInfo.lastName.trim()) newErrors.lastName = 'Nom requis';
    if (!customerInfo.email.trim()) newErrors.email = 'Email requis';
    if (!customerInfo.phone.trim()) newErrors.phone = 'Téléphone requis';

    // Validation email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (customerInfo.email && !emailRegex.test(customerInfo.email)) {
      newErrors.email = 'Format email invalide';
    }

    // Validation livraison
    if (!deliveryInfo.address.street.trim()) newErrors.street = 'Adresse requise';
    if (!deliveryInfo.address.city.trim()) newErrors.city = 'Ville requise';
    if (!deliveryInfo.address.zipCode.trim()) newErrors.zipCode = 'Code postal requis';
    if (!deliveryInfo.date) newErrors.date = 'Date de livraison requise';

    // Validation date future
    if (deliveryInfo.date) {
      const selectedDate = new Date(deliveryInfo.date);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (selectedDate < tomorrow) {
        newErrors.date = 'Date minimum: demain';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Créer Payment Intent avec métadonnées variants
  const createPaymentIntent = async (): Promise<boolean> => {
    if (!orderDataForPayment) return false;

    try {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderDataForPayment)
      });

      const result = await response.json();

      if (result.success) {
        setPaymentIntentId(result.data.paymentIntent.id);
        setClientSecret(result.data.paymentIntent.client_secret);
        return true;
      } else {
        throw new Error(result.error?.message || 'Erreur création paiement');
      }
    } catch (error: any) {
      console.error('Erreur Payment Intent:', error);
      toast.error(error.message || 'Erreur lors de la préparation du paiement');
      return false;
    }
  };

  // DONNÉES COMMANDE AVEC VARIANTS
  const orderDataForPayment = useMemo((): OrderData | null => {
    if (!deliveryInfo.address.street || !deliveryInfo.date) {
      return null;
    }

    return {
      items: cartItems.map(item => ({
        product: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        // NOUVEAU : Inclure les données variants
        variantId: item.variantId,
        variantName: item.variantName
      })),
      customerInfo: {
        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        email: customerInfo.email,
        phone: customerInfo.phone
      },
      deliveryInfo: {
        type: 'delivery',
        address: deliveryInfo.address,
        date: new Date(deliveryInfo.date),
        notes: deliveryInfo.notes
      },
      paymentMethod: 'card',
      totalAmount: total
    };
  }, [cartItems, customerInfo, deliveryInfo, total]);

  // Composant formulaire de paiement
  const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!stripe || !elements || !validateForm()) return;

      setProcessing(true);
      
      try {
        // Créer Payment Intent si pas encore fait
        if (!clientSecret) {
          const created = await createPaymentIntent();
          if (!created) {
            setProcessing(false);
            return;
          }
        }

        // Confirmer le paiement
        const { error: paymentError } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/commande/confirmation?payment_intent=${paymentIntentId}`,
          }
        });

        if (paymentError) {
          console.error('Erreur paiement:', paymentError);
          toast.error(paymentError.message || 'Erreur lors du paiement');
        }
      } catch (error: any) {
        console.error('Erreur checkout:', error);
        toast.error('Erreur lors du paiement');
      } finally {
        setProcessing(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <PaymentElement />
        
        <Button 
          type="submit" 
          className="w-full py-6 text-lg"
          disabled={!stripe || processing || !orderDataForPayment}
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Traitement en cours...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Payer {total.toFixed(2)}€
            </>
          )}
        </Button>
      </form>
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Chargement du checkout...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-2xl font-bold mb-4">Panier vide</h1>
            <p className="text-gray-600 mb-8">Votre panier est vide. Ajoutez des produits avant de commander.</p>
            <Button onClick={() => router.push('/produits')}>
              Continuer mes achats
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Finaliser ma commande</h1>
            <p className="text-gray-600">Vérifiez vos informations et procédez au paiement</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Formulaires */}
            <div className="space-y-6">
              
              {/* Informations client */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informations personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={customerInfo.firstName}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={customerInfo.lastName}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Informations livraison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Informations de livraison
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="street">Adresse *</Label>
                    <Input
                      id="street"
                      value={deliveryInfo.address.street}
                      onChange={(e) => setDeliveryInfo(prev => ({
                        ...prev,
                        address: { ...prev.address, street: e.target.value }
                      }))}
                      className={errors.street ? 'border-red-500' : ''}
                    />
                    {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="complement">Complément d'adresse</Label>
                    <Input
                      id="complement"
                      value={deliveryInfo.address.complement}
                      onChange={(e) => setDeliveryInfo(prev => ({
                        ...prev,
                        address: { ...prev.address, complement: e.target.value }
                      }))}
                      placeholder="Appartement, étage, etc."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Ville *</Label>
                      <Input
                        id="city"
                        value={deliveryInfo.address.city}
                        onChange={(e) => setDeliveryInfo(prev => ({
                          ...prev,
                          address: { ...prev.address, city: e.target.value }
                        }))}
                        className={errors.city ? 'border-red-500' : ''}
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Code postal *</Label>
                      <Input
                        id="zipCode"
                        value={deliveryInfo.address.zipCode}
                        onChange={(e) => setDeliveryInfo(prev => ({
                          ...prev,
                          address: { ...prev.address, zipCode: e.target.value }
                        }))}
                        className={errors.zipCode ? 'border-red-500' : ''}
                      />
                      {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="date">Date de livraison souhaitée *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={deliveryInfo.date}
                      min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      onChange={(e) => setDeliveryInfo(prev => ({ ...prev, date: e.target.value }))}
                      className={errors.date ? 'border-red-500' : ''}
                    />
                    {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Instructions de livraison</Label>
                    <Textarea
                      id="notes"
                      value={deliveryInfo.notes}
                      onChange={(e) => setDeliveryInfo(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Code de portail, étage, instructions spéciales..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Paiement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Paiement sécurisé
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CheckoutForm />
                    </Elements>
                  )}
                  
                  {!clientSecret && (
                    <Button 
                      onClick={createPaymentIntent}
                      className="w-full py-6 text-lg"
                      disabled={!orderDataForPayment}
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Continuer vers le paiement
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Récapitulatif commande */}
            <div className="lg:sticky lg:top-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Récapitulatif de commande
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Items du panier avec variants */}
                  <div className="space-y-3">
                    {cartItems.map((item, index) => (
                      <div key={`${item._id}-${item.variantId || 'default'}`} className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-b-0">
                        <img
                          src={item.image || '/api/placeholder/60/60'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 line-clamp-2">
                            {item.name}
                          </h4>
                          
                          {/* NOUVEAU : Affichage variant */}
                          {item.variantName && (
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.variantName}
                              </Badge>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-600">Qté: {item.quantity}</span>
                            <span className="font-medium">{(item.price * item.quantity).toFixed(2)}€</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totaux */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span>{subtotal.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Livraison</span>
                      <span>{deliveryFee.toFixed(2)}€</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{total.toFixed(2)}€</span>
                    </div>
                  </div>

                  {/* Infos livraison */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <Truck className="w-4 h-4" />
                      <span className="font-medium">Livraison gratuite dès 50€</span>
                    </div>
                    <p className="text-sm text-green-600">
                      Livraison en 24-48h dans un rayon de 30km
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}