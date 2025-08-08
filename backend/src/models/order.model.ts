import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOrder extends Document {
  product_id: Types.ObjectId;
  total_price: number;
  order_status: string;
  payment_status: 'pending' | 'failed' | 'abort' | 'success';
  address_id: Types.ObjectId;
  user_id: Types.ObjectId;
  order_id: string;
  txn_id?: string;
  price_per_quantity: number;
  total_quantity: number;
  size?: string;
  coupon_code?: string;
  purchased_productlist_id?: string;
  shipping_charge?: number;
}

const orderSchema: Schema<IOrder> = new Schema({
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Book', // Referencing the Book model
    required: true,
  },
  total_price: {
    type: Number,
    required: true,
  },
  order_status: {
    type: String,
    default: 'Placed',
  },
  payment_status: {
    type: String,
    enum: ['pending', 'failed', 'abort', 'success'],
    default: 'pending',
  },
  address_id: {
    type: Schema.Types.ObjectId,
    ref: 'Address', // Referencing the Address model
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Referencing the User model
    required: true,
  },
  order_id: {
    type: String,
    unique: true,
    required: true,
  },
  txn_id: {
    type: String,
  },
  price_per_quantity: {
    type: Number,
    required: true,
  },
  total_quantity: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
  },
  coupon_code: {
    type: String,
  },
  purchased_productlist_id: {
    type: String,
  },
  shipping_charge: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IOrder>('Order', orderSchema);