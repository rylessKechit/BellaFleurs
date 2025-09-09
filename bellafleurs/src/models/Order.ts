// src/models/Order.ts - Modèle complet
import mongoose, { Schema, Document } from 'mongoose';

// Interface pour les articles de commande
export interface IOrderItem {
  _id?: string;
  product: string; // ObjectId du produit
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Interface pour l'adresse de livraison
export interface IDeliveryAddress {
  street: string;
  city: string;
  zipCode: string;
  complement?: string;
}

// Interface pour les informations de livraison
export interface IDeliveryInfo {
  type: 'delivery' | 'pickup';
  address?: IDeliveryAddress;
  date: Date;
  timeSlot: string;
  notes?: string;
}

// Interface pour les informations client
export interface ICustomerInfo {
  name: string;
  email: string;
  phone: string;
}

// Interface pour la timeline
export interface ITimelineEntry {
  status: 'validé' | 'en_cours_creation' | 'prête' | 'en_livraison' | 'livré';
  date: Date;
  note?: string;
}

// Interface principale pour le document Order
export interface IOrder extends Document {
  orderNumber: string;
  user?: string; // ObjectId de l'utilisateur (optionnel pour les invités)
  items: IOrderItem[];
  totalAmount: number;
  status: 'validé' | 'en_cours_creation' | 'prête' | 'en_livraison' | 'livré';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  stripePaymentIntentId?: string;
  deliveryInfo: IDeliveryInfo;
  customerInfo: ICustomerInfo;
  adminNotes?: string;
  timeline: ITimelineEntry[];
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Méthodes d'instance
  updateStatus(newStatus: IOrder['status'], note?: string): Promise<IOrder>;
  updatePaymentStatus(newStatus: IOrder['paymentStatus']): Promise<IOrder>;
  cancel(reason?: string): Promise<IOrder>;
  calculateTotal(): number;
  
  // Virtuals
  itemsCount: number;
  isCompleted: boolean;
  isPaid: boolean;
  canBeCancelled: boolean;
}

// Schéma pour les articles
const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    required: true
  }
});

// Schéma pour l'adresse
const AddressSchema = new Schema({
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true,
    match: /^\d{5}$/
  },
  complement: String
}, { _id: false });

// Schéma pour les informations de livraison
const DeliveryInfoSchema = new Schema({
  type: {
    type: String,
    enum: ['delivery', 'pickup'],
    required: true
  },
  address: {
    type: AddressSchema,
    required: function(this: any) {
      return this.type === 'delivery';
    }
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true,
    enum: ['9h-12h', '12h-14h', '14h-17h', '17h-19h']
  },
  notes: String
}, { _id: false });

// Schéma pour les informations client
const CustomerInfoSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phone: {
    type: String,
    required: true
  }
}, { _id: false });

// Schéma pour la timeline
const TimelineSchema = new Schema({
  status: {
    type: String,
    enum: ['validé', 'en_cours_creation', 'prête', 'en_livraison', 'livré'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  note: String
}, { _id: false });

// Schéma principal de la commande
const OrderSchema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^BF-\d{8}-\d{4}$/
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optionnel pour les commandes d'invités
  },
  items: {
    type: [OrderItemSchema],
    required: true,
    validate: {
      validator: function(items: IOrderItem[]) {
        return items && items.length > 0;
      },
      message: 'Au moins un article est requis'
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['validé', 'en_cours_creation', 'prête', 'en_livraison', 'livré'],
    default: 'validé',
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
    required: true
  },
  stripePaymentIntentId: {
    type: String,
    sparse: true // Permet les valeurs null sans conflit d'unicité
  },
  deliveryInfo: {
    type: DeliveryInfoSchema,
    required: true
  },
  customerInfo: {
    type: CustomerInfoSchema,
    required: true
  },
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  timeline: {
    type: [TimelineSchema],
    default: function(this: any) {
      return [{
        status: this.status || 'validé',
        date: new Date(),
        note: 'Commande créée'
      }];
    }
  },
  estimatedDelivery: {
    type: Date,
    required: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les performances
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ 'customerInfo.email': 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

// Virtuals
OrderSchema.virtual('itemsCount').get(function(this: IOrder) {
  return this.items ? this.items.length : 0;
});

OrderSchema.virtual('isCompleted').get(function(this: IOrder) {
  return this.status === 'livré';
});

OrderSchema.virtual('isPaid').get(function(this: IOrder) {
  return this.paymentStatus === 'paid';
});

OrderSchema.virtual('canBeCancelled').get(function(this: IOrder) {
  return ['validé', 'en_cours_creation'].includes(this.status);
});

// Méthodes d'instance
OrderSchema.methods.updateStatus = function(newStatus: IOrder['status'], note?: string) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    date: new Date(),
    note: note || `Statut changé vers ${newStatus}`
  });
  this.updatedAt = new Date();
  return this.save();
};

OrderSchema.methods.updatePaymentStatus = function(newStatus: IOrder['paymentStatus']) {
  this.paymentStatus = newStatus;
  this.updatedAt = new Date();
  return this.save();
};

OrderSchema.methods.cancel = function(reason?: string) {
  if (!this.canBeCancelled) {
    throw new Error('Cette commande ne peut plus être annulée');
  }
  
  this.status = 'livré'; // Pas de statut 'cancelled' dans votre enum
  this.timeline.push({
    status: this.status,
    date: new Date(),
    note: reason || 'Commande annulée'
  });
  this.updatedAt = new Date();
  return this.save();
};

OrderSchema.methods.calculateTotal = function() {
  return this.items.reduce((total: number, item: IOrderItem) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Middleware pre-save pour valider le total
OrderSchema.pre('save', function(this: IOrder, next) {
  if (this.isModified('items')) {
    const calculatedTotal = this.calculateTotal();
    if (Math.abs(this.totalAmount - calculatedTotal) > 0.01) {
      this.totalAmount = calculatedTotal;
    }
  }
  next();
});

// Méthodes statiques
OrderSchema.statics.generateOrderNumber = async function() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Compter les commandes du jour
  const count = await this.countDocuments({
    orderNumber: { $regex: `^BF-${dateStr}-` }
  });
  
  const orderNum = (count + 1).toString().padStart(4, '0');
  return `BF-${dateStr}-${orderNum}`;
};

OrderSchema.statics.findByOrderNumber = function(orderNumber: string) {
  return this.findOne({ orderNumber });
};

OrderSchema.statics.findByUser = function(userId: string) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

OrderSchema.statics.findByEmail = function(email: string) {
  return this.find({ 'customerInfo.email': email }).sort({ createdAt: -1 });
};

OrderSchema.statics.findByStatus = function(status: IOrder['status']) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Export du modèle
const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;