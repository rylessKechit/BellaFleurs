'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShopClosureSettings from '@/components/admin/ShopClosureSettings';
import { Settings, Calendar } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminParametresPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600">Gestion des paramètres de la boutique</p>
        </div>

        <Tabs defaultValue="fermeture" className="space-y-6">
          <TabsList>
            <TabsTrigger value="fermeture" className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Fermeture temporaire
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Général
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fermeture">
            <ShopClosureSettings />
          </TabsContent>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres généraux</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Autres paramètres à venir...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}