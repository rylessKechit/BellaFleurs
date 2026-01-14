// src/app/api/admin/corporate/users/route.ts - API création comptes B2B
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendCorporateInvitationEmail } from '@/lib/email/corporate';
import crypto from 'crypto';

// GET /api/admin/corporate/users - Lister les comptes corporate
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all'; // all, active, pending, suspended

    await connectDB();

    // Construire la query
    const query: any = { accountType: 'corporate' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      switch (status) {
        case 'pending':
          query['corporateSettings.pendingActivation'] = true;
          break;
        case 'active':
          query['corporateSettings.pendingActivation'] = false;
          break;
      }
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .populate('corporateSettings.createdByAdmin', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    // Statistiques
    const stats = await Promise.all([
      User.countDocuments({ accountType: 'corporate' }),
      User.countDocuments({ 
        accountType: 'corporate',
        'corporateSettings.pendingActivation': true 
      }),
      User.countDocuments({ 
        accountType: 'corporate',
        'corporateSettings.pendingActivation': false 
      })
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
          totalCorporate: stats[0],
          pending: stats[1],
          active: stats[2]
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Admin corporate users GET error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des comptes corporate',
        code: 'CORPORATE_USERS_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}

// POST /api/admin/corporate/users - Créer un compte corporate
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
    const {
      // Infos utilisateur
      name,
      email,
      phone,
      
      // Infos entreprise
      companyName,
      siret,
      vatNumber,
      industry,
      contactPerson,
      
      // Paramètres corporate
      monthlyLimit = 1000,
      paymentTerm = 'monthly',
      approvalRequired = false
    } = body;

    // Validation
    if (!name || !email || !companyName || !contactPerson) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Nom, email, nom de l\'entreprise et contact requis',
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    await connectDB();

    // Vérifier que l'email n'existe pas
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Un utilisateur avec cet email existe déjà',
          code: 'EMAIL_EXISTS'
        }
      }, { status: 409 });
    }

    // Générer un token d'activation
    const activationToken = crypto.randomBytes(32).toString('hex');
    console.log('🔑 Token généré:', activationToken);

    // Créer le compte corporate
    const corporateUser = new User({
      name,
      email,
      phone,
      role: 'client',
      accountType: 'corporate',
      company: {
        name: companyName,
        siret,
        vatNumber,
        industry,
        contactPerson
      },
      corporateSettings: {
        monthlyLimit,
        paymentTerm,
        approvalRequired,
        createdByAdmin: session.user.id,
        pendingActivation: true,
        activationToken // ✅ CORRECTION : Bien inclure le token
      }
    });

    await corporateUser.save();

    // ✅ FORCER la sauvegarde du token (au cas où)
    await User.findByIdAndUpdate(corporateUser._id, {
      'corporateSettings.activationToken': activationToken
    });

    // ✅ DEBUG : Vérifier que le token est bien sauvegardé
    const savedUser = await User.findById(corporateUser._id).select('corporateSettings.activationToken');
    console.log('💾 Token sauvegardé en base:', savedUser?.corporateSettings?.activationToken);

    // Envoyer l'email d'invitation
    try {
      await sendCorporateInvitationEmail({
        email,
        name,
        companyName,
        activationToken,
        adminName: session.user.name || 'Admin'
      });
      console.log('✅ Email d\'invitation corporate envoyé à:', email);
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
      // Ne pas faire échouer la création du compte
    }

    // Retourner le compte créé sans données sensibles
    const responseUser = corporateUser.toObject();
    delete responseUser.password;
    delete responseUser.corporateSettings?.activationToken;

    return NextResponse.json({
      success: true,
      data: {
        user: responseUser,
        message: `Compte corporate créé pour ${companyName}. Email d'invitation envoyé à ${email}.`
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Admin corporate user creation error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la création du compte corporate',
        code: 'CORPORATE_USER_CREATION_ERROR'
      }
    }, { status: 500 });
  }
}