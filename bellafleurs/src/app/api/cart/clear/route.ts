// src/app/api/cart/clear/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/cart/clear - Vider le panier
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const sessionId = session?.user?.id || request.cookies.get('cart_session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Session introuvable',
          code: 'NO_SESSION'
        }
      }, { status: 400 });
    }

    cartStore.set(sessionId, []);

    return NextResponse.json({
      success: true,
      message: 'Panier vidé'
    });

  } catch (error: any) {
    console.error('❌ Cart CLEAR error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la suppression du panier',
        code: 'CART_CLEAR_ERROR'
      }
    }, { status: 500 });
  }
}