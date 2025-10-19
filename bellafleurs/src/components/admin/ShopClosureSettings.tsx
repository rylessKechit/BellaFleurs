'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarDays, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

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
  const [data, setData] = useState<ShopClosureData>({
    isEnabled: false,
    startDate: '',
    endDate: '',
    reason: 'Congés',
    message: 'Nous sommes actuellement fermés. Les commandes reprendront bientôt !'
  });

  // Charger les paramètres actuels
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/admin/settings');
        const result = await response.json();
        
        if (result.success) {
          const closure = result.data.shopClosure;
          setData({
            isEnabled: closure.isEnabled,
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
    }

    loadSettings();
  }, []);

  // Sauvegarder
  const handleSave = async () => {
    setSaving(true);
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopClosure: {
            isEnabled: data.isEnabled,
            startDate: data.startDate,
            endDate: data.endDate,
            reason: data.reason,
            message: data.message
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Paramètres sauvegardés !');
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
        <CardTitle className="flex items-center">
          <CalendarDays className="w-5 h-5 mr-2" />
          Fermeture temporaire du shop
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
                placeholder="Ex: Congés, Formation, Événement..."
              />
            </div>

            {/* Message personnalisé */}
            <div>
              <Label htmlFor="message">Message affiché aux clients</Label>
              <Textarea
                id="message"
                value={data.message}
                onChange={(e) => setData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Message qui sera affiché sur la page de checkout"
                rows={3}
              />
            </div>

            {/* Alerte */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Attention : La fermeture sera active immédiatement
                  </p>
                  <p className="text-sm text-yellow-700">
                    Les clients ne pourront plus passer de commandes pendant cette période.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Bouton de sauvegarde */}
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
        </Button>
      </CardContent>
    </Card>
  );
}