// src/app/api/admin/users/[id]/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return false;
  }
  return true;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!await checkAdminAccess()) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès refusé. Droits administrateur requis.',
          code: 'ACCESS_DENIED'
        }
      }, { status: 403 });
    }

    await connectDB();

    const user = await User.findById(params.id).select('-password').lean();
    
    if (!user) {
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
      data: { user }
    });

  } catch (error: any) {
    console.error('❌ Admin user GET error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération de l\'utilisateur',
        code: 'USER_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!await checkAdminAccess()) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès refusé. Droits administrateur requis.',
          code: 'ACCESS_DENIED'
        }
      }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, role, phone, address } = body;

    await connectDB();

    // Vérifier si l'utilisateur existe
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: params.id } 
      });
      
      if (existingUser) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Cet email est déjà utilisé par un autre utilisateur',
            code: 'EMAIL_ALREADY_USED'
          }
        }, { status: 409 });
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(phone && { phone }),
        ...(address && { address }),
        updatedAt: new Date()
      },
      { 
        new: true,
        runValidators: true 
      }
    ).select('-password').lean();

    return NextResponse.json({
      success: true,
      data: { user: updatedUser }
    });

  } catch (error: any) {
    console.error('❌ Admin user PUT error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour de l\'utilisateur',
        code: 'USER_UPDATE_ERROR'
      }
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!await checkAdminAccess()) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès refusé. Droits administrateur requis.',
          code: 'ACCESS_DENIED'
        }
      }, { status: 403 });
    }

    await connectDB();

    // Vérifier si l'utilisateur existe
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Ne pas permettre de supprimer un admin
    if (user.role === 'admin') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Impossible de supprimer un administrateur',
          code: 'ADMIN_DELETION_FORBIDDEN'
        }
      }, { status: 403 });
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Utilisateur supprimé avec succès'
      }
    });

  } catch (error: any) {
    console.error('❌ Admin user DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la suppression de l\'utilisateur',
        code: 'USER_DELETE_ERROR'
      }
    }, { status: 500 });
  }
}