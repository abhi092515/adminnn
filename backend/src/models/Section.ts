// src/models/Section.ts
import { Document, Schema, model } from 'mongoose';

/**
 * @swagger
 * components:
 * schemas:
 * Section:
 * type: object
 * required:
 * - sectionName
 * properties:
 * _id:
 * type: string
 * description: The auto-generated ID of the section
 * example: 60c72b1f9b1e8e001c8f4b0f
 * sectionName:
 * type: string
 * description: Name of the section (must be unique)
 * example: "Featured Products"
 * status:
 * type: string
 * description: Current status of the section
 * enum: [active, inactive]
 * default: active
 * example: "active"
 * createdAt:
 * type: string
 * format: date-time
 * description: The date and time the section was created
 * updatedAt:
 * type: string
 * format: date-time
 * description: The date and time the section was last updated
 */
export interface ISection extends Document {
  sectionName: string;
  status: 'active' | 'inactive';
  // Add timestamps to interface for type safety, as they are enabled in schema
  createdAt?: Date;
  updatedAt?: Date;
}

const SectionSchema = new Schema<ISection>({
  sectionName: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, {
  timestamps: true,
  // --- ADD THESE SCHEMA OPTIONS HERE ---
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
  // --- END OF SCHEMA OPTIONS ---
});

const Section = model<ISection>('Section', SectionSchema);

export default Section;