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
const coursePdfSchema = new mongoose_1.Schema({
    course: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course ID is required'],
        index: true
    },
    pdf: {
        type: mongoose_1.Schema.Types.ObjectId,
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
coursePdfSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew || this.isModified('priority')) {
            try {
                // Check if priority already exists for this course
                const CoursePdfModel = this.constructor;
                const existingWithSamePriority = yield CoursePdfModel.findOne({
                    course: this.course,
                    priority: this.priority,
                    _id: { $ne: this._id }, // Exclude current document
                    isActive: true
                });
                if (existingWithSamePriority) {
                    // Auto-increment priorities for conflicts
                    const maxPriority = yield CoursePdfModel.findOne({
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
// Static method to get PDFs for a course
coursePdfSchema.statics.getPdfsForCourse = function (courseId, options = {}) {
    const { includeInactive = false, sortBy = 'priority' } = options;
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
coursePdfSchema.statics.getCoursesForPdf = function (pdfId, includeInactive = false) {
    const matchConditions = { pdf: pdfId };
    if (!includeInactive) {
        matchConditions.isActive = true;
    }
    return this.find(matchConditions)
        .populate('course', '_id title description')
        .sort({ priority: 1, createdAt: -1 });
};
// Static method to reorder priorities
coursePdfSchema.statics.reorderPriorities = function (courseId, pdfIdPriorityMap) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        try {
            for (const { pdfId, priority } of pdfIdPriorityMap) {
                yield this.findOneAndUpdate({ course: courseId, pdf: pdfId }, { priority }, { session });
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
exports.default = mongoose_1.default.model('CoursePdf', coursePdfSchema);
