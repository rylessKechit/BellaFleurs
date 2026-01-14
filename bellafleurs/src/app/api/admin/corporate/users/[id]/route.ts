// src/app/api/admin/corporate/users/[id]/route.ts - Gestion d'un compte corporate (admin)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET - Récupérer les détails d'un compte corporate
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Authentification requise',
          code: 'AUTH_REQUIRED'
        }
      }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    const user = session.user as any;
    if (user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès réservé aux administrateurs',
          code: 'FORBIDDEN'
        }
      }, { status: 403 });
    }

    await connectDB();

    const corporateUser = await User.findById(params.id)
      .select('-password')
      .lean();

    if (!corporateUser) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Utilisateur introuvable',
          code: 'USER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    if (corporateUser.accountType !== 'corporate') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Cet utilisateur n\'est pas un compte corporate',
          code: 'NOT_CORPORATE_ACCOUNT'
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: { user: corporateUser }
    });

  } catch (error: any) {
    console.error('❌ Error fetching corporate user:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération de l\'utilisateur',
        code: 'USER_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}

// PATCH - Modifier un compte corporate
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Authentification requise',
          code: 'AUTH_REQUIRED'
        }
      }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    const user = session.user as any;
    if (user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès réservé aux administrateurs',
          code: 'FORBIDDEN'
        }
      }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();

    // Champs modifiables
    const updateFields: any = {};

    if (body.corporateSettings?.monthlyLimit !== undefined) {
      updateFields['corporateSettings.monthlyLimit'] = body.corporateSettings.monthlyLimit;
    }

    if (body.corporateSettings?.paymentTerm !== undefined) {
      updateFields['corporateSettings.paymentTerm'] = body.corporateSettings.paymentTerm;
    }

    if (body.corporateSettings?.approvalRequired !== undefined) {
      updateFields['corporateSettings.approvalRequired'] = body.corporateSettings.approvalRequired;
    }

    if (body.company) {
      if (body.company.name) updateFields['company.name'] = body.company.name;
      if (body.company.siret) updateFields['company.siret'] = body.company.siret;
      if (body.company.vatNumber) updateFields['company.vatNumber'] = body.company.vatNumber;
      if (body.company.industry) updateFields['company.industry'] = body.company.industry;
      if (body.company.address) updateFields['company.address'] = body.company.address;
    }

    if (body.suspended !== undefined) {
      updateFields.suspended = body.suspended;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Aucun champ à mettre à jour',
          code: 'NO_FIELDS_TO_UPDATE'
        }
      }, { status: 400 });
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Utilisateur introuvable',
          code: 'USER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    console.log('✅ Compte corporate mis à jour:', {
      userId: updatedUser._id,
      updates: Object.keys(updateFields)
    });

    return NextResponse.json({
      success: true,
      data: { user: updatedUser },
      message: 'Compte corporate mis à jour avec succès'
    });

  } catch (error: any) {
    console.error('❌ Error updating corporate user:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour du compte',
        code: 'USER_UPDATE_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }, { status: 500 });
  }
}

// DELETE - Supprimer un compte corporate
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Authentification requise',
          code: 'AUTH_REQUIRED'
        }
      }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    const user = session.user as any;
    if (user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès réservé aux administrateurs',
          code: 'FORBIDDEN'
        }
      }, { status: 403 });
    }

    await connectDB();

    const deletedUser = await User.findByIdAndDelete(params.id);

    if (!deletedUser) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Utilisateur introuvable',
          code: 'USER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    console.log('✅ Compte corporate supprimé:', {
      userId: deletedUser._id,
      email: deletedUser.email
    });

    return NextResponse.json({
      success: true,
      message: 'Compte corporate supprimé avec succès'
    });

  } catch (error: any) {
    console.error('❌ Error deleting corporate user:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la suppression du compte',
        code: 'USER_DELETE_ERROR'
      }
    }, { status: 500 });
  }
}
