import mongoose, { Document, Schema } from 'mongoose';

// Interface describing the Book document structure
export interface IBook extends Document {
  title: string;
  author: string;
  shortDescription?: string;
  fullDescription?: string;
  edition?: string;
  publisher?: string;
  publicationDate?: Date;
  language: string;
  dimensions?: string;
  pages?: number;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  samplePdf?: string;
  mainCategory: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  videoLink?: string;
  oldPrice?: number;
  newPrice: number;
  status: 'active' | 'inactive' | 'out-of-stock';
}

const bookSchema: Schema = new Schema({
  // ... (your existing schema fields remain the same)
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  shortDescription: { type: String, trim: true },
  fullDescription: { type: String, trim: true },
  edition: { type: String, trim: true },
  publisher: { type: String, trim: true },
  publicationDate: { type: Date },
  language: { type: String, required: true },
  dimensions: { type: String },
  pages: { type: Number },
  image1: { type: String },
  image2: { type: String },
  image3: { type: String },
  image4: { type: String },
  samplePdf: { type: String },
  mainCategory: { type: Schema.Types.ObjectId, ref: 'MainCategory', required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  videoLink: { type: String, trim: true },
  oldPrice: { type: Number },
  newPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out-of-stock'],
    default: 'active',
  },
}, {
  timestamps: true,
  // ✅ ADD THIS PART TO TRANSFORM THE JSON OUTPUT
  toJSON: {
    virtuals: true, // Ensure virtuals are included
    transform: (doc, ret) => {
      ret.id = ret._id; // Rename _id to id
      delete ret._id;   // Delete the original _id
      delete ret.__v;   // Delete the __v field
    }
  }
});

export default mongoose.model<IBook>('Book', bookSchema);