import mongoose, { Document, Schema, Types } from 'mongoose';

// Interface representing a document in MongoDB.
export interface ISubscription extends Document {
    name: string;
    title?: string;
    amount: number;
    durationInDays: number;
    // packages: Types.ObjectId[]; // DUMMY FIELD: Kept for future implementation.
    courses: Types.ObjectId[];
    ebooks: Types.ObjectId[];
    coupons: Types.ObjectId[];
    priority: number; 
    status: 'active' | 'inactive';
}

// Schema corresponding to the document interface.
const subscriptionSchema: Schema<ISubscription> = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    title: {
        type: String,
        trim: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    durationInDays: {
        type: Number,
        required: true,
    },
    /*
    // DUMMY FIELD: Kept for future implementation.
    packages: [{
        type: Schema.Types.ObjectId,
        ref: 'Package',
    }],
    */
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course',
    }],
    ebooks: [{
        type: Schema.Types.ObjectId,
        ref: 'Ebook',
    }],
    coupons: [{
        type: Schema.Types.ObjectId,
        ref: 'Coupon',
    }],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    priority: {
      type: Number,
      default: 0,
  },
}, { timestamps: true });

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);