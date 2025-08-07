import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { registerSchema } from '@/lib/validations';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validatedFields = registerSchema.safeParse(body);
    
    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      return NextResponse.json({
        success: false,
        error: {
          message: 'Données invalides',
          code: 'VALIDATION_ERROR'
        },
        errors: Object.entries(errors).map(([field, messages]) => ({
          field,
          message: messages?.[0] || 'Erreur de validation'
        }))
      } as ApiResponse, { status: 400 });
    }

    const { name, email, password, phone, address } = validatedFields.data;

    // Connexion à la base de données
    await connectDB();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findByEmail(email);
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Un utilisateur avec cet email existe déjà',
          code: 'USER_EXISTS',
          field: 'email'
        }
      } as ApiResponse, { status: 409 });
    }

    // Créer le nouvel utilisateur
    const newUser = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role: 'client', // Par défaut, nouveau utilisateur = client
    });

    console.log('✅ New user registered:', newUser.email);

    // Retourner les données de l'utilisateur (sans le mot de passe)
    const { _id, name: userName, email: userEmail, phone: userPhone, address: userAddress, role } = newUser;
    const userResponse = {
      _id,
      name: userName,
      email: userEmail,
      phone: userPhone,
      address: userAddress,
      role
    };

    return NextResponse.json({
      success: true,
      data: {
        user: userResponse,
        message: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.'
      }
    } as ApiResponse, { status: 201 });

  } catch (error: any) {
    console.error('❌ Registration error:', error);

    // Erreur de validation MongoDB
    if (error.name === 'ValidationError') {
      const errors = Object.entries(error.errors).map(([field, err]: [string, any]) => ({
        field,
        message: err.message
      }));

      return NextResponse.json({
        success: false,
        error: {
          message: 'Erreur de validation',
          code: 'MONGODB_VALIDATION_ERROR'
        },
        errors
      } as ApiResponse, { status: 400 });
    }

    // Erreur de duplicata (email unique)
    if (error.code === 11000 && error.keyPattern?.email) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Un utilisateur avec cet email existe déjà',
          code: 'DUPLICATE_EMAIL',
          field: 'email'
        }
      } as ApiResponse, { status: 409 });
    }

    // Erreur serveur générique
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur serveur lors de la création du compte',
        code: 'INTERNAL_SERVER_ERROR'
      }
    } as ApiResponse, { status: 500 });
  }
}