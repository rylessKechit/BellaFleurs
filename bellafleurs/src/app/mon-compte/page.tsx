// src/app/mon-compte/page.tsx
'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Bell, CreditCard, Gift, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  preferences: {
    newsletter: boolean;
    sms: boolean;
    emailPromotions: boolean;
  };
  memberSince: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
}

// Mock user data
const mockUserProfile: UserProfile = {
  name: 'Marie Dubois',
  email: 'marie.dubois@email.com',
  phone: '01 23 45 67 89',
  address: {
    street: '123 Rue de la Paix',
    city: 'Paris',
    zipCode: '75001',
    country: 'France'
  },
  preferences: {
    newsletter: true,
    sms: false,
    emailPromotions: true
  },
  memberSince: '2023-03-15',
  totalOrders: 12,
  totalSpent: 456.80,
  loyaltyPoints: 245
};

const recentOrders = [
  {
    id: 'BF-20241210-0003',
    date: '10 décembre 2024',
    status: 'delivered',
    total: 65.90,
    items: 2
  },
  {
    id: 'BF-20241201-0012',
    date: '1 décembre 2024',
    status: 'delivered',
    total: 45.90,
    items: 1
  },
  {
    id: 'BF-20241120-0008',
    date: '20 novembre 2024',
    status: 'delivered',
    total: 89.50,
    items: 3
  }
];

export default function MonComptePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile);
  const [isEditing, setIsEditing] = useState({
    personal: false,
    address: false,
    preferences: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (section: keyof typeof isEditing) => {
    setIsLoading(true);
    
    try {
      // Simulation de la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(prev => ({ ...prev, [section]: false }));
      console.log(`Section ${section} saved:`, profile);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (section: keyof typeof isEditing) => {
    setIsEditing(prev => ({ ...prev, [section]: false }));
    // Reset to original values (in a real app, you'd keep original state)
    setProfile(mockUserProfile);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      delivered: 'bg-green-100 text-green-800',
      preparing: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      delivered: 'Livrée',
      preparing: 'En préparation',
      cancelled: 'Annulée'
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <ProtectedRoute requireAuth>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mon compte
            </h1>
            <p className="text-gray-600">
              Gérez vos informations personnelles et vos préférences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sidebar - Statistiques */}
            <div className="space-y-6">
              
              {/* Carte de bienvenue */}
              <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold">
                        {profile.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{profile.name}</h2>
                      <p className="text-green-100">
                        Membre depuis {new Date(profile.memberSince).toLocaleDateString('fr-FR', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques */}
              <Card>
                <CardHeader>
                  <CardTitle>Vos statistiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Commandes</span>
                    <span className="font-bold text-lg">{profile.totalOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total dépensé</span>
                    <span className="font-bold text-lg text-green-600">
                      {profile.totalSpent.toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Points fidélité</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {profile.loyaltyPoints} pts
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Programme fidélité */}
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-800">
                    <Gift className="w-5 h-5 mr-2" />
                    Programme fidélité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-yellow-700">Vos points</span>
                      <span className="font-bold text-yellow-800">{profile.loyaltyPoints}</span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(profile.loyaltyPoints % 500) / 5}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-yellow-700">
                      {500 - (profile.loyaltyPoints % 500)} points pour obtenir une réduction de 25€
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Informations personnelles */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Informations personnelles
                    </CardTitle>
                    {!isEditing.personal ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditing(prev => ({ ...prev, personal: true }))}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button 
                          size="sm"
                          onClick={() => handleSave('personal')}
                          disabled={isLoading}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Sauvegarder
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancel('personal')}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom complet</Label>
                      {isEditing.personal ? (
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => setProfile({...profile, name: e.target.value})}
                        />
                      ) : (
                        <p className="py-2 text-gray-900">{profile.name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      {isEditing.personal ? (
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({...profile, email: e.target.value})}
                        />
                      ) : (
                        <p className="py-2 text-gray-900">{profile.email}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    {isEditing.personal ? (
                      <Input
                        id="phone"
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      />
                    ) : (
                      <p className="py-2 text-gray-900">{profile.phone}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Adresse */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Adresse de livraison
                    </CardTitle>
                    {!isEditing.address ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditing(prev => ({ ...prev, address: true }))}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button 
                          size="sm"
                          onClick={() => handleSave('address')}
                          disabled={isLoading}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Sauvegarder
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancel('address')}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="street">Adresse</Label>
                    {isEditing.address ? (
                      <Input
                        id="street"
                        value={profile.address.street}
                        onChange={(e) => setProfile({
                          ...profile, 
                          address: {...profile.address, street: e.target.value}
                        })}
                      />
                    ) : (
                      <p className="py-2 text-gray-900">{profile.address.street}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">Code postal</Label>
                      {isEditing.address ? (
                        <Input
                          id="zipCode"
                          value={profile.address.zipCode}
                          onChange={(e) => setProfile({
                            ...profile, 
                            address: {...profile.address, zipCode: e.target.value}
                          })}
                        />
                      ) : (
                        <p className="py-2 text-gray-900">{profile.address.zipCode}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="city">Ville</Label>
                      {isEditing.address ? (
                        <Input
                          id="city"
                          value={profile.address.city}
                          onChange={(e) => setProfile({
                            ...profile, 
                            address: {...profile.address, city: e.target.value}
                          })}
                        />
                      ) : (
                        <p className="py-2 text-gray-900">{profile.address.city}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Préférences */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Préférences de communication
                    </CardTitle>
                    {!isEditing.preferences ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditing(prev => ({ ...prev, preferences: true }))}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button 
                          size="sm"
                          onClick={() => handleSave('preferences')}
                          disabled={isLoading}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Sauvegarder
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancel('preferences')}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.preferences.newsletter}
                        onChange={(e) => setProfile({
                          ...profile,
                          preferences: {...profile.preferences, newsletter: e.target.checked}
                        })}
                        disabled={!isEditing.preferences}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Newsletter hebdomadaire</span>
                        <p className="text-sm text-gray-600">Recevez nos conseils floraux et nouveautés</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.preferences.emailPromotions}
                        onChange={(e) => setProfile({
                          ...profile,
                          preferences: {...profile.preferences, emailPromotions: e.target.checked}
                        })}
                        disabled={!isEditing.preferences}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Offres spéciales</span>
                        <p className="text-sm text-gray-600">Soyez informé(e) de nos promotions exclusives</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.preferences.sms}
                        onChange={(e) => setProfile({
                          ...profile,
                          preferences: {...profile.preferences, sms: e.target.checked}
                        })}
                        disabled={!isEditing.preferences}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Notifications SMS</span>
                        <p className="text-sm text-gray-600">Recevez des SMS pour le suivi de vos commandes</p>
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Commandes récentes */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Commandes récentes</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/mes-commandes">Voir toutes</a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-medium text-gray-900">{order.id}</span>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{order.date}</span>
                            <span>{order.items} article{order.items > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-green-600">
                            {order.total.toFixed(2)}€
                          </div>
                          <Button variant="outline" size="sm" className="mt-2">
                            Détails
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sécurité */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Sécurité du compte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Mot de passe</h4>
                      <p className="text-sm text-gray-600">Dernière modification il y a 3 mois</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Changer
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Authentification à deux facteurs</h4>
                      <p className="text-sm text-gray-600">Sécurisez davantage votre compte</p>
                    </div>
                    <Badge variant="secondary">Désactivée</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Suppression du compte */}
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800">Zone dangereuse</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-900">Supprimer mon compte</h4>
                      <p className="text-sm text-red-700">
                        Cette action est irréversible et supprimera toutes vos données
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}