// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import Order from '@/models/Order';
import mongoose from 'mongoose';

// GET /api/reviews - Récupérer les avis d'un produit
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const rating = searchParams.get('rating'); // Filtrer par note

    // Validation des paramètres
    if (!productId) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Product ID requis', 
          code: 'MISSING_PRODUCT_ID' 
        }
      }, { status: 400 });
    }

    // Vérifier que le produit existe
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Produit introuvable', 
          code: 'PRODUCT_NOT_FOUND' 
        }
      }, { status: 404 });
    }

    const skip = (page - 1) * limit;

    // Construire la requête
    const query: any = { 
      product: productId, 
      isPublished: true 
    };

    // Filtre par note si spécifié
    if (rating && rating !== 'all') {
      query.rating = parseInt(rating);
    }

    // Options de tri
    const sortOptions: any = {};
    if (sortBy === 'rating') {
      sortOptions.rating = sortOrder === 'desc' ? -1 : 1;
      sortOptions.createdAt = -1; // Tri secondaire par date
    } else if (sortBy === 'helpful') {
      // Pour le moment, tri par date (peut être étendu avec un système de votes)
      sortOptions.createdAt = -1;
    } else {
      sortOptions.createdAt = sortOrder === 'desc' ? -1 : 1;
    }

    // Exécuter les requêtes en parallèle
    const [reviews, total] = await Promise.all([
      Review.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('user', 'name')
        .lean(),
      Review.countDocuments(query)
    ]);

    // Calculer les statistiques de notation
    const ratingStats = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          isPublished: true
        }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    // Formater les statistiques
    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
      const stat = ratingStats.find(s => s._id === rating);
      return {
        rating,
        count: stat ? stat.count : 0,
        percentage: total > 0 ? Math.round((stat?.count || 0) / total * 100) : 0
      };
    });

    return NextResponse.json({
      success: true,
      data: { 
        reviews,
        ratingDistribution,
        totalReviews: total
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Reviews GET error:', error);
    return NextResponse.json({
      success: false,
      error: { 
        message: 'Erreur lors de la récupération des avis', 
        code: 'REVIEWS_FETCH_ERROR' 
      }
    }, { status: 500 });
  }
}

// POST /api/reviews - Créer un nouvel avis
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    const { 
      productId, 
      rating, 
      comment, 
      customerName 
    } = await request.json();

    // Validation des données
    if (!productId || !rating || !comment || !customerName) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Données manquantes (productId, rating, comment, customerName)', 
          code: 'MISSING_REQUIRED_FIELDS' 
        }
      }, { status: 400 });
    }

    // Validation des types
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'La note doit être un nombre entre 1 et 5', 
          code: 'INVALID_RATING' 
        }
      }, { status: 400 });
    }

    if (comment.trim().length < 10) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Le commentaire doit contenir au moins 10 caractères', 
          code: 'COMMENT_TOO_SHORT' 
        }
      }, { status: 400 });
    }

    if (customerName.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Le nom doit contenir au moins 2 caractères', 
          code: 'NAME_TOO_SHORT' 
        }
      }, { status: 400 });
    }

    // Vérifier que le produit existe
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Produit introuvable', 
          code: 'PRODUCT_NOT_FOUND' 
        }
      }, { status: 404 });
    }

    // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
    if (session?.user) {
      const existingReview = await Review.findOne({
        product: productId,
        user: (session.user as any).id
      });

      if (existingReview) {
        return NextResponse.json({
          success: false,
          error: { 
            message: 'Vous avez déjà laissé un avis pour ce produit', 
            code: 'REVIEW_ALREADY_EXISTS' 
          }
        }, { status: 400 });
      }
    }

    // Vérifier si l'utilisateur a acheté ce produit (si connecté)
    let isVerified = false;
    if (session?.user) {
      const userOrders = await Order.find({
        user: (session.user as any).id,
        status: 'livrée',
        'items.product': productId
      });

      isVerified = userOrders.length > 0;
    }

    // Créer l'avis
    const review = await Review.create({
      product: productId,
      user: session?.user ? (session.user as any).id : undefined,
      customerName: customerName.trim(),
      rating: parseInt(rating.toString()),
      comment: comment.trim(),
      isVerified,
      isPublished: true // Auto-publié pour le moment, peut être changé selon vos besoins
    });

    // Populate les données utilisateur pour la réponse
    await review.populate('user', 'name');

    console.log(`✅ New review created for product ${productId}: ${rating} stars by ${customerName}`);

    return NextResponse.json({
      success: true,
      data: { review },
      message: 'Avis ajouté avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Reviews POST error:', error);
    
    // Gestion des erreurs de validation Mongoose
    if ((error as any).name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: any) => err.message);
      return NextResponse.json({
        success: false,
        error: { 
          message: 'Erreur de validation: ' + validationErrors.join(', '), 
          code: 'VALIDATION_ERROR' 
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: { 
        message: 'Erreur lors de la création de l\'avis', 
        code: 'REVIEW_CREATION_ERROR' 
      }
    }, { status: 500 });
  }
}