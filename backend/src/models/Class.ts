import { Document, Schema, model, Types, HydratedDocument } from 'mongoose';

/**
 * @swagger
 * components:
 * schemas:
 * Class:
 * type: object
 * required:
 * - title
 * - teacherName
 * - mainCategory
 * - category
 * - section
 * - topic
 * properties:
 * id:
 * type: string
 * description: The auto-generated ID of the class.
 * example: "60c72b1f9b1e8e001c8f4b11"
 * link:
 * type: string
 * format: uri
 * description: URL link for the class (e.g., video conference link).
 * example: "https://zoom.us/j/123456789"
 * status:
 * type: string
 * description: "Current status of the class (default: 'draft')."
 * enum: [active, inactive, draft]
 * example: "draft"
 * isChat:
 * type: boolean
 * description: "Indicates if chat is enabled for the class (default: false)."
 * example: true
 * isFree:
 * type: boolean
 * description: "Indicates if the class is free or paid (default: false)."
 * example: false
 * teacherName:
 * type: string
 * description: Name of the teacher conducting the class.
 * example: "Dr. Emily Davis"
 * priority:
 * type: number
 * description: "Priority order for displaying classes (lower number = higher priority, default: 0)."
 * example: 1 * isLive:
 * type: boolean
 * description: "Indicates if the class is currently live (default: false)."
 * example: false
 * isShort:
 * type: boolean
 * description: "Indicates if the class is a short/quick class (default: false)."
 * example: false
 * isTopper:
 * type: boolean
 * description: "Indicates if the class is designed for topper students (default: false)."
 * example: false
 * image:
 * type: string
 * format: uri
 * description: URL to the class's thumbnail or banner image (optional).
 * example: "https://example.com/images/class_thumbnail.jpg"
 * title:
 * type: string
 * description: Title of the class (must be unique).
 * example: "Advanced Physics Lecture"
 * description:
 * type: string
 * description: Detailed description of the class.
 * example: "A comprehensive lecture on advanced quantum physics concepts."
 * mainCategory:
 * type: string
 * format: objectId
 * description: The ID of the main category this class belongs to.
 * example: "60c72b1f9b1e8e001c8f4b0d"
 * category:
 * type: string
 * format: objectId
 * description: The ID of the sub-category this class belongs to.
 * example: "60c72b1f9b1e8e001c8f4b0e"
 * section:
 * type: string
 * format: objectId
 * description: The ID of the section this class belongs to.
 * example: "60c72b1f9b1e8e001c8f4b0f"
 * topic:
 * type: string
 * format: objectId
 * description: The ID of the topic this class belongs to.
 * example: "60c72b1f9b1e8e001c8f4b10" * createdAt:
 * type: string
 * format: date-time
 * description: The date and time the class was created.
 * updatedAt:
 * type: string
 * format: date-time
 * description: The date and time the class was last updated. * duration:
 * type: number
 * description: Duration of the class in seconds (optional).
 * example: 3600
 * class_link:
 * type: string
 * format: uri
 * description: Alternative link for the class (e.g., backup video conference link).
 * example: "https://teams.microsoft.com/l/meetup-join/..."
 * mp4Recordings:
 * type: array
 * items:
 * type: string
 * format: uri
 * description: Array of MP4 recording URLs/paths for the class.
 * example: ["https://example.com/recordings/class1.mp4", "https://example.com/recordings/class1_part2.mp4"]
 */
export interface IClass extends Document {
  id: string; // The transformed string version of _id for API responses.
  link?: string;
  status: 'active' | 'inactive' | 'draft';
  isChat: boolean;
  isFree: boolean;
  teacherName: string; 
  priority: number;
  isLive: boolean;
  isShort: boolean;
  isTopper: boolean;
  image?: string;
  title: string;
  description?: string;
  mainCategory: Types.ObjectId;
  category: Types.ObjectId;
  section: Types.ObjectId;
  topic: Types.ObjectId;
  // Scheduling fields
  startDate?: Date;
  endDate?: Date;  // View tracking fields
  viewCount: number;
  uniqueViewCount: number;  // Duration field
  duration?: number; // Duration in seconds
  // New fields for enhanced class functionality
  class_link?: string; // Alternative link for the class (e.g., backup link)
  mp4Recordings: string[]; // Array of MP4 recording URLs/paths
  createdAt: Date; // Timestamps ensure these exist.
  updatedAt: Date; // Timestamps ensure these exist.
}

const ClassSchema = new Schema<IClass>({
  link: { type: String, trim: true },
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'draft' },
  isChat: { type: Boolean, default: false },
  isFree: { type: Boolean, default: false }, 
  teacherName: { type: String, required: true, trim: true },
  priority: { type: Number, default: 0 },
  isLive: { type: Boolean, default: false },
  isShort: { type: Boolean, default: false },
  isTopper: { type: Boolean, default: false },
  image: { type: String, required: false }, // Explicitly not required
  title: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true }, // Added trim for consistency
  mainCategory: { type: Schema.Types.ObjectId, ref: 'MainCategory', required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
  topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  // Scheduling fields
  startDate: { type: Date, required: false },
  endDate: { type: Date, required: false },  // View tracking fields  viewCount: { type: Number, default: 0, min: 0 },
  uniqueViewCount: { type: Number, default: 0, min: 0 },  // Duration field
  duration: { type: Number, min: 0, required: false }, // Duration in seconds
  // New fields for enhanced class functionality
  class_link: { type: String, trim: true, required: false }, // Alternative link for the class
  mp4Recordings: { type: [String], default: [] }, // Array of MP4 recording URLs/paths
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

// --- Database Indexes ---
// Add indexes to fields that are frequently used in queries to improve performance.
// The `unique: true` on 'title' already creates a unique index.
ClassSchema.index({ mainCategory: 1, category: 1 }); // Compound index for filtering
ClassSchema.index({ status: 1 });
ClassSchema.index({ isFree: 1 });
ClassSchema.index({ isShort: 1 });
ClassSchema.index({ isTopper: 1 });
ClassSchema.index({ startDate: 1, endDate: 1 }); // Compound index for date range queries
ClassSchema.index({ viewCount: -1 }); // For sorting by popularity
ClassSchema.index({ uniqueViewCount: -1 }); // For sorting by unique views

export type ClassDocument = HydratedDocument<IClass>;

const Class = model<IClass>('Class', ClassSchema);

export default Class;