
import mongoose, { Schema, Document, Types } from 'mongoose';
import { IClass } from './Class'; // REFINED: Import IClass for the new ref array



// function transformSubdocument(doc: any, ret: any) {
//   ret.id = ret._id.toString();
//   delete ret?._id;
//   delete ret?.__v;
// }

// --- Demo Videos ---
export interface IDemoVideo {
  id: string; // Transformed output
  title: string;
  image: string
  url: string;
}

const DemoVideoSchema: Schema = new Schema({
  title: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  image: { type: String, required: false, trim: true }
}, {
  _id: false, // Subdocuments get IDs by default, this is explicit.
  // toJSON: { transform: transformSubdocument },
  // toObject: { transform: transformSubdocument }
});

// --- FAQ Items ---
export interface IFAQItem {
  id: string; // Transformed output
  question: string;
  answer: string;
}

const FAQItemSchema: Schema = new Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true },
}, {
  _id: false,
  // toJSON: { transform: transformSubdocument },
  // toObject: { transform: transformSubdocument }
});

// --- Faculty Details ---
export interface IFacultyDetails {
  id: string; // Transformed output
  name: string;
  designation?: string;
  bio?: string;
  imageUrl?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  videoUrl?: string;
  experience: string;
  reach: string;
  description: string;
}

const FacultyDetailsSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  designation: { type: String, trim: true },
  bio: { type: String },
  imageUrl: { type: String, trim: true },
  socialLinks: {
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    facebook: { type: String, trim: true },
  },
  videoUrl: { type: String, trim: true },
  experience: { type: String, required: true },
  reach: { type: String, required: true },
  description: { type: String, required: true },
}, {
  _id: true,
  // toJSON: { transform: transformSubdocument },
  // toObject: { transform: transformSubdocument }
});



export interface ICourse extends Document {
  id: string; // This will be the string version of _id
  classes: Types.ObjectId[] | IClass[];
  status: 'active' | 'inactive';
  priority: number;
  isLive: boolean;
  isRecorded: boolean;
  isFree: boolean;
  banner: string | null;
  title: string;
  assignHeader: string;
  description: string[];
  mainCategory: Types.ObjectId;
  category: Types.ObjectId;
  liveClassesCount: number;
  recordedClassesCount: number;
  courseInfo: string[];
  demoVideos: IDemoVideo[];
  batchInfoPdfUrl?: string;
  facultyDetails?: IFacultyDetails; courseHighlights: string[];
  price: number;
  faq: IFAQItem[];
  assignedPdfs: Types.ObjectId[]; // References to PDF documents
  createdAt: Date;
  updatedAt: Date;
}


const CourseSchema: Schema = new Schema<ICourse>({

  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  priority: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  isLive: { type: Boolean, default: false },
  isRecorded: { type: Boolean, default: false },
  isFree: { type: Boolean, default: false },
  banner: { type: String, default: null, trim: true },
  title: { type: String, required: true, unique: true, trim: true },
  assignHeader: { type: String ,required: false},
  description: [{ type: String }],
  mainCategory: { type: Schema.Types.ObjectId, ref: 'MainCategory', required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  liveClassesCount: { type: Number, default: 0, min: 0 },
  recordedClassesCount: { type: Number, default: 0, min: 0 }, courseInfo: [{ type: String }],
  demoVideos: [DemoVideoSchema],
  batchInfoPdfUrl: { type: String, trim: true },
  facultyDetails: { type: FacultyDetailsSchema, required: false }, // Explicitly optional
  courseHighlights: [{ type: String }],
  faq: [FAQItemSchema],
  assignedPdfs: {
    type: [{ type: mongoose.Schema.Types.ObjectId,
       ref: 'Pdf' }],
    default: [] // ✅ This prevents the crash
}, // References to PDF documents
  classes: [{
    type: Schema.Types.ObjectId,
    ref: 'Class'
  }]
}, {
  timestamps: true,
  // Use `toJSON` to define the output format for API responses (e.g., res.json())
  toJSON: {
    virtuals: true, // Ensure virtuals are included if you add any later
    transform: function (doc, ret) {
      ret.id = ret._id?.toString(); // Create an 'id' property from the '_id'
      delete ret._id;
      delete ret.__v;
    }
  },
  // Use `toObject` for other conversions, like console.log(doc.toObject())
  toObject: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
    }
  }
});

CourseSchema.index({ mainCategory: 1, category: 1 });
CourseSchema.index({ status: 1 });
CourseSchema.index({ isFree: 1 });

const Course = mongoose.model<ICourse>('Course', CourseSchema);

export default Course;