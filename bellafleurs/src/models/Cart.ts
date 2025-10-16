// ================================
// CORRIGER src/models/Cart.ts
// ================================

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
  customPrice?: number;
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
  },
  customPrice: {
    type: Number,
    required: false,
    min: [0, 'Custom price must be positive']
  }
}, { _id: false });

// Schéma principal du panier
const CartSchema = new Schema<ICart, ICartModel, ICartMethods>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },
  sessionId: {
    type: String,
    required: false,
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
    min: [0, 'Total amount cannot be negative'],
    set: (v: number) => Math.round(v * 100) / 100
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index composé pour optimiser les requêtes
CartSchema.index({ user: 1, sessionId: 1 });

// Virtuals
CartSchema.virtual('isEmpty').get(function(this: ICart) {
  return this.items.length === 0;
});

CartSchema.virtual('itemsCount').get(function(this: ICart) {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Middleware pour recalculer les totaux avant sauvegarde
CartSchema.pre('save', function(this: ICart) {
  this.calculateTotals();
});

// Méthodes d'instance
CartSchema.methods.calculateTotals = function(this: ICart) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalAmount = this.items.reduce((total, item) => {
    const price = item.customPrice || item.price;
    return total + (price * item.quantity);
  }, 0);
  
  // Arrondir à 2 décimales
  this.totalAmount = Math.round(this.totalAmount * 100) / 100;
};

// ✅ CORRECTION : Méthode addItem sécurisée
CartSchema.methods.addItem = async function(
  this: ICart,
  productId: string,
  quantity: number = 1,
  variantId?: string,
  variantName?: string,
  variantPrice?: number
): Promise<ICart> {
  
  // ✅ SÉCURITÉ : Import sécurisé du modèle Product
  const getProductModel = () => {
    try {
      return mongoose.model('Product');
    } catch (error) {
      // Si le modèle n'est pas encore importé, essayer de l'importer
      try {
        require('./Product');
        return mongoose.model('Product');
      } catch (err) {
        throw new Error('Product model not available. Make sure to import Product model first.');
      }
    }
  };
  
  const Product = getProductModel();
  
  // ✅ VÉRIFICATION : S'assurer que le produit existe
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Produit introuvable');
  }
  
  if (!product.isActive) {
    throw new Error('Ce produit n\'est plus disponible');
  }
  
  // Validation de la quantité
  if (quantity < 1 || quantity > 50) {
    throw new Error('Quantité invalide (entre 1 et 50)');
  }
  
  // ✅ LOGIQUE : Gestion des variants avec clé unique
  const getItemKey = (pId: string, vId?: string) => vId ? `${pId}-${vId}` : pId;
  const itemKey = getItemKey(productId, variantId);
  
  // ✅ RECHERCHE SÉCURISÉE : Chercher l'item existant
  const itemIndex = this.items.findIndex((item: any) => {
    // ✅ PROTECTION : Vérification null/undefined
    if (!item || !item.product) {
      console.warn('⚠️ Cart item with null product found, skipping...');
      return false;
    }
    
    let itemProductId: string;
    
    // ✅ SÉCURITÉ : Extraction sécurisée de l'ID
    if (typeof item.product === 'object' && item.product._id) {
      itemProductId = item.product._id.toString();
    } else if (typeof item.product === 'string') {
      itemProductId = item.product;
    } else {
      console.warn('⚠️ Invalid product reference in cart item:', item);
      return false;
    }
    
    const existingItemKey = getItemKey(itemProductId, item.variantId);
    return existingItemKey === itemKey;
  });
  
  // Déterminer le prix final
  let finalPrice = variantPrice || product.price;
  
  // Pour les produits avec variants, chercher le prix du variant
  if (product.hasVariants && variantId && !variantPrice) {
    const variant = product.variants?.find((v: any) => v.name === variantId || v._id?.toString() === variantId);
    if (variant) {
      finalPrice = variant.price;
      variantName = variantName || variant.name;
    }
  }
  
  // ✅ LOGIQUE : Ajouter ou mettre à jour l'item
  if (itemIndex >= 0) {
    // Mettre à jour la quantité de l'item existant
    this.items[itemIndex].quantity += quantity;
    this.items[itemIndex].price = finalPrice;
    this.items[itemIndex].addedAt = new Date();
    
    // Mettre à jour les infos variant si nécessaire
    if (variantName) {
      this.items[itemIndex].variantName = variantName;
    }
  } else {
    // Ajouter un nouvel item
    const newItem = {
      product: new mongoose.Types.ObjectId(productId),
      name: product.name,
      price: finalPrice,
      quantity,
      image: product.images?.[0] || '/images/placeholder-product.jpg',
      addedAt: new Date(),
      variantId,
      variantName,
      customPrice: variantPrice
    };
    
    this.items.push(newItem as ICartItem);
  }
  
  // Sauvegarder et retourner
  return this.save();
};

// ✅ CORRECTION : Méthode removeItem sécurisée
CartSchema.methods.removeItem = async function(
  this: ICart, 
  productId: string, 
  variantId?: string
): Promise<ICart> {
  
  // Log tous les items actuels pour debug
  this.items.forEach((item, index) => {
    let itemProductId = 'INVALID';
    if (item.product) {
      if (typeof item.product === 'object' && item.product._id) {
        itemProductId = item.product._id.toString();
      } else if (typeof item.product === 'string') {
        itemProductId = item.product;
      }
    }
  });
  
  const getItemKey = (pId: string, vId?: string) => vId ? `${pId}-${vId}` : pId;
  const targetItemKey = getItemKey(productId, variantId);
  
  // ✅ CALCUL : Nombre d'items avant suppression
  const itemsCountBefore = this.items.length;
  
  // ✅ FILTRAGE SÉCURISÉ avec logs détaillés
  this.items = this.items.filter((item: any, index: number) => {
    // Protection contre les items null/undefined
    if (!item || !item.product) {
      console.warn(`⚠️ Item ${index} is null/invalid, removing...`);
      return false;
    }
    
    let itemProductId: string;
    
    // Extraction sécurisée de l'ID
    if (typeof item.product === 'object' && item.product._id) {
      itemProductId = item.product._id.toString();
    } else if (typeof item.product === 'string') {
      itemProductId = item.product;
    } else {
      console.warn(`⚠️ Item ${index} has invalid product reference, removing:`, item);
      return false;
    }
    
    const existingItemKey = getItemKey(itemProductId, item.variantId);
    const shouldKeep = existingItemKey !== targetItemKey;
    
    return shouldKeep;
  });
  
  // ✅ VÉRIFICATION : Confirmer la suppression
  const itemsCountAfter = this.items.length;
  const itemsRemoved = itemsCountBefore - itemsCountAfter;
  
  if (itemsRemoved === 0) {
    console.warn('⚠️ No items were removed - item not found!');
    // Afficher tous les items pour debug
    this.items.forEach((item, index) => {
      let itemProductId = 'INVALID';
      if (item.product) {
        if (typeof item.product === 'object' && item.product._id) {
          itemProductId = item.product._id.toString();
        } else if (typeof item.product === 'string') {
          itemProductId = item.product;
        }
      }
    });
  }
  
  // ✅ SAUVEGARDE et retour
  const savedCart = await this.save();
  
  return savedCart;
};

// ✅ CORRECTION : Méthode updateQuantity sécurisée
CartSchema.methods.updateQuantity = async function(
  this: ICart,
  productId: string,
  quantity: number,
  variantId?: string
): Promise<ICart> {
  
  // Validation
  if (quantity < 1 || quantity > 50) {
    throw new Error('Quantité invalide (entre 1 et 50)');
  }
  
  const getItemKey = (pId: string, vId?: string) => vId ? `${pId}-${vId}` : pId;
  const targetItemKey = getItemKey(productId, variantId);
  
  // ✅ RECHERCHE SÉCURISÉE
  const itemIndex = this.items.findIndex((item: any) => {
    // Protection contre les items null/undefined
    if (!item || !item.product) {
      console.warn('⚠️ Cart item with null product found during update, skipping...');
      return false;
    }
    
    let itemProductId: string;
    
    // Extraction sécurisée de l'ID
    if (typeof item.product === 'object' && item.product._id) {
      itemProductId = item.product._id.toString();
    } else if (typeof item.product === 'string') {
      itemProductId = item.product;
    } else {
      console.warn('⚠️ Invalid product reference during update:', item);
      return false;
    }
    
    const existingItemKey = getItemKey(itemProductId, item.variantId);
    return existingItemKey === targetItemKey;
  });
  
  if (itemIndex >= 0) {
    this.items[itemIndex].quantity = quantity;
    this.items[itemIndex].addedAt = new Date();
  } else {
    throw new Error('Article introuvable dans le panier');
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

CartSchema.statics.findOrCreateCart = async function(
  this: ICartModel, 
  userId?: string, 
  sessionId?: string
): Promise<ICart> {
  
  if (!userId && !sessionId) {
    throw new Error('User ID or Session ID is required');
  }
  
  let cart = null;
  
  // ✅ RECHERCHE SÉCURISÉE
  try {
    if (userId) {
      cart = await this.findByUser(userId);
    } else if (sessionId) {
      cart = await this.findBySession(sessionId);
    }
  } catch (error) {
    console.warn('⚠️ Error finding cart:', error);
    cart = null;
  }
  
  // ✅ CRÉATION SÉCURISÉE
  if (!cart) {
    try {
      cart = await this.create({
        ...(userId ? { user: userId } : {}),
        ...(sessionId ? { sessionId } : {}),
        items: [],
        totalItems: 0,
        totalAmount: 0
      });
    } catch (error) {
      console.error('❌ Error creating cart:', error);
      throw error;
    }
  }
  
  return cart;
};

CartSchema.statics.cleanExpiredCarts = async function(this: ICartModel) {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  
  return result;
};

// Éviter la recompilation du modèle
const Cart = (mongoose.models.Cart as ICartModel) || 
  mongoose.model<ICart, ICartModel>('Cart', CartSchema);

export default Cart;