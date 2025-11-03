// src/components/admin/ShopClosureSettings.tsx - VERSION CORRIGÉE
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarDays, Save, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { revalidateShopStatus } from '@/hooks/useShopStatus';

interface ShopClosureData {
  isEnabled: boolean;
  startDate: string;
  endDate: string;
  reason: string;
  message: string;
}

export default function ShopClosureSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [data, setData] = useState<ShopClosureData>({
    isEnabled: false,
    startDate: '',
    endDate: '',
    reason: 'Congés',
    message: 'Nous sommes actuellement fermés. Les commandes reprendront bientôt !'
  });

  // Charger les paramètres actuels
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings', {
        cache: 'no-cache'
      });
      const result = await response.json();
      
      if (result.success) {
        const closure = result.data.shopClosure;
        setData({
          isEnabled: closure.isEnabled || false,
          startDate: closure.startDate ? new Date(closure.startDate).toISOString().split('T')[0] : '',
          endDate: closure.endDate ? new Date(closure.endDate).toISOString().split('T')[0] : '',
          reason: closure.reason || 'Congés',
          message: closure.message || 'Nous sommes actuellement fermés. Les commandes reprendront bientôt !'
        });
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // Tester le statut actuel
  const testStatus = async () => {
    try {
      setTesting(true);
      const response = await fetch(`/api/shop/status?t=${Date.now()}`, {
        cache: 'no-cache'
      });
      const result = await response.json();
      
      if (result.success) {
        const status = result.data;
        if (status.isOpen) {
          toast.success('✅ Le shop est actuellement OUVERT');
        } else {
          toast.warning(`⚠️ Le shop est actuellement FERMÉ: ${status.reason}`);
        }
      }
    } catch (error) {
      toast.error('Erreur lors du test');
    } finally {
      setTesting(false);
    }
  };

  // Sauvegarder avec revalidation
  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Validation des dates si fermeture activée
      if (data.isEnabled) {
        if (!data.startDate || !data.endDate) {
          toast.error('Les dates de début et fin sont requises');
          return;
        }
        
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        
        if (start >= end) {
          toast.error('La date de fin doit être après la date de début');
          return;
        }
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopClosure: {
            isEnabled: data.isEnabled,
            startDate: data.startDate || undefined,
            endDate: data.endDate || undefined,
            reason: data.reason,
            message: data.message
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('✅ Paramètres sauvegardés !');
        
        // IMPORTANT: Déclencher la revalidation globale
        setTimeout(() => {
          revalidateShopStatus();
          toast.info('🔄 Statut du shop mis à jour sur tout le site');
        }, 500);
        
      } else {
        toast.error(result.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <CalendarDays className="w-5 h-5 mr-2" />
            Fermeture temporaire du shop
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={testStatus}
            disabled={testing}
          >
            {testing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <AlertTriangle className="w-4 h-4 mr-2" />
            )}
            Tester le statut
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Activation/désactivation */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="closure-enabled" className="text-base font-medium">
              Activer la fermeture temporaire
            </Label>
            <p className="text-sm text-gray-600">
              Empêche les nouvelles commandes pendant vos congés
            </p>
          </div>
          <Switch
            id="closure-enabled"
            checked={data.isEnabled}
            onCheckedChange={(checked) => setData(prev => ({ ...prev, isEnabled: checked }))}
          />
        </div>

        {data.isEnabled && (
          <>
            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Date de début</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={data.startDate}
                  onChange={(e) => setData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end-date">Date de fin</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={data.endDate}
                  onChange={(e) => setData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Raison */}
            <div>
              <Label htmlFor="reason">Raison de la fermeture</Label>
              <Input
                id="reason"
                value={data.reason}
                onChange={(e) => setData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Ex: Congés, Maintenance, Événement..."
              />
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message">Message affiché aux clients</Label>
              <Textarea
                id="message"
                value={data.message}
                onChange={(e) => setData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Message qui sera affiché sur le site..."
                rows={3}
              />
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={loadSettings}
            disabled={loading || saving}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}