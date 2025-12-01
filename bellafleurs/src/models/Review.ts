// src/models/Review.ts - Version corrigée
import mongoose, { Schema, Model, Document } from 'mongoose';

// Interface pour les avis (Document MongoDB)
export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  customerName: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  isPublished: boolean;
  adminResponse?: string;
  // createdAt et updatedAt sont automatiquement ajoutés par timestamps: true
  
  // Virtuals
  ratingLabel?: string;
  isPositive?: boolean;
}

// Interface pour les méthodes d'instance
export interface IReviewMethods {
  markAsVerified(): Promise<IReview>;
  publish(): Promise<IReview>;
  unpublish(): Promise<IReview>;
  addAdminResponse(response: string): Promise<IReview>;
}

// Interface pour les méthodes statiques
export interface IReviewModel extends Model<IReview, {}, IReviewMethods> {
  findByProduct(productId: string, published?: boolean): Promise<IReview[]>;
  findPublishedByProduct(productId: string): Promise<IReview[]>;
  calculateProductRating(productId: string): Promise<{ averageRating: number; reviewsCount: number; }>;
  getRecentReviews(limit?: number): Promise<IReview[]>;
}

// Type pour le document complet
export type IReviewDocument = IReview & IReviewMethods;

// Schéma des avis
const ReviewSchema = new Schema<IReview, IReviewModel, IReviewMethods>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required'],
    index: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    minlength: [2, 'Customer name must be at least 2 characters'],
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: function(value: number) {
        return Number.isInteger(value) && value >= 1 && value <= 5;
      },
      message: 'Rating must be an integer between 1 and 5'
    }
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true,
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  isPublished: {
    type: Boolean,
    default: true,
    index: true
  },
  adminResponse: {
    type: String,
    trim: true,
    maxlength: [500, 'Admin response cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index composé pour optimiser les requêtes
ReviewSchema.index({ product: 1, isPublished: 1 });
ReviewSchema.index({ product: 1, rating: 1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ isVerified: 1, isPublished: 1 });

// Virtuals
ReviewSchema.virtual('ratingLabel').get(function(this: IReview) {
  const labels = {
    1: 'Très décevant',
    2: 'Décevant',
    3: 'Correct',
    4: 'Bien',
    5: 'Excellent'
  };
  return labels[this.rating as keyof typeof labels];
});

ReviewSchema.virtual('isPositive').get(function(this: IReview) {
  return this.rating >= 4;
});

// Méthodes d'instance
ReviewSchema.methods.markAsVerified = async function(this: IReview): Promise<IReview> {
  this.isVerified = true;
  return this.save();
};

ReviewSchema.methods.publish = async function(this: IReview): Promise<IReview> {
  this.isPublished = true;
  return this.save();
};

ReviewSchema.methods.unpublish = async function(this: IReview): Promise<IReview> {
  this.isPublished = false;
  return this.save();
};

ReviewSchema.methods.addAdminResponse = async function(this: IReview, response: string): Promise<IReview> {
  this.adminResponse = response;
  return this.save();
};

// Méthodes statiques - Correction des types
ReviewSchema.statics.findByProduct = function(
  productId: string,
  published: boolean = true
) {
  const query: any = { product: productId };
  if (published !== undefined) {
    query.isPublished = published;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('user', 'name')
    .lean();
};

ReviewSchema.statics.findPublishedByProduct = function(
  productId: string
) {
  return this.find({ 
    product: productId, 
    isPublished: true 
  })
    .sort({ createdAt: -1 })
    .populate('user', 'name')
    .lean();
};

ReviewSchema.statics.calculateProductRating = async function(
  productId: string
): Promise<{ averageRating: number; reviewsCount: number; }> {
  const result = await this.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        isPublished: true
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        reviewsCount: { $sum: 1 }
      }
    }
  ]);
  
  if (result.length === 0) {
    return { averageRating: 0, reviewsCount: 0 };
  }
  
  return {
    averageRating: Math.round(result[0].averageRating * 10) / 10, // Arrondir à 1 décimale
    reviewsCount: result[0].reviewsCount
  };
};

ReviewSchema.statics.getRecentReviews = function(limit: number = 10) {
  return this.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('product', 'name images')
    .populate('user', 'name')
    .lean();
};

// Middleware post-save pour mettre à jour les stats du produit
ReviewSchema.post('save', async function(doc: IReview) {
  try {
    if (doc.isPublished) {
      // Import dynamique pour éviter les dépendances circulaires
      const Product = mongoose.model('Product');
      const Review = mongoose.model('Review') as IReviewModel;
      
      const stats = await Review.calculateProductRating(doc.product.toString());
      
      await Product.findByIdAndUpdate(doc.product, {
        averageRating: stats.averageRating,
        reviewsCount: stats.reviewsCount
      });
    }
  } catch (error) {
    console.error('❌ Error updating product rating after review save:', error);
  }
});

// Middleware post-deleteOne pour mettre à jour les stats du produit
ReviewSchema.post('deleteOne', { document: true, query: false }, async function(doc: IReview) {
  try {
    if (doc && doc.product) {
      const Product = mongoose.model('Product');
      const Review = mongoose.model('Review') as IReviewModel;
      
      const stats = await Review.calculateProductRating(doc.product.toString());
      
      await Product.findByIdAndUpdate(doc.product, {
        averageRating: stats.averageRating,
        reviewsCount: stats.reviewsCount
      });
    }
  } catch (error) {
    console.error('❌ Error updating product rating after review deletion:', error);
  }
});

// Éviter la recompilation du modèle
const Review = (mongoose.models.Review as IReviewModel) || 
  mongoose.model<IReview, IReviewModel>('Review', ReviewSchema);

export default Review;