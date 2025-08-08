// src/models/Teacher.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface ITeacher extends Document {
  name: string;
  description?: string;
  qualification: string;
  picture: string;
  video?: string;
  // Add timestamps to interface for type safety, as they are enabled in schema
  createdAt?: Date;
  updatedAt?: Date;
}

const teacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    qualification: { type: String, required: true },
    picture: { type: String, required: true },
    video: { type: String },
  },
  {
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
  }
);

const Teacher = model<ITeacher>('Teacher', teacherSchema);

export default Teacher;