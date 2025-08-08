import { Schema, model, Document, Types, Model } from 'mongoose';

export interface IBanner extends Document {
  title?: string;
  description?: string;
  imageUrl?: string;
  classId?: Types.ObjectId;
  isActive: boolean;
  priority: number;
  startDate?: Date;
  endDate?: Date;  createdBy?: Types.ObjectId;edAt: Date;
  updatedAt: Date;
}

export interface IBannerMethods {
  // No instance methods needed
}

export interface IBannerStatics {
  getActiveBanners(): Promise<IBanner[]>;
  getNextPriority(): Promise<number>;
}

export interface IBannerModel extends Model<IBanner, {}, IBannerMethods>, IBannerStatics {}

const bannerSchema = new Schema<IBanner, IBannerModel, IBannerMethods>({
  // Banner content (all optional)
  title: {
    type: String,
    maxLength: 100
  },
  description: {
    type: String,
    maxLength: 500
  },
  imageUrl: {
    type: String
  },
  
  // Optional class reference
  classId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Class',
    default: null
  },
  
  // Banner management
  isActive: { 
    type: Boolean, 
    default: true 
  },  priority: { 
    type: Number, 
    required: false,
    min: 1  },
  
  // Scheduling (optional)
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
    // Metadata
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes for performance
bannerSchema.index({ isActive: 1, priority: 1 }); // Most common query
bannerSchema.index({ startDate: 1, endDate: 1 }); // Scheduling
bannerSchema.index({ classId: 1 }); // Find banners for specific class

// Ensure unique priority for active banners only
bannerSchema.index(
  { priority: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);

// Static method to get active banners
bannerSchema.statics.getActiveBanners = function() {
  const now = new Date();
  
  return this.find({
    isActive: true,
    $or: [
      { startDate: null, endDate: null },
      { startDate: { $lte: now }, endDate: { $gte: now } },
      { startDate: { $lte: now }, endDate: null },
      { startDate: null, endDate: { $gte: now } }
    ]
  })
  .populate('classId', 'title description teacherName image')
  .sort({ priority: 1 });
};

// Static method to get next priority for new banners
bannerSchema.statics.getNextPriority = async function() {
  const highest = await this.findOne({ isActive: true })
    .sort({ priority: -1 })
    .select('priority');
  
  return highest ? highest.priority + 1 : 1;
};

// Pre-save middleware to auto-assign priority for new banners
bannerSchema.pre('save', async function(next) {
  if (this.isNew && !(this as any).priority) {
    try {
      (this as any).priority = await (this.constructor as IBannerModel).getNextPriority();
    } catch (error: any) {
      return next(error);
    }
  }
  next();
});

const Banner = model<IBanner, IBannerModel>('Banner', bannerSchema);
export default Banner;