import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * @interface IFaculty
 * @description Describes the structure of a Faculty document, including Mongoose's Document properties.
 */
export interface IFaculty extends Document {
  id: string; // Virtual 'id' getter
  name: string;
  experience: string;
  reach: string;
  description: string;
  introVideoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @schema FacultySchema
 * @description Defines the schema for the Faculty collection in MongoDB.
 */
const FacultySchema: Schema = new Schema<IFaculty>({
  name: {
    type: String,
    required: [true, 'Faculty name is required.'],
    trim: true,
  },
  experience: {
    type: String,
    required: [true, 'Faculty experience is required.'],
    trim: true,
  },
  reach: {
    type: String,
    required: [true, 'Faculty reach is required.'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Faculty description is required.'],
    trim: true,
  },
  introVideoUrl: {
    type: String,
    trim: true,
  },
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true,
  
  // Transformation options for converting the document to JSON or a plain object
  toJSON: {
    virtuals: true, // Ensure virtuals (like 'id') are included
    transform: (doc, ret) => {
      // 'ret' is the plain object representation of the document
      delete ret._id;   // Remove the internal _id
      delete ret.__v;  // Remove the __v version key
    },
  },
  toObject: {
    virtuals: true, // Ensure virtuals are included
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
    },
  },
});

// Create a virtual 'id' property that gets the string representation of '_id'
FacultySchema.virtual('id').get(function(this: { _id: Types.ObjectId }) {
  return this._id.toHexString();
});

/**
 * @model Faculty
 * @description Mongoose model for the 'faculties' collection.
 * The name 'Faculty' is used as the reference ('ref') in other models.
 */
const Faculty = mongoose.model<IFaculty>('Faculty', FacultySchema);

export default Faculty;