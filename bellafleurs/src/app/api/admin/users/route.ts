// src/app/api/admin/users/route.ts - VERSION CORRIGÉE qui récupère bien l'address
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/admin/users - Récupérer tous les utilisateurs avec stats corporate
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
    const role = searchParams.get('role') || '';
    const accountType = searchParams.get('accountType') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    await connectDB();

    // Construire la query de base
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }

    if (accountType && accountType !== 'all') {
      if (accountType === 'individual') {
        query.accountType = { $ne: 'corporate' };
      } else if (accountType === 'corporate') {
        query.accountType = 'corporate';
      } else if (accountType === 'pending') {
        query.accountType = 'corporate';
        query['corporateSettings.pendingActivation'] = true;
      }
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    // ✨ NOUVELLES STATS : Calculer les statistiques corporate
    const stats = await Promise.all([
      User.countDocuments({}), // Total utilisateurs
      User.countDocuments({ role: 'client' }), // Total clients
      User.countDocuments({ role: 'admin' }), // Total admins
      User.countDocuments({ 
        createdAt: { 
          $gte: new Date(new Date().setDate(new Date().getDate() - 30)) 
        } 
      }), // Nouveaux utilisateurs (30 derniers jours)
      User.countDocuments({ accountType: 'corporate' }), // ✨ Total corporate
      User.countDocuments({ 
        accountType: 'corporate',
        'corporateSettings.pendingActivation': true 
      }) // ✨ Corporate en attente
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
          newUsersThisMonth: stats[3],
          totalCorporate: stats[4], // ✨ NOUVEAU
          pendingCorporate: stats[5] // ✨ NOUVEAU
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

// POST /api/admin/users - RÉCUPÉRATION CORRECTE DE L'ADDRESS
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
    console.log('🔍 Payload reçu:', JSON.stringify(body, null, 2));

    await connectDB();

    // ✅ SI COMPANYNAME → COMPTE CORPORATE
    if (body.companyName) {
      const {
        companyName,
        name, // ✅ CHANGER contactName en name pour correspondre au payload
        email,
        phone,
        address, // ✅ RÉCUPÉRER L'OBJET ADDRESS COMPLET DU PAYLOAD
        monthlyLimit = 1000,
        paymentTerm = 'monthly'
      } = body;

      console.log('🔍 DEBUT DEBUG ADRESSE');
      console.log('🔍 body.address:', body.address);
      console.log('🔍 address variable:', address);
      console.log('🔍 address?.street:', address?.street);
      console.log('🔍 address?.city:', address?.city);
      console.log('🔍 address?.zipCode:', address?.zipCode);
      console.log('🔍 Condition (address && address.street && address.city && address.zipCode):', 
        address && address.street && address.city && address.zipCode);
      console.log('🔍 FIN DEBUG ADRESSE');

      // Validation
      if (!companyName || !name || !email) { // ✅ CHANGER contactName en name
        return NextResponse.json({
          success: false,
          error: {
            message: 'Entreprise, contact et email requis',
            code: 'VALIDATION_ERROR'
          }
        }, { status: 400 });
      }

      // Vérifier si utilisateur existe
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

      // ✅ CRÉER AVEC ADRESSE COMPLÈTE ET TÉLÉPHONE  
      const userData: any = {
        name: name,
        email: email.toLowerCase(),
        phone: phone || '',
        role: 'client',
        accountType: 'corporate',
        company: {
          name: companyName,
          contactPerson: name
        },
        corporateSettings: {
          monthlyLimit,
          paymentTerm,
          pendingActivation: true,
          approvalRequired: false,
          createdByAdmin: session.user.id,
          activatedAt: null
        }
      };

      // ✅ AJOUTER L'ADRESSE SI ELLE EXISTE
      if (address && address.street && address.city && address.zipCode) {
        userData.address = {
          street: address.street,
          city: address.city,
          zipCode: address.zipCode,
          country: address.country || 'France'
        };
        console.log('✅ Adresse ajoutée aux userData:', userData.address);
      }

      // ✅ GÉNÉRER ET AJOUTER LE TOKEN COMME DANS TON ANCIENNE ROUTE
      const activationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      console.log('🔑 Token généré:', activationToken);
      
      // ✅ AJOUTER LE TOKEN DANS CORPORATE SETTINGS AVANT LA CRÉATION
      userData.corporateSettings.activationToken = activationToken;
      userData.corporateSettings.tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const newUser = new User(userData);
      await newUser.save();

      // ✅ DOUBLE VÉRIFICATION : Forcer la sauvegarde du token (comme dans ton ancienne route)
      await User.findByIdAndUpdate(newUser._id, {
        'corporateSettings.activationToken': activationToken,
        'corporateSettings.tokenExpiresAt': new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      // ✅ DEBUG : Vérifier que le token est bien sauvegardé
      const savedUser = await User.findById(newUser._id).select('corporateSettings.activationToken');
      console.log('💾 Token sauvegardé en base:', savedUser?.corporateSettings?.activationToken);

      // ✅ TON SYSTÈME EMAIL QUI MARCHE (pas touché)
      try {
        const { sendCorporateInvitationEmail } = await import('@/lib/email/corporate');
        
        await sendCorporateInvitationEmail({
          email,
          name: name,
          companyName,
          activationToken,
          adminName: session.user.name || 'Admin'
        });
        console.log('✅ Email invitation envoyé');
      } catch (emailError) {
        console.error('❌ Erreur envoi email:', emailError);
      }

      const userResponse = newUser.toObject();
      delete userResponse.password;

      console.log('✅ Compte corporate créé avec:', {
        companyName,
        contactName: name, // ✅ Affichage pour debug
        email,
        phone: phone || 'non renseigné',
        address: userResponse.address || 'non renseignée'
      });

      return NextResponse.json({
        success: true,
        data: {
          user: userResponse,
          message: `Compte corporate créé pour ${companyName}. Email d'invitation envoyé.`
        }
      }, { status: 201 });

    } else {
      // ✅ COMPTE INDIVIDUAL (ton code existant)
      const { name, email, role, password, phone, address } = body;

      if (!name || !email || !password || !role) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Nom, email, mot de passe et rôle requis',
            code: 'VALIDATION_ERROR'
          }
        }, { status: 400 });
      }

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

      const newUser = new User({
        name,
        email,
        password,
        role,
        phone,
        address,
        accountType: 'individual'
      });

      await newUser.save();

      const userResponse = newUser.toObject();
      delete userResponse.password;

      return NextResponse.json({
        success: true,
        data: {
          user: userResponse
        }
      }, { status: 201 });
    }

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