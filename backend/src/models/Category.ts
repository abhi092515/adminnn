// src/models/Category.ts
import { Document, Schema, model, Types, HydratedDocument } from 'mongoose';

export interface ICategory extends Document {
  // HIGHLIGHT START
  categoryImage?: string; // Make it optional in the TypeScript interface
  // HIGHLIGHT END
  categoryName: string;
  categoryDescription: string;
  assignedToHeader: boolean;
  status: 'active' | 'inactive';
  mainCategory: Types.ObjectId;
}

const CategorySchema = new Schema<ICategory>({
  // HIGHLIGHT START
  categoryImage: { type: String, required: false }, // Set 'required' to false in the Mongoose schema
  // HIGHLIGHT END
  categoryName: { type: String, required: true, unique: true },
  categoryDescription: { type: String, required: true},
  assignedToHeader: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  mainCategory: {
    type: Schema.Types.ObjectId,
    ref: 'MainCategory',
    required: true,
  },
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

export type CategoryDocument = HydratedDocument<ICategory>;

const Category = model<ICategory>('Category', CategorySchema);

export default Category;