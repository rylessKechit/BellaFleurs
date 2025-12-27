export const dynamic = 'force-dynamic';
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
  }).optional(),
  productOfWeek: z.object({
    isEnabled: z.boolean(),
    title: z.string().optional(),
    description: z.string().optional()
  }).optional()
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
      settings = await Settings.create({
        shopClosure: {
          isEnabled: false,
          reason: 'Congés',
          message: 'Nous sommes actuellement fermés. Les commandes reprendront bientôt !'
        },
        productOfWeek: {
          isEnabled: false,
          productId: '68db9182e2280ad09cabfa83',
          title: 'Produit de la semaine',
          description: 'Découvrez notre sélection exceptionnelle cette semaine !'
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

    const updates: any = {};

    // Mise à jour fermeture boutique
    if (validationResult.data.shopClosure) {
      const { shopClosure } = validationResult.data;
      
      if (shopClosure.isEnabled) {
        if (!shopClosure.startDate || !shopClosure.endDate) {
          return NextResponse.json({
            success: false,
            error: 'Les dates de début et fin sont requises pour la fermeture'
          }, { status: 400 });
        }

        const startDate = new Date(shopClosure.startDate);
        const endDate = new Date(shopClosure.endDate);

        if (startDate > endDate) {
          return NextResponse.json({
            success: false,
            error: 'La date de fin ne peut pas être antérieure à la date de début'
          }, { status: 400 });
        }
      }

      updates.shopClosure = {
        isEnabled: shopClosure.isEnabled,
        startDate: shopClosure.startDate ? new Date(shopClosure.startDate) : undefined,
        endDate: shopClosure.endDate ? new Date(shopClosure.endDate) : undefined,
        reason: shopClosure.reason || 'Congés',
        message: shopClosure.message || 'Nous sommes actuellement fermés. Les commandes reprendront bientôt !'
      };
    }

    // Mise à jour produit de la semaine
    if (validationResult.data.productOfWeek) {
      const { productOfWeek } = validationResult.data;

      updates.productOfWeek = {
        isEnabled: productOfWeek.isEnabled,
        productId: '68db9182e2280ad09cabfa83', // UUID fixe
        title: productOfWeek.title || 'Produit de la semaine',
        description: productOfWeek.description || 'Découvrez notre sélection exceptionnelle cette semaine !'
      };
    }

    const settings = await Settings.findOneAndUpdate(
      {},
      updates,
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