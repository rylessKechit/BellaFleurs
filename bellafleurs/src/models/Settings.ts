import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  shopClosure: {
    isEnabled: boolean;
    startDate: Date;
    endDate: Date;
    reason: string;
    message: string;
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
  }
}, {
  timestamps: true
});

// S'assurer qu'il n'y a qu'un seul document settings
SettingsSchema.index({}, { unique: true });

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);