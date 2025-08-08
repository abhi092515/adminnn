"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var RankScoreSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        trim: true,
    }, courseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course ID is required'],
    },
    rank_score: {
        type: Number,
        required: [true, 'Rank score is required'],
        min: [0, 'Rank score cannot be negative'],
        max: [100, 'Rank score cannot exceed 100'],
    },
    level_score: {
        type: Number,
        required: [true, 'Level score is required'],
        min: [0, 'Level score cannot be negative'],
        max: [100, 'Level score cannot exceed 100'],
    },
    level: {
        type: String,
        required: [true, 'Level is required'],
        enum: ['Beginner', 'Medium', 'Advanced', 'Pro'],
        trim: true,
    },
}, {
    timestamps: true,
});
// Create compound index for efficient queries
RankScoreSchema.index({ userId: 1, courseId: 1 });
RankScoreSchema.index({ rank_score: -1 }); // For finding max rank scores
exports.default = mongoose_1.default.model('RankScore', RankScoreSchema);
