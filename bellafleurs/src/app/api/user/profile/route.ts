// src/app/api/user/profile/route.ts - API pour récupérer le profil utilisateur complet
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Non authentifié',
          code: 'NOT_AUTHENTICATED'
        }
      }, { status: 401 });
    }

    await connectDB();

    // Récupérer l'utilisateur complet depuis la DB
    const user = await User.findById(session.user.id)
      .select('-password') // Exclure le mot de passe
      .lean();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    console.log('🔍 Profil utilisateur récupéré:', {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      accountType: user.accountType,
      company: user.company
    });

    return NextResponse.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur récupération profil:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération du profil',
        code: 'PROFILE_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}