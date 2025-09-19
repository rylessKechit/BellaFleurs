// src/models/Cart.ts
import mongoose, { Schema, Model, Document } from 'mongoose';

// Interface pour un item du panier - MISE À JOUR AVEC VARIANTS
export interface ICartItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
  addedAt: Date;
  // NOUVEAU : Support variants
  variantId?: string;
  variantName?: string;
}

// Interface pour les méthodes d'instance - MISE À JOUR
export interface ICartMethods {
  calculateTotals(): void;
  addItem(productId: string, quantity: number, variantId?: string, variantName?: string, variantPrice?: number): Promise<ICart>;
  removeItem(productId: string, variantId?: string): Promise<ICart>;
  updateQuantity(productId: string, quantity: number, variantId?: string): Promise<ICart>;
  clearItems(): Promise<ICart>;
}

// Interface pour le document Cart
export interface ICart extends Document, ICartMethods {
  user?: mongoose.Types.ObjectId;
  sessionId?: string;
  items: ICartItem[];
  totalItems: number;
  totalAmount: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  isEmpty?: boolean;
  itemsCount?: number;
}

// Interface pour les méthodes statiques
export interface ICartModel extends Model<ICart, {}, ICartMethods> {
  findByUser(userId: string): Promise<ICart | null>;
  findBySession(sessionId: string): Promise<ICart | null>;
  findOrCreateCart(userId?: string, sessionId?: string): Promise<ICart>;
  cleanExpiredCarts(): Promise<any>;
}

// Type pour le document complet
export type ICartDocument = ICart & ICartMethods;

// Schéma pour les items du panier - MISE À JOUR AVEC VARIANTS
const CartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be positive']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [50, 'Quantity cannot exceed 50']
  },
  image: {
    type: String,
    required: [true, 'Product image is required']
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  // NOUVEAU : Champs variants
  variantId: {
    type: String,
    required: false
  },
  variantName: {
    type: String,
    required: false,
    trim: true
  }
}, { _id: false });

// Schéma principal Cart
const CartSchema = new Schema<ICart, ICartModel, ICartMethods>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    sparse: true,
    index: true
  },
  sessionId: {
    type: String,
    required: false,
    sparse: true,
    index: true
  },
  items: {
    type: [CartItemSchema],
    default: []
  },
  totalItems: {
    type: Number,
    default: 0,
    min: [0, 'Total items cannot be negative']
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: [0, 'Total amount cannot be negative']
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les performances et contraintes
CartSchema.index({ user: 1 }, { unique: true, sparse: true });
CartSchema.index({ sessionId: 1 }, { unique: true, sparse: true });
CartSchema.index({ updatedAt: -1 });
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Middleware pre-save pour calculer les totaux
CartSchema.pre<ICart>('save', function(next) {
  (this as any).calculateTotals();
  
  // Mettre à jour l'expiration pour les paniers actifs
  if (this.items.length > 0) {
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Virtuals
CartSchema.virtual('isEmpty').get(function(this: ICart) {
  return this.items.length === 0;
});

CartSchema.virtual('itemsCount').get(function(this: ICart) {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Méthodes d'instance - MISE À JOUR AVEC VARIANTS
CartSchema.methods.calculateTotals = function(this: ICart) {
  this.totalItems = this.items.reduce((total: number, item: ICartItem) => total + item.quantity, 0);
  this.totalAmount = this.items.reduce((total: number, item: ICartItem) => total + (item.price * item.quantity), 0);
  this.totalAmount = Math.round(this.totalAmount * 100) / 100;
};

// MISE À JOUR : addItem avec support variants
CartSchema.methods.addItem = async function(
  this: ICart, 
  productId: string, 
  quantity: number = 1, 
  variantId?: string,
  variantName?: string,
  variantPrice?: number
) {
  // Import sécurisé du modèle Product
  const getProductModel = () => {
    try {
      return mongoose.model('Product');
    } catch (error) {
      throw new Error('Product model not available. Make sure to import Product model first.');
    }
  };
  
  const Product = getProductModel();
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Produit introuvable');
  }
  
  if (!product.isActive) {
    throw new Error('Produit non disponible');
  }
  
  if (quantity > 50) {
    throw new Error('Quantité maximale par article: 50');
  }

  // NOUVEAU : Clé unique pour différencier les variants
  const getItemKey = (pId: string, vId?: string) => vId ? `${pId}-${vId}` : pId;
  const itemKey = getItemKey(productId, variantId);
  
  // Chercher un item existant avec la même clé (produit + variant)
  const existingItemIndex = this.items.findIndex((item: any) => {
    const itemProductId = item.product._id 
      ? item.product._id.toString()
      : item.product.toString();
    const existingItemKey = getItemKey(itemProductId, item.variantId);
    return existingItemKey === itemKey;
  });
  
  // Prix à utiliser (variant ou produit)
  const priceToUse = variantPrice || product.price || 0;
  
  if (existingItemIndex >= 0) {
    // MISE À JOUR : Item existant
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].price = priceToUse;
    
    if (this.items[existingItemIndex].quantity > 50) {
      this.items[existingItemIndex].quantity = 50;
    }
  } else {
    // NOUVEAU : Nouvel item avec support variants
    const displayName = variantName ? `${product.name} - ${variantName}` : product.name;
    
    this.items.push({
      product: new mongoose.Types.ObjectId(productId),
      name: displayName,
      price: priceToUse,
      quantity: quantity,
      image: product.images[0] || '',
      addedAt: new Date(),
      variantId: variantId,
      variantName: variantName
    } as ICartItem);
  }
  
  return this.save();
};

// MISE À JOUR : removeItem avec support variants
CartSchema.methods.removeItem = async function(this: ICart, productId: string, variantId?: string) {
  const getItemKey = (pId: string, vId?: string) => vId ? `${pId}-${vId}` : pId;
  const itemKey = getItemKey(productId, variantId);
  
  this.items = this.items.filter((item: any) => {
    const itemProductId = item.product._id 
      ? item.product._id.toString()
      : item.product.toString();
    const existingItemKey = getItemKey(itemProductId, item.variantId);
    return existingItemKey !== itemKey;
  });
  
  return this.save();
};

// MISE À JOUR : updateQuantity avec support variants
CartSchema.methods.updateQuantity = async function(this: ICart, productId: string, quantity: number, variantId?: string) {
  // Import sécurisé du modèle Product
  const getProductModel = () => {
    try {
      return mongoose.model('Product');
    } catch (error) {
      throw new Error('Product model not available. Make sure to import Product model first.');
    }
  };
  
  const Product = getProductModel();
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Produit introuvable');
  }
  
  if (quantity > 50) {
    throw new Error('Quantité maximale par article: 50');
  }
  
  const getItemKey = (pId: string, vId?: string) => vId ? `${pId}-${vId}` : pId;
  const itemKey = getItemKey(productId, variantId);
  
  const itemIndex = this.items.findIndex((item: any) => {
    const itemProductId = item.product._id 
      ? item.product._id.toString()
      : item.product.toString();
    const existingItemKey = getItemKey(itemProductId, item.variantId);
    return existingItemKey === itemKey;
  });
  
  if (itemIndex >= 0) {
    this.items[itemIndex].quantity = quantity;
    this.items[itemIndex].price = product.price;
  }
  
  return this.save();
};

CartSchema.methods.clearItems = async function(this: ICart) {
  this.items = [];
  return this.save();
};

// Méthodes statiques
CartSchema.statics.findByUser = function(this: ICartModel, userId: string) {
  return this.findOne({ user: userId }).populate('items.product');
};

CartSchema.statics.findBySession = function(this: ICartModel, sessionId: string) {
  return this.findOne({ sessionId }).populate('items.product');
};

CartSchema.statics.findOrCreateCart = async function(this: ICartModel, userId?: string, sessionId?: string) {
  if (!userId && !sessionId) {
    throw new Error('User ID or Session ID is required');
  }
  
  let cart = null;
  
  if (userId) {
    cart = await this.findByUser(userId);
  } else if (sessionId) {
    cart = await this.findBySession(sessionId);
  }
  
  if (!cart) {
    cart = await this.create({
      ...(userId ? { user: userId } : {}),
      ...(sessionId ? { sessionId } : {}),
      items: [],
      totalItems: 0,
      totalAmount: 0
    });
  }
  
  return cart;
};

CartSchema.statics.cleanExpiredCarts = async function(this: ICartModel) {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  
  console.log(`🧹 Cleaned ${result.deletedCount} expired carts`);
  return result;
};

// Éviter la recompilation du modèle
const Cart = (mongoose.models.Cart as ICartModel) || 
  mongoose.model<ICart, ICartModel>('Cart', CartSchema);

export default Cart;