import { Schema, model, Document, Model, Types } from 'mongoose';

// --- INTERFACES ---
export interface IBanner extends Document {
  websiteBannerUrl: string;
  mobileBannerUrl: string;
  redirectUrl: string;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBannerStatics {
  getNextPriority(): Promise<number>;
}

export interface IBannerModel extends Model<IBanner, {}, {}>, IBannerStatics {}

// --- SCHEMA DEFINITION ---
const bannerSchema = new Schema<IBanner, IBannerModel>({
  websiteBannerUrl: {
    type: String,
    required: true,
  },
  mobileBannerUrl: {
    type: String,
    required: true,
  },
  redirectUrl: {
    type: String,
    required: true,
  },
  priority: { 
    type: Number,
  },
  isActive: { 
    type: Boolean, 
    default: true,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    },
  },
});

// Ensures priority is unique ONLY for banners that are currently active
bannerSchema.index(
  { priority: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);

// --- STATIC METHODS ---
// Find the highest current priority and return the next number in sequence
bannerSchema.statics.getNextPriority = async function() {
  const highestPriorityBanner = await this.findOne({}).sort({ priority: -1 });
  return highestPriorityBanner ? highestPriorityBanner.priority + 1 : 1;
};

// --- MIDDLEWARE ---
// This hook runs BEFORE validation to auto-assign a priority to new banners
bannerSchema.pre('validate', async function(next) {
  if (this.isNew && this.priority == null) {
    this.priority = await (this.constructor as IBannerModel).getNextPriority();
  }
  next();
});

const BannerV2 = model<IBanner, IBannerModel>('BannerV2', bannerSchema);
export default BannerV2;