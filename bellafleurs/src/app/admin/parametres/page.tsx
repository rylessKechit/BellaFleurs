'use client';

import { useState, useEffect } from 'react';
import { 
  Settings,
  Save,
  RefreshCw,
  AlertCircle,
  Upload,
  Trash2,
  Globe,
  Phone,
  MapPin,
  Clock,
  Truck,
  Bell,
  Database
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

// Interface consolidée pour les paramètres de la boutique
interface ShopSettings {
  // Informations générales
  name: string;
  description: string;
  logo?: string;
  favicon?: string;
  
  // Adresse et contact
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp?: string;
  };
  
  // Réseaux sociaux
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  
  // Horaires d'ouverture
  businessHours: {
    [key: string]: {
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    };
  };
  
  // SEO
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  
  // Livraison
  shipping: {
    freeDeliveryThreshold: number;
    deliveryFee: number;
  };
  
  // Notifications
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    orderNotifications: boolean;
  };
  
  // Maintenance
  maintenance: {
    enabled: boolean;
    message: string;
  };
}

// Paramètres par défaut
const initialSettings: ShopSettings = {
  name: 'Bella Fleurs',
  description: 'Créations florales d\'exception à Brétigny-sur-Orge',
  address: {
    street: '',
    city: 'Brétigny-sur-Orge',
    zipCode: '',
    country: 'France'
  },
  contact: {
    email: '',
    phone: ''
  },
  socialMedia: {},
  businessHours: {
    monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    saturday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    sunday: { isOpen: false, openTime: '10:00', closeTime: '16:00' }
  },
  seo: {
    metaTitle: 'Bella Fleurs - Créations Florales d\'Exception',
    metaDescription: 'Découvrez nos créations florales uniques à Brétigny-sur-Orge. Bouquets, compositions et arrangements personnalisés.',
    keywords: ['fleuriste', 'bouquet', 'composition florale', 'Brétigny-sur-Orge']
  },
  shipping: {
    freeDeliveryThreshold: 50,
    deliveryFee: 5,
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    orderNotifications: true,
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

  // Chargement des paramètres (localStorage temporaire)
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Essayer de charger depuis localStorage d'abord
      const savedSettings = localStorage.getItem('bella-fleurs-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...initialSettings, ...parsed });
      }
      
      setHasUnsavedChanges(false);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarde des paramètres (localStorage temporaire)
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
  const handleImageUpload = async (file: File, type: 'logo' | 'favicon') => {
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
        
        {/* Header - Responsive */}
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

        {/* Onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto p-1">
            <TabsTrigger value="general" className="text-xs sm:text-sm py-2">
              <Settings className="w-4 h-4 mr-1 sm:mr-2" />
              <span>Général</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-xs sm:text-sm py-2">
              <Phone className="w-4 h-4 mr-1 sm:mr-2" />
              <span>Contact</span>
            </TabsTrigger>
            <TabsTrigger value="horaires" className="text-xs sm:text-sm py-2">
              <Clock className="w-4 h-4 mr-1 sm:mr-2" />
              <span>Horaires</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="text-xs sm:text-sm py-2">
              <Globe className="w-4 h-4 mr-1 sm:mr-2" />
              <span>SEO</span>
            </TabsTrigger>
            <TabsTrigger value="livraison" className="text-xs sm:text-sm py-2">
              <Truck className="w-4 h-4 mr-1 sm:mr-2" />
              <span>Livraison</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm py-2">
              <Bell className="w-4 h-4 mr-1 sm:mr-2" />
              <span>Notif</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet Général */}
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

                {/* Images */}
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

                {/* Mode maintenance */}
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

          {/* Onglet Contact */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Adresse & Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Adresse */}
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

                {/* Contact */}
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

                {/* Réseaux sociaux */}
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

          {/* Onglet Horaires */}
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

          {/* Onglet SEO */}
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

                {/* Mots-clés SEO */}
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

          {/* Onglet Livraison */}
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Notifications */}
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}