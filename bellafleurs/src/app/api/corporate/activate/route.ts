// src/app/api/corporate/activate/route.ts - API d'activation comptes B2B
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// GET /api/corporate/activate - Vérifier le token d'activation
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Token d\'activation requis',
          code: 'TOKEN_REQUIRED'
        }
      }, { status: 400 });
    }

    await connectDB();

    // ✅ DEBUG : Log pour vérifier le token reçu
    console.log('🔍 Recherche token d\'activation:', token);

    // Rechercher l'utilisateur avec ce token
    const user = await User.findOne({
      accountType: 'corporate',
      'corporateSettings.activationToken': token,
      'corporateSettings.pendingActivation': true
    });

    // ✅ DEBUG : Log pour voir ce qui est trouvé
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé avec ce token');
      
      // Vérifier s'il y a des utilisateurs corporate en attente
      const pendingUsers = await User.find({
        accountType: 'corporate',
        'corporateSettings.pendingActivation': true
      }).select('email corporateSettings.activationToken');
      
      console.log('👥 Utilisateurs corporate en attente:', pendingUsers.length);
      console.log('🔑 Tokens disponibles:', pendingUsers.map(u => ({
        email: u.email,
        token: u.corporateSettings?.activationToken?.substring(0, 8) + '...'
      })));
    } else {
      console.log('✅ Utilisateur trouvé:', user.email);
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Token d\'activation invalide ou expiré',
          code: 'INVALID_TOKEN'
        }
      }, { status: 404 });
    }

    // Retourner les informations pour l'activation
    return NextResponse.json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          company: user.company
        },
        valid: true
      }
    });

  } catch (error: any) {
    console.error('❌ Corporate activation GET error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la vérification du token',
        code: 'ACTIVATION_CHECK_ERROR'
      }
    }, { status: 500 });
  }
}

// POST /api/corporate/activate - Activer le compte avec mot de passe
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password, confirmPassword } = body;

    // Validation
    if (!token || !password || !confirmPassword) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Token, mot de passe et confirmation requis',
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Les mots de passe ne correspondent pas',
          code: 'PASSWORD_MISMATCH'
        }
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Le mot de passe doit contenir au moins 6 caractères',
          code: 'PASSWORD_TOO_SHORT'
        }
      }, { status: 400 });
    }

    await connectDB();

    // ✅ DEBUG : Log pour vérifier le token reçu
    console.log('🔍 Activation avec token:', token);

    // Rechercher l'utilisateur avec ce token
    const user = await User.findOne({
      accountType: 'corporate',
      'corporateSettings.activationToken': token,
      'corporateSettings.pendingActivation': true
    });

    if (!user) {
      console.log('❌ Token invalide lors de l\'activation');
      return NextResponse.json({
        success: false,
        error: {
          message: 'Token d\'activation invalide ou expiré',
          code: 'INVALID_TOKEN'
        }
      }, { status: 404 });
    }

    console.log('✅ Activation en cours pour:', user.email);

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('🔐 Activation - hashage mot de passe pour:', user.email);
    console.log('🔐 Salt généré, hash créé');

    // ✅ CORRECTION : Utiliser findByIdAndUpdate pour éviter le middleware pre-save
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        password: hashedPassword, // Hash déjà fait, pas de double hashage
        emailVerified: new Date(),
        'corporateSettings.pendingActivation': false,
        'corporateSettings.activatedAt': new Date(),
        $unset: { 'corporateSettings.activationToken': 1 } // Supprimer le token
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Erreur lors de la mise à jour du compte',
          code: 'UPDATE_ERROR'
        }
      }, { status: 500 });
    }

    console.log('✅ Compte corporate activé:', updatedUser.email);

    // Retourner le succès sans données sensibles
    const responseUser = updatedUser.toObject();
    delete responseUser.password;
    delete responseUser.corporateSettings?.activationToken;

    return NextResponse.json({
      success: true,
      data: {
        user: responseUser,
        message: `Compte activé avec succès pour ${updatedUser.company?.name}`
      }
    });

  } catch (error: any) {
    console.error('❌ Corporate activation POST error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de l\'activation du compte',
        code: 'ACTIVATION_ERROR'
      }
    }, { status: 500 });
  }
}