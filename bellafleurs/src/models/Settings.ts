import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  shopClosure: {
    isEnabled: boolean;
    startDate: Date;
    endDate: Date;
    reason: string;
    message: string;
  };
  productOfWeek: {
    isEnabled: boolean;
    productId: string;
    title: string;
    description: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
  shopClosure: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    startDate: {
      type: Date,
      required: function(this: ISettings) {
        return this.shopClosure?.isEnabled;
      }
    },
    endDate: {
      type: Date,
      required: function(this: ISettings) {
        return this.shopClosure?.isEnabled;
      }
    },
    reason: {
      type: String,
      default: 'Congés'
    },
    message: {
      type: String,
      default: 'Nous sommes actuellement fermés. Les commandes reprendront bientôt !'
    }
  },
  productOfWeek: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    productId: {
      type: String,
      default: '68db9182e2280ad09cabfa83'
    },
    title: {
      type: String,
      default: 'Produit de la semaine'
    },
    description: {
      type: String,
      default: 'Découvrez notre sélection exceptionnelle cette semaine !'
    }
  }
}, {
  timestamps: true
});

SettingsSchema.index({}, { unique: true });

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);