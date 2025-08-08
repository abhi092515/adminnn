import { Schema, model, Document, Types } from 'mongoose';

// Define the structure of the Address document
export interface IAddress extends Document {
  user: Types.ObjectId; // Reference to the User model
  name: string;
  mobile: string;
  alt_mobile?: string;
  email: string;
  address: string;
  pincode: string;
  location?: string;
  landmark?: string;
  state: string;
  city: string;
  country: string;
  deliverySlot: 'Home' | 'Office/Commercial';
}

const AddressSchema = new Schema<IAddress>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // This should match the name of your User model
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
  },
  alt_mobile: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  landmark: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,

  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  deliverySlot: {
    type: String,
    required: true,
    enum: {
      values: ['Home', 'Office/Commercial'],
      message: '{VALUE} is not a valid delivery slot. Choose Home or Office/Commercial.',
    },
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const Address = model<IAddress>('Address', AddressSchema);

export default Address;