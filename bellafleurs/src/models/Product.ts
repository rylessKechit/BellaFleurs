import mongoose, { Schema, Model } from 'mongoose';
import { IProduct, IProductVariant, ProductFilters, PaginationParams } from '@/../types';

// Schéma pour les variantes
const ProductVariantSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Variant name is required'],
    trim: true,
    maxlength: [100, 'Variant name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Variant price is required'], // ✅ Simple validation pour les variants
    min: [0.01, 'Price must be greater than 0'],
    max: [10000, 'Price cannot exceed 10,000€'],
    set: (v: number) => Math.round(v * 100) / 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Variant description cannot exceed 500 characters']
  },
  image: {
    type: String,
    match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp)(\?.*)?$/i, 'Invalid image URL format']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

// Schéma principal Product mis à jour
const ProductSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters'],
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    min: [0.01, 'Price must be greater than 0'],
    max: [10000, 'Price cannot exceed 10,000€'],
    set: (v: number) => Math.round(v * 100) / 100,
    // 🔧 VALIDATION CONDITIONNELLE AMÉLIORÉE
    required: function(this: IProduct) {
      // Prix requis seulement si hasVariants = false ET ce n'est pas une mise à jour qui supprime le prix
      return this.hasVariants === false;
    },
    validate: {
      validator: function(this: IProduct, value: number) {
        // Si hasVariants = true, le prix ne devrait pas exister
        if (this.hasVariants === true && value !== undefined) {
          return false;
        }
        // Si hasVariants = false, le prix doit exister et être valide
        if (this.hasVariants === false && (!value || value <= 0)) {
          return false;
        }
        return true;
      },
      message: 'Prix incompatible avec la configuration des variants'
    }
  },
  hasVariants: {
    type: Boolean,
    default: false
  },
  variants: {
    type: [ProductVariantSchema],
    default: [],
    validate: {
      validator: function(this: IProduct, variants: IProductVariant[]) {
        // 🔧 VALIDATION AMÉLIORÉE POUR LES MISES À JOUR
        
        // Si hasVariants = true, au moins 1 variant requis
        if (this.hasVariants === true) {
          return variants && variants.length > 0;
        }
        
        // Si hasVariants = false, aucun variant autorisé
        if (this.hasVariants === false) {
          return !variants || variants.length === 0;
        }
        
        // Si hasVariants n'est pas défini (cas de mise à jour partielle), on accepte
        return true;
      },
      message: 'Configuration variants incompatible: variants requis si hasVariants=true, interdits si hasVariants=false'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Bouquets', 'Fleurs de saisons', 'Compositions piquées', 'Roses', 'Orchidées', 'Deuil', 'Incontournable', 'Abonnement'],
      message: 'Invalid category'
    }
  },
  images: [{
    type: String,
    required: true,
    match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp)(\?.*)?$/i, 'Invalid image URL format']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  entretien: {
    type: String,
    trim: true,
    maxlength: [2000, 'Care instructions cannot exceed 2000 characters']
  },
  motsClesSEO: [{
    type: String,
    trim: true,
    maxlength: [50, 'SEO keyword cannot exceed 50 characters']
  }],
  slug: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format']
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewsCount: {
    type: Number,
    min: 0,
    default: 0
  },
  careInstructions: {
    type: String,
    trim: true,
    maxlength: [2000, 'Care instructions cannot exceed 2000 characters']
  },
  difficulty: {
    type: String,
    enum: ['facile', 'modéré', 'difficile'],
    default: 'facile'
  },
  composition: {
    type: String,
    trim: true,
    maxlength: [1000, 'Composition cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les performances
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ isActive: 1, createdAt: -1 });
ProductSchema.index({ slug: 1 });

// Middleware de validation pré-sauvegarde
ProductSchema.pre('save', function(next) {
  // Cast explicite pour éviter les erreurs TypeScript
  const doc = this as any;
  
  // Générer le slug automatiquement
  if (!doc.slug && doc.name) {
    doc.slug = doc.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  // Trier les variants par ordre
  if (doc.hasVariants && doc.variants && Array.isArray(doc.variants)) {
    doc.variants.sort((a: any, b: any) => a.order - b.order);
  }

  // 🔧 VALIDATION SUPPLÉMENTAIRE AVANT SAUVEGARDE
  if (doc.hasVariants) {
    // Produit avec variants : supprimer le prix s'il existe
    if (doc.price !== undefined) {
      doc.price = undefined;
    }
    // Vérifier qu'il y a au moins un variant
    if (!doc.variants || !Array.isArray(doc.variants) || doc.variants.length === 0) {
      return next(new Error('Au moins un variant requis pour un produit avec variants'));
    }
  } else {
    // Produit sans variants : supprimer les variants et s'assurer qu'il y a un prix
    doc.variants = [];
    if (!doc.price || doc.price <= 0) {
      return next(new Error('Prix requis pour un produit sans variants'));
    }
  }

  next();
});

// Middleware pré-update pour les mises à jour
ProductSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
  const update = this.getUpdate() as any;
  
  // 🔧 GESTION DES MISES À JOUR AVEC VARIANTS
  if (update.$set) {
    const hasVariants = update.$set.hasVariants;
    
    if (hasVariants === true) {
      // Produit avec variants : s'assurer que le prix est supprimé
      if (!update.$unset) update.$unset = {};
      update.$unset.price = 1;
      
      // Vérifier qu'il y a des variants
      if (!update.$set.variants || !Array.isArray(update.$set.variants) || update.$set.variants.length === 0) {
        return next(new Error('Au moins un variant requis pour un produit avec variants'));
      }
    } else if (hasVariants === false) {
      // Produit sans variants : supprimer les variants et vérifier le prix
      update.$set.variants = [];
      
      if (!update.$set.price || update.$set.price <= 0) {
        return next(new Error('Prix requis pour un produit sans variants'));
      }
    }
  }
  
  next();
});

ProductSchema.virtual('mainImage').get(function() {
  return this.images && this.images.length > 0 ? this.images[0] : null;
});

ProductSchema.virtual('categoryLabel').get(function() {
  return this.category;
});

ProductSchema.virtual('priceFormatted').get(function() {
  const price = this.get('displayPrice');
  return price ? new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price) : null;
});

// Nouveau : Prix à afficher (simple ou premier variant)
ProductSchema.virtual('displayPrice').get(function(this: IProduct) {
  if (!this.hasVariants) {
    return this.price;
  }
  
  if (this.variants && this.variants.length > 0) {
    const activeVariants = this.variants.filter((v: IProductVariant) => v.isActive);
    return activeVariants.length > 0 ? activeVariants[0].price : null;
  }
  
  return null;
});

// Nouveau : Fourchette de prix pour les variants
ProductSchema.virtual('priceRange').get(function(this: IProduct) {
  if (!this.hasVariants || !this.variants || this.variants.length === 0) {
    return null;
  }

  const activeVariants = this.variants.filter((v: IProductVariant) => v.isActive);
  if (activeVariants.length === 0) return null;

  const prices = activeVariants.map((v: IProductVariant) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  
  return { min, max };
});

ProductSchema.virtual('priceRangeFormatted').get(function(this: IProduct) {
  const range = (this as any).priceRange; // Accès au virtual priceRange
  if (!range) return this.priceFormatted;

  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  });

  if (range.min === range.max) {
    return formatter.format(range.min);
  } else {
    return `${formatter.format(range.min)} - ${formatter.format(range.max)}`;
  }
});

// Méthodes d'instance
ProductSchema.methods.addTag = function(tag: string) {
  if (!this.tags.includes(tag.toLowerCase())) {
    this.tags.push(tag.toLowerCase());
  }
  return this.save();
};

ProductSchema.methods.removeTag = function(tag: string) {
  this.tags = this.tags.filter((t: string) => t !== tag.toLowerCase());
  return this.save();
};

ProductSchema.methods.addVariant = function(this: IProduct, variant: Omit<IProductVariant, '_id' | 'order'>) {
  if (!this.hasVariants) {
    throw new Error('Cannot add variant to product without variants enabled');
  }

  const maxOrder = this.variants.length > 0 ? Math.max(...this.variants.map((v: IProductVariant) => v.order)) : -1;
  
  this.variants.push({
    ...variant,
    order: maxOrder + 1
  } as IProductVariant);
  
  return this.save();
};

ProductSchema.methods.removeVariant = function(variantIndex: number) {
  if (!this.hasVariants || !this.variants) {
    throw new Error('Product has no variants');
  }

  if (variantIndex < 0 || variantIndex >= this.variants.length) {
    throw new Error('Invalid variant index');
  }

  this.variants.splice(variantIndex, 1);
  return this.save();
};

ProductSchema.methods.updateVariant = function(this: IProduct, variantIndex: number, updates: Partial<IProductVariant>) {
  if (!this.hasVariants || !this.variants) {
    throw new Error('Product has no variants');
  }

  if (variantIndex < 0 || variantIndex >= this.variants.length) {
    throw new Error('Invalid variant index');
  }

  Object.assign(this.variants[variantIndex], updates);
  return this.save();
};

ProductSchema.methods.getDefaultVariant = function(this: IProduct) {
  if (!this.hasVariants || !this.variants || this.variants.length === 0) {
    return null;
  }

  const activeVariants = this.variants.filter((v: IProductVariant) => v.isActive);
  return activeVariants.length > 0 ? activeVariants[0] : null;
};

// Méthodes statiques
ProductSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

ProductSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, isActive: true });
};

ProductSchema.statics.searchProducts = function(
  filters: ProductFilters = {},
  pagination: PaginationParams = { page: 1, limit: 12 }
) {
  const query: any = { isActive: true };
  
  // Filtres existants
  if (filters.category) query.category = filters.category;
  if (filters.minPrice || filters.maxPrice) {
    // Pour les produits avec variants, chercher dans les prix des variants
    const priceConditions: any = {};
    if (filters.minPrice) priceConditions.$gte = filters.minPrice;
    if (filters.maxPrice) priceConditions.$lte = filters.maxPrice;
    
    query.$or = [
      // Produits sans variants
      { hasVariants: false, price: priceConditions },
      // Produits avec variants
      { hasVariants: true, 'variants.price': priceConditions }
    ];
  }
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  if (filters.hasVariants !== undefined) {
    query.hasVariants = filters.hasVariants;
  }

  // Tri
  let sort: any = { createdAt: -1 };
  if (pagination.sortBy) {
    sort = { [pagination.sortBy]: pagination.sortOrder === 'desc' ? -1 : 1 };
  } else if (filters.search) {
    sort = { score: { $meta: 'textScore' } };
  }

  const skip = (pagination.page - 1) * pagination.limit;

  return {
    query: this.find(query).sort(sort).skip(skip).limit(pagination.limit),
    countQuery: this.countDocuments(query)
  };
};

// Interface pour les méthodes statiques
interface IProductModel extends Model<IProduct> {
  findActive(): Promise<IProduct[]>;
  findByCategory(category: string): Promise<IProduct[]>;
  searchProducts(
    filters?: ProductFilters,
    pagination?: PaginationParams
  ): {
    query: any;
    countQuery: any;
  };
}

// Éviter la recompilation du modèle
const Product = (mongoose.models.Product as unknown as IProductModel) || 
  mongoose.model<IProduct, IProductModel>('Product', ProductSchema);

export default Product;