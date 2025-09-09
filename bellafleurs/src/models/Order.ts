// src/models/Order.ts - Modèle complet avec intégration Stripe
import mongoose, { Schema, Model, Document } from 'mongoose';

// Interface pour les articles de commande
export interface IOrderItem {
  _id?: string;
  product: mongoose.Types.ObjectId; // Référence vers Product
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
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  date: Date;
  note?: string;
}

// Interface pour les informations Stripe
export interface IStripeInfo {
  paymentIntentId?: string;
  chargeId?: string;
  receiptUrl?: string;
  refundId?: string;
  disputeId?: string;
}

// Interface pour les méthodes d'instance
export interface IOrderMethods {
  updateStatus(newStatus: IOrder['status'], note?: string): Promise<IOrder>;
  updatePaymentStatus(newStatus: IOrder['paymentStatus']): Promise<IOrder>;
  cancel(reason?: string): Promise<IOrder>;
  calculateTotal(): number;
  addTimelineEntry(status: IOrder['status'], note?: string): Promise<IOrder>;
  canBeCancelled(): boolean;
  canBeRefunded(): boolean;
  generateReceiptData(): any;
}

// Interface principale pour le document Order
export interface IOrder extends Document, IOrderMethods {
  orderNumber: string;
  user?: mongoose.Types.ObjectId; // ObjectId de l'utilisateur (optionnel pour les invités)
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  paymentMethod: 'card' | 'paypal';
  
  // Informations Stripe
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeReceiptUrl?: string;
  stripeRefundId?: string;
  stripeDisputeId?: string;
  
  deliveryInfo: IDeliveryInfo;
  customerInfo: ICustomerInfo;
  adminNotes?: string;
  timeline: ITimelineEntry[];
  estimatedDelivery?: Date;
  
  // Dates de tracking
  confirmedAt?: Date;
  preparedAt?: Date;
  readyAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  itemsCount: number;
  isCompleted: boolean;
  isPaid: boolean;
  canBeCancelledVirtual: boolean;
  canBeRefundedVirtual: boolean;
  daysSinceOrder: number;
}

// Interface pour les méthodes statiques
export interface IOrderModel extends Model<IOrder, {}, IOrderMethods> {
  generateOrderNumber(): Promise<string>;
  findByOrderNumber(orderNumber: string): Promise<IOrder | null>;
  findByUser(userId: string): Promise<IOrder[]>;
  findByEmail(email: string): Promise<IOrder[]>;
  findByStatus(status: IOrder['status']): Promise<IOrder[]>;
  findByPaymentStatus(paymentStatus: IOrder['paymentStatus']): Promise<IOrder[]>;
  findByStripePaymentIntent(paymentIntentId: string): Promise<IOrder | null>;
  getOrderStats(startDate?: Date, endDate?: Date): Promise<any>;
  getPendingOrders(): Promise<IOrder[]>;
  getOverdueOrders(): Promise<IOrder[]>;
}

// Type pour le document complet
export type IOrderDocument = IOrder & IOrderMethods;

// Schéma pour les articles
const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be positive'],
    set: (v: number) => Math.round(v * 100) / 100
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [100, 'Quantity cannot exceed 100']
  },
  image: {
    type: String,
    required: [true, 'Product image is required'],
    match: [/^https?:\/\/.+/, 'Invalid image URL']
  }
}, { _id: false });

// Schéma pour l'adresse
const AddressSchema = new Schema({
  street: {
    type: String,
    required: [true, 'Street is required'],
    trim: true,
    maxlength: [200, 'Street cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  zipCode: {
    type: String,
    required: [true, 'Zip code is required'],
    match: [/^\d{5}$/, 'Invalid French zip code format']
  },
  complement: {
    type: String,
    trim: true,
    maxlength: [200, 'Address complement cannot exceed 200 characters']
  }
}, { _id: false });

// Schéma pour les informations de livraison
const DeliveryInfoSchema = new Schema({
  type: {
    type: String,
    enum: {
      values: ['delivery', 'pickup'],
      message: 'Delivery type must be either delivery or pickup'
    },
    required: [true, 'Delivery type is required']
  },
  address: {
    type: AddressSchema,
    required: function(this: any) {
      return this.type === 'delivery';
    }
  },
  date: {
    type: Date,
    required: [true, 'Delivery date is required'],
    validate: {
      validator: function(date: Date) {
        return date >= new Date();
      },
      message: 'Delivery date cannot be in the past'
    }
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    enum: {
      values: ['9h-12h', '12h-14h', '14h-17h', '17h-19h'],
      message: 'Invalid time slot'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Delivery notes cannot exceed 500 characters']
  }
}, { _id: false });

// Schéma pour les informations client
const CustomerInfoSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
  },
  phone: {
    type: String,
    required: [true, 'Customer phone is required'],
    trim: true,
    match: [/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Invalid French phone number format']
  }
}, { _id: false });

// Schéma pour la timeline
const TimelineSchema = new Schema({
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
      message: 'Invalid timeline status'
    },
    required: [true, 'Timeline status is required']
  },
  date: {
    type: Date,
    default: Date.now,
    required: [true, 'Timeline date is required']
  },
  note: {
    type: String,
    trim: true,
    maxlength: [500, 'Timeline note cannot exceed 500 characters']
  }
}, { _id: false });

// Schéma principal de la commande
const OrderSchema = new Schema<IOrder, IOrderModel, IOrderMethods>({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    match: [/^BF-\d{8}-\d{4}$/, 'Invalid order number format']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optionnel pour les commandes d'invités
    sparse: true
  },
  items: {
    type: [OrderItemSchema],
    required: [true, 'Order items are required'],
    validate: {
      validator: function(items: IOrderItem[]) {
        return items && items.length > 0;
      },
      message: 'At least one item is required'
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
      values: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
      message: 'Invalid order status'
    },
    default: 'pending',
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
    default: 'card',
    required: [true, 'Payment method is required']
  },
  
  // Champs Stripe
  stripePaymentIntentId: {
    type: String,
    sparse: true, // Permet les valeurs null sans conflit d'unicité
    match: [/^pi_[a-zA-Z0-9_]+$/, 'Invalid Stripe Payment Intent ID format']
  },
  stripeChargeId: {
    type: String,
    sparse: true,
    match: [/^ch_[a-zA-Z0-9_]+$/, 'Invalid Stripe Charge ID format']
  },
  stripeReceiptUrl: {
    type: String,
    match: [/^https:\/\/pay\.stripe\.com\/receipts\//, 'Invalid Stripe receipt URL']
  },
  stripeRefundId: {
    type: String,
    match: [/^re_[a-zA-Z0-9_]+$/, 'Invalid Stripe Refund ID format']
  },
  stripeDisputeId: {
    type: String,
    match: [/^dp_[a-zA-Z0-9_]+$/, 'Invalid Stripe Dispute ID format']
  },
  
  deliveryInfo: {
    type: DeliveryInfoSchema,
    required: [true, 'Delivery information is required']
  },
  customerInfo: {
    type: CustomerInfoSchema,
    required: [true, 'Customer information is required']
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
        status: this.status || 'pending',
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

// Index pour les performances
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ 'customerInfo.email': 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ stripePaymentIntentId: 1 }, { sparse: true });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ estimatedDelivery: 1 });

// Virtuals
OrderSchema.virtual('itemsCount').get(function(this: IOrder) {
  return this.items ? this.items.length : 0;
});

OrderSchema.virtual('isCompleted').get(function(this: IOrder) {
  return this.status === 'delivered';
});

OrderSchema.virtual('isPaid').get(function(this: IOrder) {
  return this.paymentStatus === 'paid';
});

OrderSchema.virtual('canBeCancelledVirtual').get(function(this: IOrder) {
  return ['pending', 'confirmed', 'preparing'].includes(this.status);
});

OrderSchema.virtual('canBeRefundedVirtual').get(function(this: IOrder) {
  return this.paymentStatus === 'paid' && 
         ['confirmed', 'preparing', 'ready', 'cancelled'].includes(this.status);
});

OrderSchema.virtual('daysSinceOrder').get(function(this: IOrder) {
  const now = new Date();
  const orderDate = new Date(this.createdAt);
  return Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
});

// Méthodes d'instance
OrderSchema.methods.updateStatus = function(this: IOrder, newStatus: IOrder['status'], note?: string) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Mettre à jour les dates de tracking
  const now = new Date();
  switch (newStatus) {
    case 'confirmed':
      this.confirmedAt = now;
      break;
    case 'preparing':
      this.preparedAt = now;
      break;
    case 'ready':
      this.readyAt = now;
      break;
    case 'delivered':
      this.deliveredAt = now;
      break;
    case 'cancelled':
      this.cancelledAt = now;
      break;
  }
  
  // Ajouter à la timeline
  this.timeline.push({
    status: newStatus,
    date: now,
    note: note || `Statut changé de ${oldStatus} vers ${newStatus}`
  } as ITimelineEntry);
  
  return this.save();
};

OrderSchema.methods.updatePaymentStatus = function(this: IOrder, newStatus: IOrder['paymentStatus']) {
  this.paymentStatus = newStatus;
  return this.save();
};

OrderSchema.methods.cancel = function(this: IOrder, reason?: string) {
  if (!this.canBeCancelled()) {
    throw new Error('Cette commande ne peut plus être annulée');
  }
  
  return this.updateStatus('cancelled', reason || 'Commande annulée');
};

OrderSchema.methods.calculateTotal = function(this: IOrder) {
  return this.items.reduce((total: number, item: IOrderItem) => {
    return total + (item.price * item.quantity);
  }, 0);
};

OrderSchema.methods.addTimelineEntry = function(this: IOrder, status: IOrder['status'], note?: string) {
  this.timeline.push({
    status,
    date: new Date(),
    note
  } as ITimelineEntry);
  return this.save();
};

OrderSchema.methods.canBeCancelled = function(this: IOrder) {
  return this.canBeCancelledVirtual;
};

OrderSchema.methods.canBeRefunded = function(this: IOrder) {
  return this.canBeRefundedVirtual;
};

OrderSchema.methods.generateReceiptData = function(this: IOrder) {
  return {
    orderNumber: this.orderNumber,
    date: this.createdAt,
    customer: this.customerInfo,
    items: this.items,
    totalAmount: this.totalAmount,
    paymentMethod: this.paymentMethod,
    deliveryInfo: this.deliveryInfo,
    stripeReceiptUrl: this.stripeReceiptUrl
  };
};

// Middleware pre-save
OrderSchema.pre('save', function(this: IOrder, next) {
  // Valider le total calculé
  if (this.isModified('items')) {
    const calculatedTotal = this.calculateTotal();
    if (Math.abs(this.totalAmount - calculatedTotal) > 0.01) {
      this.totalAmount = calculatedTotal;
    }
  }
  
  // Estimer la livraison si pas définie
  if (!this.estimatedDelivery && this.deliveryInfo) {
    const deliveryDate = new Date(this.deliveryInfo.date);
    this.estimatedDelivery = deliveryDate;
  }
  
  next();
});

// Méthodes statiques
OrderSchema.statics.generateOrderNumber = async function(this: IOrderModel) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Compter les commandes du jour
  const count = await this.countDocuments({
    orderNumber: { $regex: `^BF-${dateStr}-` }
  });
  
  const orderNum = (count + 1).toString().padStart(4, '0');
  return `BF-${dateStr}-${orderNum}`;
};

OrderSchema.statics.findByOrderNumber = function(this: IOrderModel, orderNumber: string) {
  return this.findOne({ orderNumber }).populate('items.product', 'name images');
};

OrderSchema.statics.findByUser = function(this: IOrderModel, userId: string) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('items.product', 'name images');
};

OrderSchema.statics.findByEmail = function(this: IOrderModel, email: string) {
  return this.find({ 'customerInfo.email': email })
    .sort({ createdAt: -1 })
    .populate('items.product', 'name images');
};

OrderSchema.statics.findByStatus = function(this: IOrderModel, status: IOrder['status']) {
  return this.find({ status })
    .sort({ createdAt: -1 })
    .populate('items.product', 'name images');
};

OrderSchema.statics.findByPaymentStatus = function(this: IOrderModel, paymentStatus: IOrder['paymentStatus']) {
  return this.find({ paymentStatus })
    .sort({ createdAt: -1 })
    .populate('items.product', 'name images');
};

OrderSchema.statics.findByStripePaymentIntent = function(this: IOrderModel, paymentIntentId: string) {
  return this.findOne({ stripePaymentIntentId: paymentIntentId })
    .populate('items.product', 'name images');
};

OrderSchema.statics.getOrderStats = async function(this: IOrderModel, startDate?: Date, endDate?: Date) {
  const matchStage: any = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = startDate;
    if (endDate) matchStage.createdAt.$lte = endDate;
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        paidOrders: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    paidOrders: 0,
    deliveredOrders: 0
  };
};

OrderSchema.statics.getPendingOrders = function(this: IOrderModel) {
  return this.find({ 
    status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
  }).sort({ createdAt: -1 });
};

OrderSchema.statics.getOverdueOrders = function(this: IOrderModel) {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  return this.find({
    status: { $in: ['pending', 'confirmed', 'preparing'] },
    createdAt: { $lt: threeDaysAgo }
  }).sort({ createdAt: 1 });
};

// Export du modèle
const Order = (mongoose.models.Order as IOrderModel) || 
  mongoose.model<IOrder, IOrderModel>('Order', OrderSchema);

export default Order;