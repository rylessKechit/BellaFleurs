// src/app/api/admin/users/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès refusé. Droits administrateur requis.',
          code: 'ACCESS_DENIED'
        }
      }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Construction de la requête
    const query: any = {};
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Tri
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password') // Exclure le mot de passe
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    // Calculer les statistiques
    const stats = await Promise.all([
      User.countDocuments({}), // Total utilisateurs
      User.countDocuments({ role: 'client' }), // Total clients
      User.countDocuments({ role: 'admin' }), // Total admins
      User.countDocuments({ 
        createdAt: { 
          $gte: new Date(new Date().setDate(new Date().getDate() - 30)) 
        } 
      }) // Nouveaux utilisateurs (30 derniers jours)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        },
        stats: {
          totalUsers: stats[0],
          totalClients: stats[1],
          totalAdmins: stats[2],
          newUsersThisMonth: stats[3]
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Admin users GET error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des utilisateurs',
        code: 'USERS_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès refusé. Droits administrateur requis.',
          code: 'ACCESS_DENIED'
        }
      }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, role, password, phone, address } = body;

    // Validation basique
    if (!name || !email || !password || !role) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Nom, email, mot de passe et rôle requis',
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    await connectDB();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Un utilisateur avec cet email existe déjà',
          code: 'USER_EXISTS'
        }
      }, { status: 409 });
    }

    // Créer le nouvel utilisateur
    const newUser = new User({
      name,
      email,
      password, // Le modèle se charge du hashage
      role,
      phone,
      address
    });

    await newUser.save();

    // Retourner l'utilisateur sans le mot de passe
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      data: {
        user: userResponse
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Admin users POST error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la création de l\'utilisateur',
        code: 'USER_CREATION_ERROR'
      }
    }, { status: 500 });
  }
}