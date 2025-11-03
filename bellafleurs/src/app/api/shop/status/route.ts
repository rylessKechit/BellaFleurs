// src/app/api/shop/status/route.ts - VERSION CORRIGÉE
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const settings = await Settings.findOne();
    
    // Si pas de paramètres ou fermeture désactivée
    if (!settings || !settings.shopClosure.isEnabled) {
      return NextResponse.json({
        success: true,
        data: {
          isOpen: true,
          isClosed: false,
          message: null,
          reason: null,
          startDate: null,
          endDate: null
        }
      });
    }

    // Récupérer les dates de fermeture
    const startDate = new Date(settings.shopClosure.startDate);
    const endDate = new Date(settings.shopClosure.endDate);
    
    // Date actuelle en France (UTC+1/+2)
    const now = new Date();
    const franceTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Paris"}));
    
    // Normaliser les dates pour comparaison (début de journée)
    const today = new Date(franceTime);
    today.setHours(0, 0, 0, 0);
    
    const closureStart = new Date(startDate);
    closureStart.setHours(0, 0, 0, 0);
    
    const closureEnd = new Date(endDate);
    closureEnd.setHours(23, 59, 59, 999); // Fin de journée
    
    // Vérifier si nous sommes dans la période de fermeture
    const isClosed = today >= closureStart && today <= closureEnd;

    console.log('🔍 Shop status check:', {
      today: today.toISOString(),
      closureStart: closureStart.toISOString(),
      closureEnd: closureEnd.toISOString(),
      isClosed,
      isEnabled: settings.shopClosure.isEnabled
    });

    return NextResponse.json({
      success: true,
      data: {
        isOpen: !isClosed,
        isClosed,
        reason: settings.shopClosure.reason,
        message: settings.shopClosure.message,
        startDate: settings.shopClosure.startDate,
        endDate: settings.shopClosure.endDate
      }
    });

  } catch (error: any) {
    console.error('❌ Shop status error:', error);
    
    // En cas d'erreur, on laisse ouvert pour ne pas bloquer les commandes
    return NextResponse.json({
      success: true,
      data: {
        isOpen: true,
        isClosed: false,
        message: null,
        reason: null,
        startDate: null,
        endDate: null
      }
    });
  }
}

// Ajout d'une route POST pour forcer la revalidation
export async function POST() {
  try {
    // Cette route peut être appelée pour forcer un refresh du cache
    return NextResponse.json({
      success: true,
      message: 'Status revalidated'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Revalidation failed'
    }, { status: 500 });
  }
}