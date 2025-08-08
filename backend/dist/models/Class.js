"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ClassSchema = new mongoose_1.Schema({
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
    mainCategory: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MainCategory', required: true },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true },
    section: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Section', required: true },
    topic: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic', required: true },
    // Scheduling fields
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false }, // View tracking fields  viewCount: { type: Number, default: 0, min: 0 },
    uniqueViewCount: { type: Number, default: 0, min: 0 }, // Duration field
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
const Class = (0, mongoose_1.model)('Class', ClassSchema);
exports.default = Class;
