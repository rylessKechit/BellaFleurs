import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';

export async function GET() {
  try {
    await connectDB();
    
    const settings = await Settings.findOne();
    
    if (!settings || !settings.shopClosure.isEnabled) {
      return NextResponse.json({
        success: true,
        data: {
          isOpen: true,
          message: null
        }
      });
    }

    const now = new Date();
    const startDate = settings.shopClosure.startDate;
    const endDate = settings.shopClosure.endDate;

    // Vérifier si nous sommes dans la période de fermeture
    const isClosed = now >= startDate && now <= endDate;

    return NextResponse.json({
      success: true,
      data: {
        isOpen: !isClosed,
        isClosed,
        reason: settings.shopClosure.reason,
        message: settings.shopClosure.message,
        startDate,
        endDate
      }
    });

  } catch (error: any) {
    console.error('❌ Shop status error:', error);
    return NextResponse.json({
      success: true,
      data: {
        isOpen: true, // En cas d'erreur, on laisse ouvert
        message: null
      }
    });
  }
}