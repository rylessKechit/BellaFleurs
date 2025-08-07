import mongoose, { Schema, Model } from 'mongoose';
import { IOrder, IOrderItem } from '@/types';

// Schéma pour les items de commande
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
    min: [0, 'Price must be positive']
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

// Schéma pour l'adresse de livraison
const DeliveryAddressSchema = new Schema({
  street: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Street address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters']
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{5}$/, 'Please enter a valid 5-digit zip code']
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'France'
  }
}, { _id: false });

// Schéma pour les informations de livraison
const DeliveryInfoSchema = new Schema({
  type: {
    type: String,
    enum: ['pickup', 'delivery'],
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
    required: [true, 'Delivery date is required'],
    validate: {
      validator: function(date: Date) {
        return date > new Date();
      },
      message: 'Delivery date must be in the future'
    }
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    enum: {
      values: ['9h-12h', '12h-14h', '14h-17h', '17h-19h'],
      message: 'Time slot must be one of: 9h-12h, 12h-14h, 14h-17h, 17h-19h'
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
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Customer phone is required'],
    trim: true,
    match: [
      /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
      'Please enter a valid French phone number'
    ]
  }
}, { _id: false });

// Schéma pour la timeline des statuts
const TimelineSchema = new Schema({
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']
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

// Schéma principal Order
const OrderSchema = new Schema({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    match: [/^BF-\d{8}-\d{4}$/, 'Invalid order number format']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optionnel pour les commandes sans compte
  },
  items: {
    type: [OrderItemSchema],
    required: [true, 'Order items are required'],
    validate: {
      validator: function(items: any[]) {
        return items && items.length > 0;
      },
      message: 'Order must contain at least one item'
    }
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0.01, 'Total amount must be greater than 0']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
      message: 'Status must be one of: pending, confirmed, preparing, ready, delivered, cancelled'
    },
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'failed', 'refunded'],
      message: 'Payment status must be one of: pending, paid, failed, refunded'
    },
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String,
    required: false,
    sparse: true
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
    default: function() {
      return [{
        status: 'pending',
        date: new Date(),
        note: 'Commande créée'
      }];
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les performances
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ 'customerInfo.email': 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'deliveryInfo.date': 1 });
OrderSchema.index({ stripePaymentIntentId: 1 }, { sparse: true });

// Index composés pour les requêtes admin
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, status: 1 });

// Middleware pre-save pour générer le numéro de commande
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Utiliser mongoose.model pour éviter les problèmes de typage
    const OrderModel = mongoose.model('Order');
    const lastOrder = await OrderModel.findOne(
      { orderNumber: new RegExp(`^BF-${dateStr}-`) }
    ).sort({ orderNumber: -1 });
    
    let sequence = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const lastSequence = parseInt((lastOrder as any).orderNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    this.orderNumber = `BF-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }
  next();
});

// Middleware pour mettre à jour la timeline lors du changement de statut
OrderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      date: new Date(),
      note: `Statut changé vers: ${this.status}`
    });
  }
  next();
});

// Virtuals
OrderSchema.virtual('itemsCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

OrderSchema.virtual('totalAmountFormatted').get(function() {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(this.totalAmount);
});

OrderSchema.virtual('isDelivery').get(function() {
  return this.deliveryInfo.type === 'delivery';
});

OrderSchema.virtual('isPickup').get(function() {
  return this.deliveryInfo.type === 'pickup';
});

OrderSchema.virtual('isPaid').get(function() {
  return this.paymentStatus === 'paid';
});

OrderSchema.virtual('isCompleted').get(function() {
  return this.status === 'delivered';
});

OrderSchema.virtual('isCancelled').get(function() {
  return this.status === 'cancelled';
});

OrderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

OrderSchema.virtual('statusLabel').get(function() {
  const labels: Record<string, string> = {
    'pending': 'En attente',
    'confirmed': 'Confirmée',
    'preparing': 'En préparation',
    'ready': 'Prête',
    'delivered': 'Livrée',
    'cancelled': 'Annulée'
  };
  return labels[this.status] || this.status;
});

OrderSchema.virtual('paymentStatusLabel').get(function() {
  const labels: Record<string, string> = {
    'pending': 'En attente',
    'paid': 'Payée',
    'failed': 'Échouée',
    'refunded': 'Remboursée'
  };
  return labels[this.paymentStatus] || this.paymentStatus;
});

// Méthodes statiques
OrderSchema.statics.findByOrderNumber = function(orderNumber: string) {
  return this.findOne({ orderNumber }).populate('user items.product');
};

OrderSchema.statics.findByUser = function(userId: string) {
  return this.find({ user: userId }).sort({ createdAt: -1 }).populate('items.product');
};

OrderSchema.statics.findByEmail = function(email: string) {
  return this.find({ 'customerInfo.email': email.toLowerCase() })
    .sort({ createdAt: -1 })
    .populate('items.product');
};

OrderSchema.statics.findByStatus = function(status: string) {
  return this.find({ status }).sort({ createdAt: -1 }).populate('user items.product');
};

OrderSchema.statics.findByDateRange = function(startDate: Date, endDate: Date) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ createdAt: -1 });
};

OrderSchema.statics.getRevenueStats = function(startDate?: Date, endDate?: Date) {
  const match: any = { paymentStatus: 'paid' };
  if (startDate && endDate) {
    match.createdAt = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);
};

// Méthodes d'instance
OrderSchema.methods.updateStatus = function(newStatus: IOrder['status'], note?: string) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    date: new Date(),
    note: note || `Statut changé vers: ${newStatus}`
  });
  return this.save();
};

OrderSchema.methods.updatePaymentStatus = function(newStatus: IOrder['paymentStatus']) {
  this.paymentStatus = newStatus;
  return this.save();
};

OrderSchema.methods.cancel = function(reason?: string) {
  if (!this.canBeCancelled) {
    throw new Error('Cette commande ne peut pas être annulée');
  }
  return this.updateStatus('cancelled', reason || 'Commande annulée');
};

OrderSchema.methods.calculateTotal = function() {
  return this.items.reduce((total: any, item: any) => total + (item.price * item.quantity), 0);
};

// Interface pour les méthodes statiques
interface IOrderModel extends Model<IOrder> {
  findByOrderNumber(orderNumber: string): Promise<IOrder | null>;
  findByUser(userId: string): Promise<IOrder[]>;
  findByEmail(email: string): Promise<IOrder[]>;
  findByStatus(status: string): Promise<IOrder[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<IOrder[]>;
  getRevenueStats(startDate?: Date, endDate?: Date): Promise<any[]>;
}

// Éviter la recompilation du modèle
const Order = (mongoose.models.Order as unknown as IOrderModel) || 
  mongoose.model<IOrder, IOrderModel>('Order', OrderSchema);

export default Order;