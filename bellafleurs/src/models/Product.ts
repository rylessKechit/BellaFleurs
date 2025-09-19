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
    required: [true, 'Variant price is required'],
    min: [0.01, 'Variant price must be greater than 0'],
    max: [10000, 'Variant price cannot exceed 10,000€'],
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
    // Prix requis seulement si hasVariants = false
    required: function(this: IProduct) {
      return !this.hasVariants;
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
        // Si hasVariants = true, au moins 1 variant requis
        if (this.hasVariants) {
          return variants && variants.length > 0;
        }
        // Si hasVariants = false, pas de variants
        return !variants || variants.length === 0;
      },
      message: 'Products with variants must have at least one variant, products without variants cannot have variants'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Bouquets', 'Fleurs de saisons', 'Compositions piquées', 'Roses', 'Orchidées', 'Deuil', 'Abonnement'],
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
  // Générer le slug automatiquement
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  // Trier les variants par ordre
  if (this.hasVariants && this.variants) {
    this.variants.sort((a, b) => a.order - b.order);
  }

  next();
});

// Virtuals
ProductSchema.virtual('isInStock').get(function() {
  return this.isActive;
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

ProductSchema.statics.findInStock = function() {
  return this.find({ isActive: true });
};

ProductSchema.statics.findLowStock = function() {
  return this.find({ isActive: true });
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
  findInStock(): Promise<IProduct[]>;
  findLowStock(): Promise<IProduct[]>;
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