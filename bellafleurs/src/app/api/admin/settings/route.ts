import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { z } from 'zod';

const settingsSchema = z.object({
  shopClosure: z.object({
    isEnabled: z.boolean(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    reason: z.string().optional(),
    message: z.string().optional()
  })
});

// GET - Récupérer les paramètres
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 401 });
    }

    await connectDB();
    
    let settings = await Settings.findOne();
    if (!settings) {
      // Créer des paramètres par défaut
      settings = await Settings.create({
        shopClosure: {
          isEnabled: false,
          reason: 'Congés',
          message: 'Nous sommes actuellement fermés. Les commandes reprendront bientôt !'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: settings
    });

  } catch (error: any) {
    console.error('❌ Settings GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des paramètres'
    }, { status: 500 });
  }
}

// PUT - Mettre à jour les paramètres
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = settingsSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        details: validationResult.error.errors
      }, { status: 400 });
    }

    await connectDB();

    const { shopClosure } = validationResult.data;

    // Validation des dates si la fermeture est activée
    if (shopClosure.isEnabled) {
      if (!shopClosure.startDate || !shopClosure.endDate) {
        return NextResponse.json({
          success: false,
          error: 'Les dates de début et fin sont requises'
        }, { status: 400 });
      }

      const startDate = new Date(shopClosure.startDate);
      const endDate = new Date(shopClosure.endDate);

      if (startDate >= endDate) {
        return NextResponse.json({
          success: false,
          error: 'La date de fin doit être après la date de début'
        }, { status: 400 });
      }
    }

    // Mettre à jour ou créer
    const settings = await Settings.findOneAndUpdate(
      {},
      { shopClosure: {
        isEnabled: shopClosure.isEnabled,
        startDate: shopClosure.startDate ? new Date(shopClosure.startDate) : undefined,
        endDate: shopClosure.endDate ? new Date(shopClosure.endDate) : undefined,
        reason: shopClosure.reason || 'Congés',
        message: shopClosure.message || 'Nous sommes actuellement fermés. Les commandes reprendront bientôt !'
      }},
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Paramètres mis à jour avec succès'
    });

  } catch (error: any) {
    console.error('❌ Settings PUT error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour'
    }, { status: 500 });
  }
}