"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const courseClassSchema = new mongoose_1.Schema({
    course: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course ID is required'],
        index: true
    },
    class: {
        type: mongoose_1.Schema.Types.ObjectId,
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
courseClassSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew || this.isModified('priority')) {
            try {
                // Check if priority already exists for this course
                const CourseClassModel = this.constructor;
                const existingWithSamePriority = yield CourseClassModel.findOne({
                    course: this.course,
                    priority: this.priority,
                    _id: { $ne: this._id }, // Exclude current document
                    isActive: true
                });
                if (existingWithSamePriority) {
                    // Auto-increment priorities for conflicts
                    const maxPriority = yield CourseClassModel.findOne({
                        course: this.course,
                        isActive: true
                    }).sort({ priority: -1 }).select('priority');
                    this.priority = maxPriority ? maxPriority.priority + 1 : 1;
                }
            }
            catch (error) {
                return next(error);
            }
        }
        next();
    });
});
// Static method to get classes for a course with pagination
courseClassSchema.statics.getClassesForCourse = function (courseId_1) {
    return __awaiter(this, arguments, void 0, function* (courseId, options = {}) {
        const { includeInactive = false, limit = 50, skip = 0, sortBy = 'priority' } = options;
        const matchConditions = { course: courseId };
        if (!includeInactive) {
            matchConditions.isActive = true;
        }
        const sortOptions = {};
        if (sortBy === 'priority') {
            sortOptions.priority = 1;
            sortOptions.createdAt = -1;
        }
        else if (sortBy === 'recent') {
            sortOptions.createdAt = -1;
        }
        try {
            // First, try with full population
            return yield this.find(matchConditions)
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
        }
        catch (populationError) {
            console.error('Population failed, falling back to basic query:', populationError);
            // Fallback: return basic results without population
            return yield this.find(matchConditions)
                .populate('class') // Basic population only
                .sort(sortOptions)
                .skip(skip)
                .limit(limit);
        }
    });
};
// Static method to get courses for a class
courseClassSchema.statics.getCoursesForClass = function (classId, includeInactive = false) {
    const matchConditions = { class: classId };
    if (!includeInactive) {
        matchConditions.isActive = true;
    }
    return this.find(matchConditions)
        .populate('course', '_id title description')
        .sort({ priority: 1, createdAt: -1 });
};
// Static method to reorder priorities
courseClassSchema.statics.reorderPriorities = function (courseId, classIdPriorityMap) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        try {
            for (const { classId, priority } of classIdPriorityMap) {
                yield this.findOneAndUpdate({ course: courseId, class: classId }, { priority }, { session });
            }
            yield session.commitTransaction();
            return true;
        }
        catch (error) {
            yield session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    });
};
exports.default = mongoose_1.default.model('CourseClass', courseClassSchema);
