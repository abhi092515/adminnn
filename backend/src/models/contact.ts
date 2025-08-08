import { Document, Schema, model } from 'mongoose';

// Interface to define the structure of a Contact document
export interface IContact extends Document {
  name: string;
  email: string;
  mobileNumber: string;
  message: string;
  createdAt: Date;
}

// Mongoose schema for the Contact document
const contactSchema = new Schema<IContact>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Contact = model<IContact>('Contact', contactSchema);

export default Contact;