// src/models/Order.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IOrder extends Document {
    userId: string; // PHP service user ID (stored as string instead of ObjectId)
    courseId: Types.ObjectId; // Reference to Course
    orderNumber: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const orderSchema = new Schema<IOrder>(
    {
        userId: {
            type: String,
            required: [true, 'User ID is required'],
            index: true
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true
        },
        orderNumber: {
            type: String,
            required: true,
            unique: true
        },
       
    },
    {  
    
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                // 1. Convert _id to string and add as 'id' at the beginning
                ret.id = ret._id.toString();

                // 2. Remove the original _id and __v fields
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
    }    
);

// Compound index to prevent duplicate orders per user-course
// orderSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Create indexes for better query performance
// orderSchema.index({ userId: 1, createdAt: -1 }); // For user order history
orderSchema.index({ courseId: 1 }); // For course-related queries
orderSchema.index({ orderNumber: 1 }); // For order lookup

const Order = model<IOrder>('Order', orderSchema);
export default Order;
