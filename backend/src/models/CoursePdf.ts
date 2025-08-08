import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     CoursePdf:
 *       type: object
 *       required:
 *         - course
 *         - pdf
 *         - priority
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the course-pdf assignment
 *           example: 60c72b1f9b1e8e001c8f4b11
 *         course:
 *           type: string
 *           description: Reference to the Course ID
 *           example: 60c72b1f9b1e8e001c8f4b12
 *         pdf:
 *           type: string
 *           description: Reference to the PDF ID
 *           example: 60c72b1f9b1e8e001c8f4b13
 *         priority:
 *           type: number
 *           minimum: 1
 *           description: Priority order of the PDF within the course (1 = highest priority)
 *           example: 1
 *         isActive:
 *           type: boolean
 *           description: Whether this PDF assignment is currently active
 *           default: true
 *           example: true
 *         addedAt:
 *           type: string
 *           format: date-time
 *           description: When the PDF was assigned to the course
 *           example: 2023-07-15T14:30:00.000Z
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Record creation timestamp
 *           example: 2023-07-15T14:30:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Record last update timestamp
 *           example: 2023-07-15T14:30:00.000Z
 */

export interface ICoursePdf extends Document {
  course: Types.ObjectId;
  pdf: Types.ObjectId;
  priority: number;
  isActive: boolean;
  addedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const coursePdfSchema = new Schema<ICoursePdf>({
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
    index: true
  },
  pdf: {
    type: Schema.Types.ObjectId,
    ref: 'Pdf',
    required: [true, 'PDF ID is required'],
    index: true
  },
  priority: {
    type: Number,
    required: [true, 'Priority is required'],
    min: [1, 'Priority must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Priority must be an integer'
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // This will add createdAt and updatedAt automatically
  collection: 'coursepdfs' // Explicit collection name
});

// Compound indexes for efficient queries
coursePdfSchema.index({ course: 1, pdf: 1 }, { unique: true }); // Prevent duplicate assignments
coursePdfSchema.index({ course: 1, priority: 1 }); // For priority-based sorting
coursePdfSchema.index({ course: 1, isActive: 1, priority: 1 }); // For active PDFs with priority
coursePdfSchema.index({ pdf: 1, isActive: 1 }); // For finding courses by PDF

// Virtual for getting course details
coursePdfSchema.virtual('courseDetails', {
  ref: 'Course',
  localField: 'course',
  foreignField: '_id',
  justOne: true
});

// Virtual for getting PDF details
coursePdfSchema.virtual('pdfDetails', {
  ref: 'Pdf',
  localField: 'pdf',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
coursePdfSchema.set('toJSON', { virtuals: true });
coursePdfSchema.set('toObject', { virtuals: true });

// Pre-save middleware to handle priority conflicts
coursePdfSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('priority')) {
    try {
      // Check if priority already exists for this course
      const CoursePdfModel = this.constructor as any;
      const existingWithSamePriority = await CoursePdfModel.findOne({
        course: this.course,
        priority: this.priority,
        _id: { $ne: this._id }, // Exclude current document
        isActive: true
      });

      if (existingWithSamePriority) {
        // Auto-increment priorities for conflicts
        const maxPriority = await CoursePdfModel.findOne({
          course: this.course,
          isActive: true
        }).sort({ priority: -1 }).select('priority');

        this.priority = maxPriority ? maxPriority.priority + 1 : 1;
      }
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

// Static method to get PDFs for a course
coursePdfSchema.statics.getPdfsForCourse = function(
  courseId: Types.ObjectId, 
  options: { 
    includeInactive?: boolean; 
    sortBy?: string; 
  } = {}
) {
  const {
    includeInactive = false,
    sortBy = 'priority'
  } = options;

  const matchConditions: any = { course: courseId };
  if (!includeInactive) {
    matchConditions.isActive = true;
  }

  const sortOptions: any = {};
  if (sortBy === 'priority') {
    sortOptions.priority = 1;
    sortOptions.createdAt = -1;
  } else if (sortBy === 'recent') {
    sortOptions.createdAt = -1;
  }

  return this.find(matchConditions)
    .populate({
      path: 'pdf',
      populate: [
        { path: 'mainCategory', select: '_id mainCategoryName' },
        { path: 'category', select: '_id categoryName' },
        { path: 'section', select: '_id sectionName' },
        { path: 'topic', select: '_id topicName' }
      ]
    })
    .sort(sortOptions);
};

// Static method to get courses for a PDF
coursePdfSchema.statics.getCoursesForPdf = function(
  pdfId: Types.ObjectId,
  includeInactive: boolean = false
) {
  const matchConditions: any = { pdf: pdfId };
  if (!includeInactive) {
    matchConditions.isActive = true;
  }

  return this.find(matchConditions)
    .populate('course', '_id title description')
    .sort({ priority: 1, createdAt: -1 });
};

// Static method to reorder priorities
coursePdfSchema.statics.reorderPriorities = async function(
  courseId: Types.ObjectId,
  pdfIdPriorityMap: { pdfId: Types.ObjectId; priority: number }[]
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const { pdfId, priority } of pdfIdPriorityMap) {
      await this.findOneAndUpdate(
        { course: courseId, pdf: pdfId },
        { priority },
        { session }
      );
    }

    await session.commitTransaction();
    return true;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export default mongoose.model<ICoursePdf>('CoursePdf', coursePdfSchema);
