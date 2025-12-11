// Composant pour les informations spécifiques aux arrangements funéraires
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Flower } from "lucide-react";

interface DeuilInfo {
  isDeuil: boolean;
  defuntName: string;
  condolenceMessage: string;
  senderName: string;
}

interface DeuilValidationErrors {
  defuntName?: string;
  senderName?: string;
  condolenceMessage?: string;
}

interface DeuilFormProps {
  deuilInfo: DeuilInfo;
  setDeuilInfo: React.Dispatch<React.SetStateAction<DeuilInfo>>;
  customerName: string; // Pour pré-remplir le nom de l'expéditeur
  errors?: DeuilValidationErrors;
  isVisible: boolean;
}

export default function DeuilForm({ 
  deuilInfo, 
  setDeuilInfo, 
  customerName,
  errors = {},
  isVisible 
}: DeuilFormProps) {
  
  if (!isVisible) return null;

  return (
    <Card className="border-2 border-gray-300 bg-gray-50">
      <CardHeader className="bg-gray-100 border-b border-gray-200">
        <CardTitle className="flex items-center text-gray-800">
          <Heart className="w-5 h-5 mr-2 text-gray-600" />
          Informations pour l'arrangement funéraire
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Ces informations apparaîtront sur la carte d'accompagnement
        </p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Nom du défunt - OBLIGATOIRE */}
        <div>
          <Label htmlFor="defuntName" className="text-gray-700 font-medium">
            Nom du défunt *
          </Label>
          <Input
            id="defuntName"
            value={deuilInfo.defuntName}
            onChange={(e) => setDeuilInfo(prev => ({
              ...prev,
              defuntName: e.target.value
            }))}
            className={`mt-2 ${errors.defuntName ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            placeholder="Nom et prénom du défunt"
          />
          {errors.defuntName && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
              {errors.defuntName}
            </p>
          )}
        </div>

        {/* Message de condoléances - OBLIGATOIRE */}
        <div>
          <Label htmlFor="condolenceMessage" className="text-gray-700 font-medium">
            Message de condoléances *
          </Label>
          <Textarea
            id="condolenceMessage"
            value={deuilInfo.condolenceMessage}
            onChange={(e) => setDeuilInfo(prev => ({
              ...prev,
              condolenceMessage: e.target.value
            }))}
            className={`mt-2 resize-none ${errors.condolenceMessage ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            placeholder="Votre message de condoléances..."
            maxLength={500}
            rows={4}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              Ce message apparaîtra sur la carte accompagnant l'arrangement floral
            </p>
            <span className="text-xs text-gray-400">
              {deuilInfo.condolenceMessage.length}/500
            </span>
          </div>
          {errors.condolenceMessage && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
              {errors.condolenceMessage}
            </p>
          )}
        </div>

        {/* Message d'information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Flower className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 font-medium mb-1">
                Préparation avec soin
              </p>
              <p className="text-xs text-blue-700">
                Nos arrangements funéraires sont préparés avec le plus grand respect et accompagnés 
                d'une carte élégante portant votre message de condoléances.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}