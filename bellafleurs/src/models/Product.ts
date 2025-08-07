import mongoose, { Schema, Model } from 'mongoose';
import { IProduct, ProductFilters, PaginationParams } from '@/types';

// Schéma pour le SEO
const SEOSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: [60, 'SEO title cannot exceed 60 characters']
  },
  description: {
    type: String,
    required: true,
    maxlength: [160, 'SEO description cannot exceed 160 characters']
  },
  keywords: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each keyword cannot exceed 50 characters']
  }]
}, { _id: false });

// Schéma pour les dimensions
const DimensionsSchema = new Schema({
  height: {
    type: Number,
    min: [0, 'Height must be positive'],
    max: [500, 'Height cannot exceed 500cm']
  },
  width: {
    type: Number,
    min: [0, 'Width must be positive'],
    max: [500, 'Width cannot exceed 500cm']
  },
  depth: {
    type: Number,
    min: [0, 'Depth must be positive'],
    max: [500, 'Depth cannot exceed 500cm']
  }
}, { _id: false });

// Schéma pour les conseils d'entretien
const CareSchema = new Schema({
  difficulty: {
    type: String,
    enum: ['facile', 'modéré', 'difficile'],
    default: 'facile'
  },
  watering: {
    type: String,
    required: true,
    maxlength: [200, 'Watering instructions cannot exceed 200 characters']
  },
  light: {
    type: String,
    required: true,
    maxlength: [200, 'Light instructions cannot exceed 200 characters']
  },
  temperature: {
    type: String,
    required: true,
    maxlength: [200, 'Temperature instructions cannot exceed 200 characters']
  }
}, { _id: false });

// Schéma principal Product
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
    required: [true, 'Product price is required'],
    min: [0.01, 'Price must be greater than 0'],
    max: [10000, 'Price cannot exceed 10,000€'],
    set: (v: number) => Math.round(v * 100) / 100 // Arrondir à 2 décimales
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['bouquets', 'compositions', 'plantes', 'evenements'],
      message: 'Category must be one of: bouquets, compositions, plantes, evenements'
    }
  },
  subcategory: {
    type: String,
    required: [true, 'Subcategory is required'],
    trim: true,
    maxlength: [100, 'Subcategory cannot exceed 100 characters']
  },
  images: [{
    type: String,
    required: true,
    match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp)(\?.*)?$/i, 'Please provide valid image URLs']
  }],
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Each tag cannot exceed 30 characters']
  }],
  seo: {
    type: SEOSchema,
    required: true
  },
  dimensions: {
    type: DimensionsSchema,
    required: false
  },
  care: {
    type: CareSchema,
    required: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les performances et recherche
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, subcategory: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ tags: 1 });

// Index composé pour les filtres
ProductSchema.index({ category: 1, isActive: 1, stock: 1 });
ProductSchema.index({ price: 1, category: 1, isActive: 1 });

// Middleware pre-save pour générer le SEO automatiquement si manquant
ProductSchema.pre('save', function(next) {
  if (!this.seo) {
    this.seo = {
      title: this.name.slice(0, 60),
      description: this.description.slice(0, 160),
      keywords: this.tags.slice(0, 10)
    };
  }
  next();
});

// Virtuals
ProductSchema.virtual('isInStock').get(function() {
  return this.stock > 0;
});

ProductSchema.virtual('isLowStock').get(function() {
  return this.stock > 0 && this.stock <= 5;
});

ProductSchema.virtual('isOutOfStock').get(function() {
  return this.stock === 0;
});

ProductSchema.virtual('mainImage').get(function() {
  return this.images && this.images.length > 0 ? this.images[0] : null;
});

ProductSchema.virtual('categoryLabel').get(function() {
  const labels: Record<string, string> = {
    'bouquets': 'Bouquets',
    'compositions': 'Compositions',
    'plantes': 'Plantes',
    'evenements': 'Événements'
  };
  return labels[this.category] || this.category;
});

ProductSchema.virtual('priceFormatted').get(function() {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(this.price);
});

// Méthodes statiques
ProductSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

ProductSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, isActive: true });
};

ProductSchema.statics.findInStock = function() {
  return this.find({ stock: { $gt: 0 }, isActive: true });
};

ProductSchema.statics.findLowStock = function() {
  return this.find({ stock: { $gt: 0, $lte: 5 }, isActive: true });
};

ProductSchema.statics.searchProducts = function(
  filters: ProductFilters = {},
  pagination: PaginationParams = { page: 1, limit: 12 }
) {
  const query: any = { isActive: true };
  
  // Filtres
  if (filters.category) query.category = filters.category;
  if (filters.subcategory) query.subcategory = filters.subcategory;
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = filters.minPrice;
    if (filters.maxPrice) query.price.$lte = filters.maxPrice;
  }
  if (filters.inStock) query.stock = { $gt: 0 };
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  if (filters.search) {
    query.$text = { $search: filters.search };
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

// Méthodes d'instance
ProductSchema.methods.updateStock = function(quantity: number) {
  this.stock = Math.max(0, this.stock + quantity);
  return this.save();
};

ProductSchema.methods.reduceStock = function(quantity: number) {
  if (this.stock < quantity) {
    throw new Error(`Stock insuffisant. Stock disponible: ${this.stock}`);
  }
  this.stock -= quantity;
  return this.save();
};

ProductSchema.methods.addTag = function(tag: string) {
  if (!this.tags.includes(tag.toLowerCase())) {
    this.tags.push(tag.toLowerCase());
  }
  return this.save();
};

ProductSchema.methods.removeTag = function(tag: string) {
  this.tags = this.tags.filter((t: any) => t !== tag.toLowerCase());
  return this.save();
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