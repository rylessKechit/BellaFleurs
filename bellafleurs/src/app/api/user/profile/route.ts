// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Non authentifié',
          code: 'UNAUTHORIZED'
        }
      }, { status: 401 });
    }

    const userId = (session.user as any).id;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'ID utilisateur manquant',
          code: 'MISSING_USER_ID'
        }
      }, { status: 400 });
    }

    // Connexion à la base de données
    await connectDB();

    // Récupérer l'utilisateur complet (sans le mot de passe)
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Retourner le profil utilisateur
    const userProfile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      image: user.image,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json({
      success: true,
      data: userProfile
    });

  } catch (error) {
    console.error('❌ Erreur récupération profil:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur serveur lors de la récupération du profil',
        code: 'INTERNAL_SERVER_ERROR'
      }
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Non authentifié',
          code: 'UNAUTHORIZED'
        }
      }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    // Connexion à la base de données
    await connectDB();

    // Données autorisées à être mises à jour
    const allowedUpdates = {
      name: body.name,
      phone: body.phone,
      address: body.address
    };

    // Supprimer les champs undefined
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key as keyof typeof allowedUpdates] === undefined) {
        delete allowedUpdates[key as keyof typeof allowedUpdates];
      }
    });

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      allowedUpdates,
      { 
        new: true, 
        runValidators: true,
        select: '-password'
      }
    );

    if (!updatedUser) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profil mis à jour avec succès'
    });

  } catch (error: any) {
    console.error('❌ Erreur mise à jour profil:', error);
    
    // Erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message
      }));

      return NextResponse.json({
        success: false,
        error: {
          message: 'Données invalides',
          code: 'VALIDATION_ERROR'
        },
        errors: validationErrors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur serveur lors de la mise à jour du profil',
        code: 'INTERNAL_SERVER_ERROR'
      }
    }, { status: 500 });
  }
}