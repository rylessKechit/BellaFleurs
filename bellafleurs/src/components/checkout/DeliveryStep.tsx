// src/components/checkout/DeliveryStep.tsx
'use client';

import { Truck, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DeliveryInfo {
  type: 'delivery' | 'pickup';
  address?: {
    street: string;
    city: string;
    zipCode: string;
    complement?: string;
  };
  date: string;
  timeSlot: string;
  notes?: string;
}

interface DeliveryStepProps {
  deliveryInfo: DeliveryInfo;
  setDeliveryInfo: (info: DeliveryInfo) => void;
  errors: Record<string, string>;
  subtotal: number;
}

const timeSlots = ['9h-12h', '12h-14h', '14h-17h', '17h-19h'];

export default function DeliveryStep({
  deliveryInfo,
  setDeliveryInfo,
  errors,
  subtotal
}: DeliveryStepProps) {
  return (
    <Card>
      <CardContent className="space-y-6">
        
        {/* Type de livraison */}
        <div>
          <Label className="text-base font-medium">Mode de réception *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <button
              type="button"
              onClick={() => setDeliveryInfo({...deliveryInfo, type: 'delivery'})}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                deliveryInfo.type === 'delivery' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <Truck className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium">Livraison à domicile</span>
              </div>
              <p className="text-sm text-gray-600">
                {subtotal >= 50 ? 'Gratuite' : '8,90€'} • 24-48h
              </p>
            </button>
            
            <button
              type="button"
              onClick={() => setDeliveryInfo({...deliveryInfo, type: 'pickup'})}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                deliveryInfo.type === 'pickup' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <Store className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium">Retrait en boutique</span>
              </div>
              <p className="text-sm text-gray-600">
                Gratuit • Prêt en 2h
              </p>
            </button>
          </div>
        </div>

        {/* Adresse de livraison */}
        {deliveryInfo.type === 'delivery' && (
          <div className="space-y-4">
            <h3 className="font-medium">Adresse de livraison</h3>
            <div>
              <Label htmlFor="street">Adresse *</Label>
              <Input
                id="street"
                value={deliveryInfo.address?.street || ''}
                onChange={(e) => setDeliveryInfo({
                  ...deliveryInfo,
                  address: {...deliveryInfo.address!, street: e.target.value}
                })}
                className={errors.street ? 'border-red-300' : ''}
                placeholder="123 Rue de la Paix"
              />
              {errors.street && <p className="text-red-600 text-sm mt-1">{errors.street}</p>}
            </div>
            
            <div>
              <Label htmlFor="complement">Complément d'adresse</Label>
              <Input
                id="complement"
                value={deliveryInfo.address?.complement || ''}
                onChange={(e) => setDeliveryInfo({
                  ...deliveryInfo,
                  address: {...deliveryInfo.address!, complement: e.target.value}
                })}
                placeholder="Appartement, étage, code..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zipCode">Code postal *</Label>
                <Input
                  id="zipCode"
                  value={deliveryInfo.address?.zipCode || ''}
                  onChange={(e) => setDeliveryInfo({
                    ...deliveryInfo,
                    address: {...deliveryInfo.address!, zipCode: e.target.value}
                  })}
                  className={errors.zipCode ? 'border-red-300' : ''}
                  placeholder="75001"
                />
                {errors.zipCode && <p className="text-red-600 text-sm mt-1">{errors.zipCode}</p>}
              </div>
              <div>
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  value={deliveryInfo.address?.city || ''}
                  onChange={(e) => setDeliveryInfo({
                    ...deliveryInfo,
                    address: {...deliveryInfo.address!, city: e.target.value}
                  })}
                  className={errors.city ? 'border-red-300' : ''}
                  placeholder="Paris"
                />
                {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Date et heure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={deliveryInfo.date}
              onChange={(e) => setDeliveryInfo({...deliveryInfo, date: e.target.value})}
              className={errors.date ? 'border-red-300' : ''}
              min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            />
            {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
          </div>
          
          <div>
            <Label htmlFor="timeSlot">Créneau horaire *</Label>
            <select
              id="timeSlot"
              value={deliveryInfo.timeSlot}
              onChange={(e) => setDeliveryInfo({...deliveryInfo, timeSlot: e.target.value})}
              className={`w-full px-3 py-2 border rounded-md ${errors.timeSlot ? 'border-red-300' : 'border-gray-300'}`}
            >
              <option value="">Sélectionnez un créneau</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
            {errors.timeSlot && <p className="text-red-600 text-sm mt-1">{errors.timeSlot}</p>}
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Instructions spéciales</Label>
          <textarea
            id="notes"
            value={deliveryInfo.notes || ''}
            onChange={(e) => setDeliveryInfo({...deliveryInfo, notes: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Informations complémentaires pour la livraison..."
          />
        </div>
      </CardContent>
    </Card>dHeader>
        <CardTitle className="flex items-center">
          <Truck className="w-5 h-5 mr-2" />
          Livraison
        </CardTitle>
      </CardHeader>
      <Car