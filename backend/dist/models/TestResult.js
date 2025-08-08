"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/TestResult.ts
const mongoose_1 = require("mongoose");
const testResultSchema = new mongoose_1.Schema({
    seriesId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        index: true
    }, userId: {
        type: String,
        required: true,
        index: true
    },
    courseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        index: true
    },
    accuracy: {
        type: Number,
        required: true,
        min: [0, 'Accuracy cannot be negative'],
        max: [100, 'Accuracy cannot exceed 100']
    },
    timeSpent: {
        type: Number,
        required: true,
        min: [0, 'Time spent cannot be negative']
    },
    totalTime: {
        type: Number,
        required: true,
        min: [0, 'Total time cannot be negative']
    },
    questionsAttempted: {
        type: Number,
        required: true,
        min: [0, 'Questions attempted cannot be negative']
    },
    totalQuestions: {
        type: Number,
        required: true,
        min: [0, 'Total questions cannot be negative']
    },
    score: {
        type: Number,
        required: true,
        min: [0, 'Score cannot be negative']
    }
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
testResultSchema.index({ seriesId: 1, userId: 1, courseId: 1 }, { unique: true });
testResultSchema.index({ userId: 1, createdAt: -1 }); // For user's test history
testResultSchema.index({ courseId: 1, createdAt: -1 }); // For course-related test results
const TestResult = (0, mongoose_1.model)('TestResult', testResultSchema);
exports.default = TestResult;
