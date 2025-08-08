import { Schema, model, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  type: 'percentage' | 'fixed';
  discountValue: number;
  usageLimitPerUser: number;
  startDate: Date;
  expireDate: Date;
  applicableOn: Schema.Types.ObjectId[];
  isActive: boolean;
}

const couponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed'],
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  usageLimitPerUser: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  startDate: {
    type: Date,
    required: true,
  },
  expireDate: {
    type: Date,
    required: true,
  },
  applicableOn: [{ // Array of IDs for products, courses, etc.
    type: Schema.Types.ObjectId,
    refPath: 'applicableOnModel', // Can refer to different models if needed
  }],
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

// Validator to ensure expireDate is after startDate
couponSchema.path('expireDate').validate(function(value: Date) {
  return this.startDate <= value;
}, 'Expire Date must be on or after the Start Date.');

const Coupon = model<ICoupon>('Coupon', couponSchema);
export default Coupon;