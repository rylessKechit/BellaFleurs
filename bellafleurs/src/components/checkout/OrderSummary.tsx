// src/components/checkout/OrderSummary.tsx - Version sans timeSlot
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface DeliveryInfo {
  type: 'delivery' | 'pickup';
  date: string;
  notes?: string;
}

interface OrderSummaryProps {
  cartItems: CartItem[];
  customerInfo: CustomerInfo;
  deliveryInfo: DeliveryInfo;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currentStep: number;
}

export default function OrderSummary({
  cartItems,
  customerInfo,
  deliveryInfo,
  subtotal,
  deliveryFee,
  total,
  currentStep
}: OrderSummaryProps) {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Résumé de commande</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Articles */}
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item._id} className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-pink-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">🌸</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </h4>
                <p className="text-sm text-gray-600">
                  Quantité: {item.quantity}
                </p>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {(item.price * item.quantity).toFixed(2)}€
              </div>
            </div>
          ))}
        </div>

        {/* Totaux */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sous-total</span>
            <span className="font-medium">{subtotal.toFixed(2)}€</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Livraison</span>
            <span className="font-medium">
              {deliveryFee === 0 ? (
                <span className="text-green-600">Gratuit</span>
              ) : (
                `${deliveryFee.toFixed(2)}€`
              )}
            </span>
          </div>
          
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span className="text-green-600">{total.toFixed(2)}€</span>
          </div>
        </div>

        {/* Informations saisies selon l'étape */}
        {currentStep >= 2 && customerInfo.firstName && (
          <div className="border-t border-gray-200 pt-4">
            <h5 className="font-medium text-gray-900 mb-2">Informations saisies</h5>
            
            {/* Client */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Client</span>
                <span className="font-medium">{customerInfo.firstName} {customerInfo.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email</span>
                <span className="font-medium truncate ml-2">{customerInfo.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Téléphone</span>
                <span className="font-medium">{customerInfo.phone}</span>
              </div>
            </div>
          </div>
        )}

        {/* Informations de livraison */}
        {currentStep >= 3 && deliveryInfo.date && (
          <div className="border-t border-gray-200 pt-4">
            <h5 className="font-medium text-gray-900 mb-2">Livraison</h5>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mode</span>
                <span className="font-medium">Livraison à domicile</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">
                  {new Date(deliveryInfo.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horaires</span>
                <span className="font-medium">9h - 18h</span>
              </div>
            </div>
          </div>
        )}

        {/* Garanties */}
        <div className="border-t border-gray-200 pt-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-green-600">
              <span className="mr-2">✓</span>
              <span>Fraîcheur garantie</span>
            </div>
            <div className="flex items-center text-green-600">
              <span className="mr-2">✓</span>
              <span>Livraison soignée</span>
            </div>
            <div className="flex items-center text-green-600">
              <span className="mr-2">✓</span>
              <span>Paiement sécurisé</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}