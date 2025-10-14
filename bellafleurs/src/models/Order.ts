// src/models/Order.ts - MISE À JOUR avec support message cadeau
import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IOrderItem {
  _id?: string;
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variantId?: string;
  variantName?: string;
  customPrice?: number;
}

export interface IDeliveryAddress {
  street: string;
  city: string;
  zipCode: string;
  complement?: string;
}

export interface IDeliveryInfo {
  type: 'delivery' | 'pickup';
  address?: IDeliveryAddress;
  date: Date;
  notes?: string;
}

export interface ICustomerInfo {
  name: string;
  email: string;
  phone: string;
}

// ✨ NOUVEAU : Interface pour les informations cadeau avec message
export interface IGiftInfo {
  recipientName: string;
  senderName: string;
  message?: string; // ✨ NOUVEAU CHAMP MESSAGE
}

export interface ITimelineEntry {
  status: 'payée' | 'en_creation' | 'prête' | 'en_livraison' | 'livrée' | 'annulée';
  date: Date;
  note?: string;
}

export interface IOrderMethods {
  updateStatus(newStatus: IOrder['status'], note?: string): Promise<IOrder>;
  updatePaymentStatus(newStatus: IOrder['paymentStatus']): Promise<IOrder>;
  cancel(reason?: string): Promise<IOrder>;
  calculateTotal(): number;
  addTimelineEntry(status: IOrder['status'], note?: string): Promise<IOrder>;
  canBeCancelled(): boolean;
  canBeRefunded(): boolean;
}

export interface IOrder extends Document, IOrderMethods {
  orderNumber: string;
  user?: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: 'payée' | 'en_creation' | 'prête' | 'en_livraison' | 'livrée' | 'annulée';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  paymentMethod: 'card' | 'paypal';
  
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeReceiptUrl?: string;
  stripeRefundId?: string;
  stripeDisputeId?: string;
  
  deliveryInfo: IDeliveryInfo;
  customerInfo: ICustomerInfo;
  
  // ✨ NOUVEAU : Support système cadeau avec message
  isGift?: boolean;
  giftInfo?: IGiftInfo;
  
  adminNotes?: string;
  timeline: ITimelineEntry[];
  estimatedDelivery?: Date;
  
  confirmedAt?: Date;
  preparedAt?: Date;
  readyAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderModel extends Model<IOrder, {}, IOrderMethods> {
  generateOrderNumber(): Promise<string>;
}

export type IOrderDocument = IOrder & IOrderMethods;

// Sous-schémas
const OrderItemSchema = new Schema({
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
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [100, 'Quantity cannot exceed 100']
  },
  image: {
    type: String,
    required: [true, 'Product image is required']
  },
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
    min: [0, 'Custom price cannot be negative']
  }
}, { _id: false });

const DeliveryAddressSchema = new Schema({
  street: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Street cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{5}$/, 'Invalid zip code format']
  },
  complement: {
    type: String,
    trim: true,
    maxlength: [200, 'Complement cannot exceed 200 characters']
  }
}, { _id: false });

const DeliveryInfoSchema = new Schema({
  type: {
    type: String,
    enum: {
      values: ['delivery', 'pickup'],
      message: 'Type must be either delivery or pickup'
    },
    required: [true, 'Delivery type is required']
  },
  address: {
    type: DeliveryAddressSchema,
    required: function(this: any) {
      return this.type === 'delivery';
    }
  },
  date: {
    type: Date,
    required: [true, 'Delivery date is required']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, { _id: false });

const CustomerInfoSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Customer email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  phone: {
    type: String,
    required: [true, 'Customer phone is required'],
    trim: true,
    match: [/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Invalid French phone number']
  }
}, { _id: false });

// ✨ NOUVEAU : Schéma pour les informations cadeau avec message
const GiftInfoSchema = new Schema({
  recipientName: {
    type: String,
    required: [true, 'Recipient name is required for gifts'],
    trim: true,
    maxlength: [100, 'Recipient name cannot exceed 100 characters']
  },
  senderName: {
    type: String,
    required: [true, 'Sender name is required for gifts'],
    trim: true,
    maxlength: [100, 'Sender name cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: false,
    trim: true,
    maxlength: [300, 'Gift message cannot exceed 300 characters']
  }
}, { _id: false });

const TimelineSchema = new Schema({
  status: {
    type: String,
    enum: ['payée', 'en_creation', 'prête', 'en_livraison', 'livrée', 'annulée'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  note: {
    type: String,
    trim: true,
    maxlength: [500, 'Timeline note cannot exceed 500 characters']
  }
}, { _id: false });

// Schéma principal Order - MISE À JOUR avec support cadeau et message
const OrderSchema = new Schema({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    trim: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  items: {
    type: [OrderItemSchema],
    required: [true, 'Order items are required'],
    validate: {
      validator: function(items: IOrderItem[]) {
        return items && items.length > 0;
      },
      message: 'Order must contain at least one item'
    }
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0.01, 'Total amount must be greater than 0'],
    set: (v: number) => Math.round(v * 100) / 100
  },
  status: {
    type: String,
    enum: {
      values: ['payée', 'en_creation', 'prête', 'en_livraison', 'livrée', 'annulée'],
      message: 'Invalid order status'
    },
    default: 'payée',
    required: [true, 'Order status is required']
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      message: 'Invalid payment status'
    },
    default: 'pending',
    required: [true, 'Payment status is required']
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['card', 'paypal'],
      message: 'Invalid payment method'
    },
    required: [true, 'Payment method is required']
  },
  
  // Stripe payment fields
  stripePaymentIntentId: {
    type: String,
    unique: true,
    sparse: true
  },
  stripeChargeId: String,
  stripeReceiptUrl: String,
  stripeRefundId: String,
  stripeDisputeId: String,
  
  deliveryInfo: {
    type: DeliveryInfoSchema,
    required: [true, 'Delivery information is required']
  },
  customerInfo: {
    type: CustomerInfoSchema,
    required: [true, 'Customer information is required']
  },
  
  // ✨ NOUVEAU : Champs cadeau avec message
  isGift: {
    type: Boolean,
    default: false
  },
  giftInfo: {
    type: GiftInfoSchema,
    required: function(this: any) {
      return this.isGift === true;
    }
  },
  
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  },
  timeline: {
    type: [TimelineSchema],
    default: function(this: any) {
      return [{
        status: this.status || 'payée',
        date: new Date(),
        note: 'Commande créée'
      }];
    }
  },
  estimatedDelivery: {
    type: Date,
    validate: {
      validator: function(date: Date) {
        return !date || date >= new Date();
      },
      message: 'Estimated delivery cannot be in the past'
    }
  },
  
  // Dates de tracking
  confirmedAt: Date,
  preparedAt: Date,
  readyAt: Date,
  deliveredAt: Date,
  cancelledAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ 'customerInfo.email': 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ stripePaymentIntentId: 1 }, { unique: true, sparse: true });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ estimatedDelivery: 1 });
OrderSchema.index({ isGift: 1 }); // ✨ NOUVEAU : Index pour les cadeaux

// Virtuals
OrderSchema.virtual('itemsCount').get(function(this: IOrder) {
  return this.items ? this.items.reduce((total, item) => total + item.quantity, 0) : 0;
});

OrderSchema.virtual('totalAmountFormatted').get(function(this: IOrder) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(this.totalAmount);
});

OrderSchema.virtual('isDelivery').get(function(this: IOrder) {
  return this.deliveryInfo.type === 'delivery';
});

OrderSchema.virtual('isPickup').get(function(this: IOrder) {
  return this.deliveryInfo.type === 'pickup';
});

OrderSchema.virtual('isPaid').get(function(this: IOrder) {
  return this.paymentStatus === 'paid';
});

OrderSchema.virtual('isCompleted').get(function(this: IOrder) {
  return this.status === 'livrée';
});

OrderSchema.virtual('isCancelled').get(function(this: IOrder) {
  return this.status === 'annulée';
});

OrderSchema.virtual('canBeCancelled').get(function(this: IOrder) {
  return ['payée', 'en_creation'].includes(this.status);
});

// Méthodes d'instance
OrderSchema.methods.calculateTotal = function(this: IOrder): number {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

OrderSchema.methods.updateStatus = async function(this: IOrder, newStatus: IOrder['status'], note?: string): Promise<IOrder> {
  this.status = newStatus;
  
  // Mettre à jour les dates de tracking
  const now = new Date();
  switch (newStatus) {
    case 'payée':
      if (!this.confirmedAt) this.confirmedAt = now;
      break;
    case 'en_creation':
      if (!this.preparedAt) this.preparedAt = now;
      break;
    case 'prête':
      if (!this.readyAt) this.readyAt = now;
      break;
    case 'livrée':
      if (!this.deliveredAt) this.deliveredAt = now;
      break;
    case 'annulée':
      if (!this.cancelledAt) this.cancelledAt = now;
      break;
  }
  
  // Ajouter à la timeline
  this.timeline.push({
    status: newStatus,
    date: now,
    note
  });
  
  return this.save();
};

OrderSchema.methods.updatePaymentStatus = async function(this: IOrder, newStatus: IOrder['paymentStatus']): Promise<IOrder> {
  this.paymentStatus = newStatus;
  
  this.timeline.push({
    status: this.status,
    date: new Date(),
    note: `Paiement: ${newStatus}`
  });
  
  return this.save();
};

OrderSchema.methods.cancel = async function(this: IOrder, reason?: string): Promise<IOrder> {
  if (!this.canBeCancelled()) {
    throw new Error('Cette commande ne peut plus être annulée');
  }
  
  return this.updateStatus('annulée', reason || 'Commande annulée');
};

OrderSchema.methods.addTimelineEntry = async function(this: IOrder, status: IOrder['status'], note?: string): Promise<IOrder> {
  this.timeline.push({
    status,
    date: new Date(),
    note
  });
  
  return this.save();
};

OrderSchema.methods.canBeRefunded = function(this: IOrder): boolean {
  return this.paymentStatus === 'paid' && ['livrée', 'annulée'].includes(this.status);
};

// Méthodes statiques
OrderSchema.statics.generateOrderNumber = async function(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Trouver le prochain numéro séquentiel pour aujourd'hui
  const todayPrefix = `BF-${year}${month}${day}`;
  const todayOrders = await this.find({
    orderNumber: { $regex: `^${todayPrefix}` }
  }).sort({ orderNumber: -1 }).limit(1);
  
  let sequence = 1;
  if (todayOrders.length > 0) {
    const lastOrderNumber = todayOrders[0].orderNumber;
    const lastSequence = parseInt(lastOrderNumber.split('-')[2], 10);
    sequence = lastSequence + 1;
  }
  
  return `${todayPrefix}-${String(sequence).padStart(4, '0')}`;
};

// Middleware pre-save
OrderSchema.pre('save', async function(this: IOrder, next) {
  // Générer un numéro de commande si nouveau document
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = await (this.constructor as IOrderModel).generateOrderNumber();
  }
  
  // Recalculer le total si les items ont changé
  if (this.isModified('items')) {
    this.totalAmount = this.calculateTotal();
  }
  
  // ✨ NOUVEAU : Validation cadeau - si isGift est true, giftInfo doit être présent
  if (this.isGift && !this.giftInfo) {
    return next(new Error('Gift information is required when isGift is true'));
  }
  
  // ✨ NOUVEAU : Si ce n'est pas un cadeau, supprimer giftInfo
  if (!this.isGift && this.giftInfo) {
    this.giftInfo = undefined;
  }
  
  next();
});

// Middleware post-save pour les notifications
OrderSchema.post('save', function(this: IOrder) {
  // Ici on pourrait ajouter des notifications par email, etc.
  console.log(`✅ Order ${this.orderNumber} saved with status: ${this.status}`);
});

const Order = (mongoose.models.Order as IOrderModel) || 
  mongoose.model<IOrder, IOrderModel>('Order', OrderSchema);

export default Order;