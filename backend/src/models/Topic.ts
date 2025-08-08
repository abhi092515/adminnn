// src/models/Topic.ts
import { Document, Schema, model, Types } from 'mongoose';

/**
 * @swagger
 * components:
 * schemas:
 * Topic:
 * type: object
 * required:
 * - topicName
 * - section
 * properties:
 * _id:
 * type: string
 * description: The auto-generated ID of the topic
 * example: 60c72b1f9b1e8e001c8f4b10
 * topicName:
 * type: string
 * description: Name of the topic (must be unique)
 * example: "Product Launch Announcements"
 * status:
 * type: string
 * description: Current status of the topic
 * enum: [active, inactive]
 * default: active
 * example: "active"
 * section:
 * type: string
 * format: uuid # Represents ObjectId in string form
 * description: The ID of the section this topic belongs to
 * example: 60c72b1f9b1e8e001c8f4b0f
 * createdAt:
 * type: string
 * format: date-time
 * description: The date and time the topic was created
 * updatedAt:
 * type: string
 * format: date-time
 * description: The date and time the topic was last updated
 */
export interface ITopic extends Document {
  topicName: string;
  status: 'active' | 'inactive';
  section: Types.ObjectId; // Reference to the Section model
  // Add timestamps to interface for type safety, as they are enabled in schema
  createdAt?: Date;
  updatedAt?: Date;
}

const TopicSchema = new Schema<ITopic>({
  topicName: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  section: {
    type: Schema.Types.ObjectId,
    ref: 'Section', // This links it to the 'Section' model
    required: true,
  },
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

const Topic = model<ITopic>('Topic', TopicSchema);

export default Topic;