import mongoose, { Document, Schema, Types, Model } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     CourseClass:
 *       type: object
 *       required:
 *         - course
 *         - class
 *         - priority
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the course-class assignment
 *           example: 60c72b1f9b1e8e001c8f4b11
 *         course:
 *           type: string
 *           description: Reference to the Course ID
 *           example: 60c72b1f9b1e8e001c8f4b12
 *         class:
 *           type: string
 *           description: Reference to the Class ID
 *           example: 60c72b1f9b1e8e001c8f4b13
 *         priority:
 *           type: number
 *           minimum: 1
 *           description: Priority order of the class within the course (1 = highest priority)
 *           example: 1
 *         isActive:
 *           type: boolean
 *           description: Whether this class assignment is currently active
 *           default: true
 *           example: true
 *         addedAt:
 *           type: string
 *           format: date-time
 *           description: When the class was assigned to the course
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

export interface ICourseClass extends Document {
  course: Types.ObjectId;
  class: Types.ObjectId;
  priority: number;
  isActive: boolean;
  addedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseClassModel extends Model<ICourseClass> {
  getClassesForCourse(
    courseId: Types.ObjectId,
    options?: {
      includeInactive?: boolean;
      limit?: number;
      skip?: number;
      sortBy?: string;
    }
  ): Promise<ICourseClass[]>;

  getCoursesForClass(
    classId: Types.ObjectId,
    includeInactive?: boolean
  ): Promise<ICourseClass[]>;

  reorderPriorities(
    courseId: Types.ObjectId,
    classIdPriorityMap: { classId: Types.ObjectId; priority: number }[]
  ): Promise<boolean>;
}

const courseClassSchema = new Schema<ICourseClass>({
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
    index: true
  },
  class: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class ID is required'],
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
  collection: 'courseclasses' // Explicit collection name
});

// Compound indexes for efficient queries
courseClassSchema.index({ course: 1, class: 1 }, { unique: true }); // Prevent duplicate assignments
courseClassSchema.index({ course: 1, priority: 1 }); // For priority-based sorting
courseClassSchema.index({ course: 1, isActive: 1, priority: 1 }); // For active classes with priority
courseClassSchema.index({ class: 1, isActive: 1 }); // For finding courses by class

// Virtual for getting course details
courseClassSchema.virtual('courseDetails', {
  ref: 'Course',
  localField: 'course',
  foreignField: '_id',
  justOne: true
});

// Virtual for getting class details
courseClassSchema.virtual('classDetails', {
  ref: 'Class',
  localField: 'class',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
courseClassSchema.set('toJSON', { virtuals: true });
courseClassSchema.set('toObject', { virtuals: true });

// Pre-save middleware to handle priority conflicts
courseClassSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('priority')) {
    try {
      // Check if priority already exists for this course
      const CourseClassModel = this.constructor as any;
      const existingWithSamePriority = await CourseClassModel.findOne({
        course: this.course,
        priority: this.priority,
        _id: { $ne: this._id }, // Exclude current document
        isActive: true
      });

      if (existingWithSamePriority) {
        // Auto-increment priorities for conflicts
        const maxPriority = await CourseClassModel.findOne({
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

// Static method to get classes for a course with pagination
courseClassSchema.statics.getClassesForCourse = async function (
  courseId: Types.ObjectId,
  options: {
    includeInactive?: boolean;
    limit?: number;
    skip?: number;
    sortBy?: string;
  } = {}
) {
  const {
    includeInactive = false,
    limit = 50,
    skip = 0,
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

  try {
    // First, try with full population
    return await this.find(matchConditions)
      .populate({
        path: 'class',
        populate: [
          { path: 'mainCategory', select: '_id mainCategoryName' },
          { path: 'category', select: '_id categoryName' },
          { path: 'section', select: '_id sectionName' },
          { path: 'topic', select: '_id topicName' }
        ]
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
  } catch (populationError) {
    console.error('Population failed, falling back to basic query:', populationError);
    // Fallback: return basic results without population
    return await this.find(matchConditions)
      .populate('class') // Basic population only
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
  }
};

// Static method to get courses for a class
courseClassSchema.statics.getCoursesForClass = function (
  classId: Types.ObjectId,
  includeInactive: boolean = false
) {
  const matchConditions: any = { class: classId };
  if (!includeInactive) {
    matchConditions.isActive = true;
  }

  return this.find(matchConditions)
    .populate('course', '_id title description')
    .sort({ priority: 1, createdAt: -1 });
};

// Static method to reorder priorities
courseClassSchema.statics.reorderPriorities = async function (
  courseId: Types.ObjectId,
  classIdPriorityMap: { classId: Types.ObjectId; priority: number }[]
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const { classId, priority } of classIdPriorityMap) {
      await this.findOneAndUpdate(
        { course: courseId, class: classId },
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

export default mongoose.model<ICourseClass, ICourseClassModel>('CourseClass', courseClassSchema);
