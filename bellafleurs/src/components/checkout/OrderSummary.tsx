// src/components/checkout/OrderSummary.tsx
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
  timeSlot: string;
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
                <span className="text-green-600">Gratuite</span>
              ) : (
                `${deliveryFee.toFixed(2)}€`
              )}
            </span>
          </div>
          
          <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
            <span>Total</span>
            <span className="text-green-600">{total.toFixed(2)}€</span>
          </div>
        </div>

        {/* Informations saisies */}
        {currentStep > 1 && (customerInfo.firstName || deliveryInfo.date) && (
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <h4 className="font-medium text-gray-900">Informations saisies</h4>
            
            {customerInfo.firstName && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Client</span>
                <span className="text-right">
                  {customerInfo.firstName} {customerInfo.lastName}
                  <br />
                  <span className="text-xs text-gray-500">{customerInfo.email}</span>
                </span>
              </div>
            )}
            
            {currentStep > 2 && deliveryInfo.date && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {deliveryInfo.type === 'delivery' ? 'Livraison' : 'Retrait'}
                </span>
                <span className="text-right">
                  {new Date(deliveryInfo.date).toLocaleDateString('fr-FR')}
                  <br />
                  <span className="text-xs text-gray-500">{deliveryInfo.timeSlot}</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Avantages */}
        <div className="border-t border-gray-200 pt-4">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Fraîcheur garantie
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Livraison soignée
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Paiement sécurisé
            </div>
            {subtotal >= 50 && (
              <div className="flex items-center">
                <span className="text-green-500 mr-2">🎉</span>
                Livraison gratuite !
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}