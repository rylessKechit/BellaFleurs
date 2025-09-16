// src/models/Order.ts - Index corrigés 
import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IOrderItem {
  _id?: string;
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
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
    match: [/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Invalid phone format']
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
    required: true,
    default: Date.now
  },
  note: {
    type: String,
    trim: true,
    maxlength: [200, 'Timeline note cannot exceed 200 characters']
  }
}, { _id: false });

// Schéma principal
const OrderSchema = new Schema<IOrder, IOrderModel, IOrderMethods>({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    // CORRECTION: Pas de unique ici car on définit l'index séparément
    trim: true,
    match: [/^BF-\d{8}-\d{4}$/, 'Invalid order number format']
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
    default: 'card',
    required: [true, 'Payment method is required']
  },
  
  // Champs Stripe - CORRECTION: pas d'index unique dans le schéma
  stripePaymentIntentId: {
    type: String,
    match: [/^pi_[a-zA-Z0-9_]+$/, 'Invalid Stripe Payment Intent ID format']
  },
  stripeChargeId: {
    type: String,
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

// CORRECTION: Index définis UNE SEULE FOIS ici
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ 'customerInfo.email': 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ stripePaymentIntentId: 1 }, { unique: true, sparse: true });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ estimatedDelivery: 1 });

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
  
  // Ajouter à la timeline
  this.timeline.push({
    status: newStatus,
    date: new Date(),
    note: note || `Statut changé vers ${newStatus}`
  });
  
  // Mettre à jour les dates de tracking
  switch (newStatus) {
    case 'en_creation':
      this.confirmedAt = new Date();
      break;
    case 'prête':
      this.preparedAt = new Date();
      this.readyAt = new Date();
      break;
    case 'livrée':
      this.deliveredAt = new Date();
      break;
    case 'annulée':
      this.cancelledAt = new Date();
      break;
  }
  
  return await this.save();
};

OrderSchema.methods.cancel = async function(this: IOrder, reason?: string): Promise<IOrder> {
  if (!this.canBeCancelled) {
    throw new Error('Cette commande ne peut plus être annulée');
  }
  
  return await this.updateStatus('annulée', reason || 'Commande annulée');
};

// Méthodes statiques
OrderSchema.statics.generateOrderNumber = async function(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const count = await this.countDocuments({
    createdAt: {
      $gte: new Date(today.setHours(0, 0, 0, 0)),
      $lt: new Date(today.setHours(23, 59, 59, 999))
    }
  });
  
  const orderNum = String(count + 1).padStart(4, '0');
  return `BF-${dateStr}-${orderNum}`;
};

const Order = (mongoose.models.Order as IOrderModel) || 
  mongoose.model<IOrder, IOrderModel>('Order', OrderSchema);

export default Order;