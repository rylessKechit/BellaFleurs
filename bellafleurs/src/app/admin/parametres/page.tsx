// src/app/admin/parametres/page.tsx - Version complète responsive - ADAPTÉE AUX APIs EXISTANTES
'use client';

import { useState, useEffect } from 'react';
import { 
  Settings,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Upload,
  Trash2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Euro,
  Truck,
  Bell,
  Shield,
  Database,
  Palette,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';

// Types simplifiés pour fonctionner avec localStorage et les APIs existantes
interface ShopSettings {
  // Informations de base
  shopName: string;
  shopDescription: string;
  shopLogo?: string;
  shopFavicon?: string;
  
  // Contact & Adresse
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp?: string;
  addressStreet: string;
  addressCity: string;
  addressZipCode: string;
  addressCountry: string;
  
  // Réseaux sociaux
  socialFacebook?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  
  // Horaires (format simple)
  hoursMonday: { open: boolean; start: string; end: string };
  hoursTuesday: { open: boolean; start: string; end: string };
  hoursWednesday: { open: boolean; start: string; end: string };
  hoursThursday: { open: boolean; start: string; end: string };
  hoursFriday: { open: boolean; start: string; end: string };
  hoursSaturday: { open: boolean; start: string; end: string };
  hoursSunday: { open: boolean; start: string; end: string };
  
  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  
  // Livraison
  deliveryFee: number;
  freeDeliveryThreshold: number;
  deliveryZones: string[];
  
  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderNotifications: boolean;
  stockAlerts: boolean;
  
  // Maintenance
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

const defaultSettings: ShopSettings = {
  shopName: 'Bella Fleurs',
  shopDescription: 'Créations florales d\'exception à Brétigny-sur-Orge',
  contactEmail: '',
  contactPhone: '',
  addressStreet: '',
  addressCity: 'Brétigny-sur-Orge',
  addressZipCode: '',
  addressCountry: 'France',
  hoursMonday: { open: true, start: '09:00', end: '18:00' },
  hoursTuesday: { open: true, start: '09:00', end: '18:00' },
  hoursWednesday: { open: true, start: '09:00', end: '18:00' },
  hoursThursday: { open: true, start: '09:00', end: '18:00' },
  hoursFriday: { open: true, start: '09:00', end: '18:00' },
  hoursSaturday: { open: true, start: '09:00', end: '17:00' },
  hoursSunday: { open: false, start: '10:00', end: '16:00' },
  seoTitle: 'Bella Fleurs - Créations Florales d\'Exception',
  seoDescription: 'Découvrez nos créations florales uniques à Brétigny-sur-Orge. Bouquets, compositions et arrangements personnalisés.',
  seoKeywords: ['fleuriste', 'bouquet', 'composition florale', 'Brétigny-sur-Orge'],
  deliveryFee: 10,
  freeDeliveryThreshold: 50,
  deliveryZones: ['Brétigny-sur-Orge', 'Essonne', 'Île-de-France'],
  emailNotifications: true,
  smsNotifications: false,
  orderNotifications: true,
  stockAlerts: true,
  maintenanceMode: false,
  maintenanceMessage: 'Site en maintenance, nous revenons bientôt !'
};

export default function AdminParametresPage() {
  const [settings, setSettings] = useState<ShopSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // États pour les inputs dynamiques
  const [newKeyword, setNewKeyword] = useState('');
  const [newZone, setNewZone] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [settings]);

  // Chargement depuis localStorage (en attendant l'API)
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Essayer de charger depuis localStorage d'abord
      const savedSettings = localStorage.getItem('bella-fleurs-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
      
      setHasUnsavedChanges(false);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarde dans localStorage (en attendant l'API)
  const saveSettings = async () => {
    try {
      setIsSaving(true);
      
      // Sauvegarder dans localStorage
      localStorage.setItem('bella-fleurs-settings', JSON.stringify(settings));
      
      toast.success('Paramètres sauvegardés avec succès');
      setHasUnsavedChanges(false);
      
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setIsSaving(false);
    }
  };

  // Upload d'image via l'API existante
  const handleImageUpload = async (file: File, type: 'shopLogo' | 'shopFavicon') => {
    try {
      const formData = new FormData();
      formData.append('images', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.data.urls[0];
        
        setSettings(prev => ({
          ...prev,
          [type]: imageUrl
        }));
        
        toast.success(`${type === 'shopLogo' ? 'Logo' : 'Favicon'} mis à jour`);
      } else {
        throw new Error('Erreur lors de l\'upload');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !settings.seoKeywords.includes(newKeyword.trim())) {
      setSettings(prev => ({
        ...prev,
        seoKeywords: [...prev.seoKeywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setSettings(prev => ({
      ...prev,
      seoKeywords: prev.seoKeywords.filter(k => k !== keyword)
    }));
  };

  const addDeliveryZone = () => {
    if (newZone.trim() && !settings.deliveryZones.includes(newZone.trim())) {
      setSettings(prev => ({
        ...prev,
        deliveryZones: [...prev.deliveryZones, newZone.trim()]
      }));
      setNewZone('');
    }
  };

  const removeDeliveryZone = (zone: string) => {
    setSettings(prev => ({
      ...prev,
      deliveryZones: prev.deliveryZones.filter(z => z !== zone)
    }));
  };

  const dayNames = {
    Monday: 'Lundi',
    Tuesday: 'Mardi', 
    Wednesday: 'Mercredi',
    Thursday: 'Jeudi',
    Friday: 'Vendredi',
    Saturday: 'Samedi',
    Sunday: 'Dimanche'
  };

  const updateHours = (day: string, field: 'open' | 'start' | 'end', value: boolean | string) => {
    const dayKey = `hours${day}` as keyof ShopSettings;
    setSettings(prev => ({
      ...prev,
      [dayKey]: {
        ...(prev[dayKey] as any),
        [field]: value
      }
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        
        {/* Header - RESPONSIVE APPLIQUÉ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Configurez les paramètres de votre boutique
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="self-start sm:self-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Modifications non sauvegardées
              </Badge>
            )}
            <Button 
              variant="outline" 
              onClick={loadSettings}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button 
              onClick={saveSettings} 
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>

        {/* Info sur le stockage local - RESPONSIVE APPLIQUÉ */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start space-x-3">
              <Database className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 text-sm sm:text-base">Stockage temporaire</h3>
                <p className="text-xs sm:text-sm text-blue-700 mt-1">
                  Les paramètres sont actuellement sauvegardés localement. Une API de configuration sera intégrée prochainement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Onglets - RESPONSIVE APPLIQUÉ */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto p-1">
            <TabsTrigger value="general" className="text-xs sm:text-sm py-2">
              <Settings className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Général</span>
              <span className="sm:hidden">Général</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-xs sm:text-sm py-2">
              <Phone className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Contact</span>
              <span className="sm:hidden">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="horaires" className="text-xs sm:text-sm py-2">
              <Clock className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Horaires</span>
              <span className="sm:hidden">Horaires</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="text-xs sm:text-sm py-2">
              <Globe className="w-4 h-4 mr-1 sm:mr-2" />
              <span>SEO</span>
            </TabsTrigger>
            <TabsTrigger value="livraison" className="text-xs sm:text-sm py-2">
              <Truck className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Livraison</span>
              <span className="sm:hidden">Livraison</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm py-2">
              <Bell className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Notif</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet Général - RESPONSIVE APPLIQUÉ */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="shopName" className="text-sm sm:text-base">Nom de la boutique</Label>
                    <Input
                      id="shopName"
                      value={settings.shopName}
                      onChange={(e) => setSettings(prev => ({ ...prev, shopName: e.target.value }))}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shopDescription" className="text-sm sm:text-base">Description</Label>
                    <Input
                      id="shopDescription"
                      value={settings.shopDescription}
                      onChange={(e) => setSettings(prev => ({ ...prev, shopDescription: e.target.value }))}
                      className="text-sm sm:text-base"
                    />
                  </div>
                </div>

                <Separator />

                {/* Images - RESPONSIVE APPLIQUÉ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label className="text-sm sm:text-base">Logo</Label>
                    <div className="mt-2">
                      {settings.shopLogo ? (
                        <div className="flex items-center gap-3">
                          <img 
                            src={settings.shopLogo} 
                            alt="Logo" 
                            className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-lg border"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSettings(prev => ({ ...prev, shopLogo: undefined }))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                          <div className="flex flex-col items-center justify-center h-full">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">Télécharger le logo</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'shopLogo')}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm sm:text-base">Favicon</Label>
                    <div className="mt-2">
                      {settings.shopFavicon ? (
                        <div className="flex items-center gap-3">
                          <img 
                            src={settings.shopFavicon} 
                            alt="Favicon" 
                            className="h-8 w-8 object-cover rounded border"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSettings(prev => ({ ...prev, shopFavicon: undefined }))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="block w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                          <div className="flex flex-col items-center justify-center h-full">
                            <Upload className="w-6 h-6 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-600">Favicon</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'shopFavicon')}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Mode maintenance - RESPONSIVE APPLIQUÉ */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm sm:text-base font-medium">Mode maintenance</Label>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Activer pour fermer temporairement le site aux visiteurs
                      </p>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        maintenanceMode: checked
                      }))}
                    />
                  </div>
                  
                  {settings.maintenanceMode && (
                    <div>
                      <Label htmlFor="maintenanceMessage" className="text-sm sm:text-base">Message de maintenance</Label>
                      <Textarea
                        id="maintenanceMessage"
                        value={settings.maintenanceMessage}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          maintenanceMessage: e.target.value
                        }))}
                        rows={3}
                        className="text-sm sm:text-base"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Contact - RESPONSIVE APPLIQUÉ */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Adresse & Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Adresse - RESPONSIVE APPLIQUÉ */}
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    Adresse
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="addressStreet" className="text-sm sm:text-base">Adresse</Label>
                      <Input
                        id="addressStreet"
                        value={settings.addressStreet}
                        onChange={(e) => setSettings(prev => ({ ...prev, addressStreet: e.target.value }))}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="addressZipCode" className="text-sm sm:text-base">Code postal</Label>
                        <Input
                          id="addressZipCode"
                          value={settings.addressZipCode}
                          onChange={(e) => setSettings(prev => ({ ...prev, addressZipCode: e.target.value }))}
                          className="text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="addressCity" className="text-sm sm:text-base">Ville</Label>
                        <Input
                          id="addressCity"
                          value={settings.addressCity}
                          onChange={(e) => setSettings(prev => ({ ...prev, addressCity: e.target.value }))}
                          className="text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="addressCountry" className="text-sm sm:text-base">Pays</Label>
                        <Input
                          id="addressCountry"
                          value={settings.addressCountry}
                          onChange={(e) => setSettings(prev => ({ ...prev, addressCountry: e.target.value }))}
                          className="text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact - RESPONSIVE APPLIQUÉ */}
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                    Contact
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactEmail" className="text-sm sm:text-base">Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone" className="text-sm sm:text-base">Téléphone</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={settings.contactPhone}
                        onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contactWhatsapp" className="text-sm sm:text-base">WhatsApp (optionnel)</Label>
                    <Input
                      id="contactWhatsapp"
                      type="tel"
                      value={settings.contactWhatsapp || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, contactWhatsapp: e.target.value }))}
                      className="text-sm sm:text-base"
                    />
                  </div>
                </div>

                <Separator />

                {/* Réseaux sociaux - RESPONSIVE APPLIQUÉ */}
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-medium">Réseaux sociaux</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="socialFacebook" className="text-sm sm:text-base">Facebook</Label>
                      <Input
                        id="socialFacebook"
                        type="url"
                        value={settings.socialFacebook || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, socialFacebook: e.target.value }))}
                        placeholder="https://facebook.com/..."
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="socialInstagram" className="text-sm sm:text-base">Instagram</Label>
                      <Input
                        id="socialInstagram"
                        type="url"
                        value={settings.socialInstagram || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, socialInstagram: e.target.value }))}
                        placeholder="https://instagram.com/..."
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Horaires - RESPONSIVE APPLIQUÉ */}
          <TabsContent value="horaires" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Horaires d'ouverture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(dayNames).map(([dayKey, dayName]) => {
                  const settingsKey = `hours${dayKey}` as keyof ShopSettings;
                  const daySettings = settings[settingsKey] as any;
                  
                  return (
                    <div key={dayKey} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                      <div className="flex items-center justify-between sm:justify-start sm:w-32">
                        <span className="font-medium text-sm sm:text-base">{dayName}</span>
                        <Switch
                          checked={daySettings?.open || false}
                          onCheckedChange={(checked) => updateHours(dayKey, 'open', checked)}
                        />
                      </div>
                      
                      {daySettings?.open && (
                        <div className="flex items-center gap-2 sm:gap-4 flex-1">
                          <div className="flex-1">
                            <Label className="text-xs text-gray-500">Ouverture</Label>
                            <Input
                              type="time"
                              value={daySettings?.start || '09:00'}
                              onChange={(e) => updateHours(dayKey, 'start', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <span className="text-gray-400 pt-5">-</span>
                          <div className="flex-1">
                            <Label className="text-xs text-gray-500">Fermeture</Label>
                            <Input
                              type="time"
                              value={daySettings?.end || '18:00'}
                              onChange={(e) => updateHours(dayKey, 'end', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      )}
                      
                      {!daySettings?.open && (
                        <span className="text-sm text-gray-500 sm:ml-auto">Fermé</span>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet SEO - RESPONSIVE APPLIQUÉ */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Référencement SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div>
                  <Label htmlFor="seoTitle" className="text-sm sm:text-base">Titre Meta</Label>
                  <Input
                    id="seoTitle"
                    value={settings.seoTitle}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      seoTitle: e.target.value
                    }))}
                    maxLength={60}
                    className="text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {settings.seoTitle.length}/60 caractères
                  </p>
                </div>

                <div>
                  <Label htmlFor="seoDescription" className="text-sm sm:text-base">Description Meta</Label>
                  <Textarea
                    id="seoDescription"
                    value={settings.seoDescription}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      seoDescription: e.target.value
                    }))}
                    maxLength={160}
                    rows={3}
                    className="text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {settings.seoDescription.length}/160 caractères
                  </p>
                </div>

                {/* Mots-clés SEO - RESPONSIVE APPLIQUÉ */}
                <div>
                  <Label className="text-sm sm:text-base">Mots-clés SEO</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder="Ajouter un mot-clé"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addKeyword();
                          }
                        }}
                        className="flex-1 text-sm sm:text-base"
                      />
                      <Button onClick={addKeyword} variant="outline" className="w-full sm:w-auto">
                        Ajouter
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {settings.seoKeywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {keyword}
                          <button
                            onClick={() => removeKeyword(keyword)}
                            className="hover:text-red-500 ml-1"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Livraison - RESPONSIVE APPLIQUÉ */}
          <TabsContent value="livraison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Paramètres de livraison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="deliveryFee" className="text-sm sm:text-base">Frais de livraison (€)</Label>
                    <Input
                      id="deliveryFee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.deliveryFee}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        deliveryFee: parseFloat(e.target.value) || 0
                      }))}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="freeDeliveryThreshold" className="text-sm sm:text-base">Livraison gratuite à partir de (€)</Label>
                    <Input
                      id="freeDeliveryThreshold"
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.freeDeliveryThreshold}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        freeDeliveryThreshold: parseFloat(e.target.value) || 0
                      }))}
                      className="text-sm sm:text-base"
                    />
                  </div>
                </div>

                <Separator />

                {/* Zones de livraison - RESPONSIVE APPLIQUÉ */}
                <div>
                  <Label className="text-sm sm:text-base">Zones de livraison</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={newZone}
                        onChange={(e) => setNewZone(e.target.value)}
                        placeholder="Ex: Paris, Île-de-France..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addDeliveryZone();
                          }
                        }}
                        className="flex-1 text-sm sm:text-base"
                      />
                      <Button onClick={addDeliveryZone} variant="outline" className="w-full sm:w-auto">
                        Ajouter
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {settings.deliveryZones.map((zone, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {zone}
                          <button
                            onClick={() => removeDeliveryZone(zone)}
                            className="hover:text-red-500 ml-1"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    {settings.deliveryZones.length === 0 && (
                      <p className="text-sm text-gray-500">Aucune zone de livraison définie</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Notifications - RESPONSIVE APPLIQUÉ */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Paramètres de notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm sm:text-base">Notifications par email</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Recevoir les notifications importantes par email
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        emailNotifications: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm sm:text-base">Notifications SMS</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Recevoir les notifications urgentes par SMS
                      </p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        smsNotifications: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm sm:text-base">Nouvelles commandes</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Être notifié à chaque nouvelle commande
                      </p>
                    </div>
                    <Switch
                      checked={settings.orderNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        orderNotifications: checked
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm sm:text-base">Alertes de stock</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Être alerté quand un produit est en rupture
                      </p>
                    </div>
                    <Switch
                      checked={settings.stockAlerts}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        stockAlerts: checked
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
} '',
    metaDescription: '',
    keywords: []
  },
  shipping: {
    freeDeliveryThreshold: 50,
    deliveryFee: 10,
    deliveryZones: []
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    orderNotifications: true,
    stockAlerts: true
  },
  maintenance: {
    enabled: false,
    message: 'Site en maintenance, nous revenons bientôt !'
  }
};

export default function AdminParametresPage() {
  const [settings, setSettings] = useState<ShopSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // États pour les inputs dynamiques
  const [newKeyword, setNewKeyword] = useState('');
  const [newZone, setNewZone] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [settings]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/settings', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSettings({ ...initialSettings, ...data.data });
        setHasUnsavedChanges(false);
      } else {
        throw new Error('Erreur lors du chargement des paramètres');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('Paramètres sauvegardés avec succès');
        setHasUnsavedChanges(false);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'favicon') => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);

      const response = await fetch('/api/admin/upload/settings', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          [type]: data.data.url
        }));
        toast.success(`${type === 'logo' ? 'Logo' : 'Favicon'} mis à jour`);
      } else {
        throw new Error('Erreur lors de l\'upload');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !settings.seo.keywords.includes(newKeyword.trim())) {
      setSettings(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          keywords: [...prev.seo.keywords, newKeyword.trim()]
        }
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setSettings(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter(k => k !== keyword)
      }
    }));
  };

  const addDeliveryZone = () => {
    if (newZone.trim() && !settings.shipping.deliveryZones.includes(newZone.trim())) {
      setSettings(prev => ({
        ...prev,
        shipping: {
          ...prev.shipping,
          deliveryZones: [...prev.shipping.deliveryZones, newZone.trim()]
        }
      }));
      setNewZone('');
    }
  };

  const removeDeliveryZone = (zone: string) => {
    setSettings(prev => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        deliveryZones: prev.shipping.deliveryZones.filter(z => z !== zone)
      }
    }));
  };

  const dayNames = {
    monday: 'Lundi',
    tuesday: 'Mardi', 
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        
        {/* Header - RESPONSIVE APPLIQUÉ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Configurez les paramètres de votre boutique
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="self-start sm:self-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Modifications non sauvegardées
              </Badge>
            )}
            <Button 
              variant="outline" 
              onClick={fetchSettings}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button 
              onClick={saveSettings} 
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>

        {/* Onglets - RESPONSIVE APPLIQUÉ */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto p-1">
            <TabsTrigger value="general" className="text-xs sm:text-sm py-2">
              <Settings className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Général</span>
              <span className="sm:hidden">Général</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-xs sm:text-sm py-2">
              <Phone className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Contact</span>
              <span className="sm:hidden">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="horaires" className="text-xs sm:text-sm py-2">
              <Clock className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Horaires</span>
              <span className="sm:hidden">Horaires</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="text-xs sm:text-sm py-2">
              <Globe className="w-4 h-4 mr-1 sm:mr-2" />
              <span>SEO</span>
            </TabsTrigger>
            <TabsTrigger value="livraison" className="text-xs sm:text-sm py-2">
              <Truck className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Livraison</span>
              <span className="sm:hidden">Livraison</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm py-2">
              <Bell className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Notif</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet Général - RESPONSIVE APPLIQUÉ */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="name" className="text-sm sm:text-base">Nom de la boutique</Label>
                    <Input
                      id="name"
                      value={settings.name}
                      onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-sm sm:text-base">Description</Label>
                    <Input
                      id="description"
                      value={settings.description}
                      onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                      className="text-sm sm:text-base"
                    />
                  </div>
                </div>

                <Separator />

                {/* Images - RESPONSIVE APPLIQUÉ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label className="text-sm sm:text-base">Logo</Label>
                    <div className="mt-2">
                      {settings.logo ? (
                        <div className="flex items-center gap-3">
                          <img 
                            src={settings.logo} 
                            alt="Logo" 
                            className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-lg border"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSettings(prev => ({ ...prev, logo: undefined }))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                          <div className="flex flex-col items-center justify-center h-full">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">Télécharger le logo</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm sm:text-base">Favicon</Label>
                    <div className="mt-2">
                      {settings.favicon ? (
                        <div className="flex items-center gap-3">
                          <img 
                            src={settings.favicon} 
                            alt="Favicon" 
                            className="h-8 w-8 object-cover rounded border"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSettings(prev => ({ ...prev, favicon: undefined }))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="block w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                          <div className="flex flex-col items-center justify-center h-full">
                            <Upload className="w-6 h-6 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-600">Favicon</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'favicon')}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Mode maintenance - RESPONSIVE APPLIQUÉ */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm sm:text-base font-medium">Mode maintenance</Label>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Activer pour fermer temporairement le site aux visiteurs
                      </p>
                    </div>
                    <Switch
                      checked={settings.maintenance.enabled}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        maintenance: { ...prev.maintenance, enabled: checked }
                      }))}
                    />
                  </div>
                  
                  {settings.maintenance.enabled && (
                    <div>
                      <Label htmlFor="maintenanceMessage" className="text-sm sm:text-base">Message de maintenance</Label>
                      <Textarea
                        id="maintenanceMessage"
                        value={settings.maintenance.message}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          maintenance: { ...prev.maintenance, message: e.target.value }
                        }))}
                        rows={3}
                        className="text-sm sm:text-base"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Contact - RESPONSIVE APPLIQUÉ */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Adresse & Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Adresse - RESPONSIVE APPLIQUÉ */}
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    Adresse
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="street" className="text-sm sm:text-base">Adresse</Label>
                      <Input
                        id="street"
                        value={settings.address.street}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          address: { ...prev.address, street: e.target.value }
                        }))}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="zipCode" className="text-sm sm:text-base">Code postal</Label>
                        <Input
                          id="zipCode"
                          value={settings.address.zipCode}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            address: { ...prev.address, zipCode: e.target.value }
                          }))}
                          className="text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city" className="text-sm sm:text-base">Ville</Label>
                        <Input
                          id="city"
                          value={settings.address.city}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            address: { ...prev.address, city: e.target.value }
                          }))}
                          className="text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country" className="text-sm sm:text-base">Pays</Label>
                        <Input
                          id="country"
                          value={settings.address.country}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            address: { ...prev.address, country: e.target.value }
                          }))}
                          className="text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact - RESPONSIVE APPLIQUÉ */}
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                    Contact
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.contact.email}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          contact: { ...prev.contact, email: e.target.value }
                        }))}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm sm:text-base">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={settings.contact.phone}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          contact: { ...prev.contact, phone: e.target.value }
                        }))}
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="whatsapp" className="text-sm sm:text-base">WhatsApp (optionnel)</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={settings.contact.whatsapp || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        contact: { ...prev.contact, whatsapp: e.target.value }
                      }))}
                      className="text-sm sm:text-base"
                    />
                  </div>
                </div>

                <Separator />

                {/* Réseaux sociaux - RESPONSIVE APPLIQUÉ */}
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-medium">Réseaux sociaux</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="facebook" className="text-sm sm:text-base">Facebook</Label>
                      <Input
                        id="facebook"
                        type="url"
                        value={settings.socialMedia.facebook || ''}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                        }))}
                        placeholder="https://facebook.com/..."
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagram" className="text-sm sm:text-base">Instagram</Label>
                      <Input
                        id="instagram"
                        type="url"
                        value={settings.socialMedia.instagram || ''}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                        }))}
                        placeholder="https://instagram.com/..."
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Horaires - RESPONSIVE APPLIQUÉ */}
          <TabsContent value="horaires" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Horaires d'ouverture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(dayNames).map(([day, dayName]) => (
                  <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                    <div className="flex items-center justify-between sm:justify-start sm:w-32">
                      <span className="font-medium text-sm sm:text-base">{dayName}</span>
                      <Switch
                        checked={settings.businessHours[day]?.isOpen || false}
                        onCheckedChange={(checked) => setSettings(prev => ({
                          ...prev,
                          businessHours: {
                            ...prev.businessHours,
                            [day]: { ...prev.businessHours[day], isOpen: checked }
                          }
                        }))}
                      />
                    </div>
                    
                    {settings.businessHours[day]?.isOpen && (
                      <div className="flex items-center gap-2 sm:gap-4 flex-1">
                        <div className="flex-1">
                          <Label className="text-xs text-gray-500">Ouverture</Label>
                          <Input
                            type="time"
                            value={settings.businessHours[day]?.openTime || '09:00'}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              businessHours: {
                                ...prev.businessHours,
                                [day]: { ...prev.businessHours[day], openTime: e.target.value }
                              }
                            }))}
                            className="text-sm"
                          />
                        </div>
                        <span className="text-gray-400 pt-5">-</span>
                        <div className="flex-1">
                          <Label className="text-xs text-gray-500">Fermeture</Label>
                          <Input
                            type="time"
                            value={settings.businessHours[day]?.closeTime || '18:00'}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              businessHours: {
                                ...prev.businessHours,
                                [day]: { ...prev.businessHours[day], closeTime: e.target.value }
                              }
                            }))}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    )}
                    
                    {!settings.businessHours[day]?.isOpen && (
                      <span className="text-sm text-gray-500 sm:ml-auto">Fermé</span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet SEO - RESPONSIVE APPLIQUÉ */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Référencement SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div>
                  <Label htmlFor="metaTitle" className="text-sm sm:text-base">Titre Meta</Label>
                  <Input
                    id="metaTitle"
                    value={settings.seo.metaTitle}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      seo: { ...prev.seo, metaTitle: e.target.value }
                    }))}
                    maxLength={60}
                    className="text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {settings.seo.metaTitle.length}/60 caractères
                  </p>
                </div>

                <div>
                  <Label htmlFor="metaDescription" className="text-sm sm:text-base">Description Meta</Label>
                  <Textarea
                    id="metaDescription"
                    value={settings.seo.metaDescription}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      seo: { ...prev.seo, metaDescription: e.target.value }
                    }))}
                    maxLength={160}
                    rows={3}
                    className="text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {settings.seo.metaDescription.length}/160 caractères
                  </p>
                </div>

                {/* Mots-clés SEO - RESPONSIVE APPLIQUÉ */}
                <div>
                  <Label className="text-sm sm:text-base">Mots-clés SEO</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder="Ajouter un mot-clé"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addKeyword();
                          }
                        }}
                        className="flex-1 text-sm sm:text-base"
                      />
                      <Button onClick={addKeyword} variant="outline" className="w-full sm:w-auto">
                        Ajouter
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {settings.seo.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {keyword}
                          <button
                            onClick={() => removeKeyword(keyword)}
                            className="hover:text-red-500 ml-1"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Livraison - RESPONSIVE APPLIQUÉ */}
          <TabsContent value="livraison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Paramètres de livraison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="deliveryFee" className="text-sm sm:text-base">Frais de livraison (€)</Label>
                    <Input
                      id="deliveryFee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.shipping.deliveryFee}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        shipping: { ...prev.shipping, deliveryFee: parseFloat(e.target.value) || 0 }
                      }))}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="freeDeliveryThreshold" className="text-sm sm:text-base">Livraison gratuite à partir de (€)</Label>
                    <Input
                      id="freeDeliveryThreshold"
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.shipping.freeDeliveryThreshold}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        shipping: { ...prev.shipping, freeDeliveryThreshold: parseFloat(e.target.value) || 0 }
                      }))}
                      className="text-sm sm:text-base"
                    />
                  </div>
                </div>

                <Separator />

                {/* Zones de livraison - RESPONSIVE APPLIQUÉ */}
                <div>
                  <Label className="text-sm sm:text-base">Zones de livraison</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={newZone}
                        onChange={(e) => setNewZone(e.target.value)}
                        placeholder="Ex: Paris, Île-de-France..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addDeliveryZone();
                          }
                        }}
                        className="flex-1 text-sm sm:text-base"
                      />
                      <Button onClick={addDeliveryZone} variant="outline" className="w-full sm:w-auto">
                        Ajouter
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {settings.shipping.deliveryZones.map((zone, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {zone}
                          <button
                            onClick={() => removeDeliveryZone(zone)}
                            className="hover:text-red-500 ml-1"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    {settings.shipping.deliveryZones.length === 0 && (
                      <p className="text-sm text-gray-500">Aucune zone de livraison définie</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Notifications - RESPONSIVE APPLIQUÉ */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Paramètres de notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm sm:text-base">Notifications par email</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Recevoir les notifications importantes par email
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.emailEnabled}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, emailEnabled: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm sm:text-base">Notifications SMS</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Recevoir les notifications urgentes par SMS
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.smsEnabled}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, smsEnabled: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm sm:text-base">Nouvelles commandes</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Être notifié à chaque nouvelle commande
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.orderNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, orderNotifications: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm sm:text-base">Alertes de stock</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Être alerté quand un produit est en rupture
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.stockAlerts}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, stockAlerts: checked }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}