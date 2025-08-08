import mongoose, { Document, Schema } from 'mongoose';

// Ebook interface
export interface IEbook extends Document {
  title: string;
  author: string;
  shortDescription?: string;
  fullDescription?: string;
  edition?: string;
  publisher?: string;
  pages?: number;
  samplePdf?: string;
  bookPdf?: string; // The new field for the full e-book PDF
  language: string;
  mainCategory: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  videoLink?: string;
  newPrice: number;
  oldPrice?: number;
  status: 'active' | 'inactive';
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
}

const ebookSchema: Schema = new Schema({
  // All fields from the book schema...
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  shortDescription: { type: String, trim: true },
  fullDescription: { type: String, trim: true },
  edition: { type: String, trim: true },
  publisher: { type: String, trim: true },
  pages: { type: Number },
  samplePdf: { type: String },
  bookPdf: { type: String }, // ✨ Added the new field
  language: { type: String, required: true },
  mainCategory: { type: Schema.Types.ObjectId, ref: 'MainCategory', required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  videoLink: { type: String, trim: true },
  newPrice: { type: Number, required: true },
  oldPrice: { type: Number },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  image1: { type: String },
  image2: { type: String },
  image3: { type: String },
  image4: { type: String },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

export default mongoose.model<IEbook>('Ebook', ebookSchema);