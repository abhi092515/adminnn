"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRankScoresSchema = exports.getRankScoreSchema = exports.createRankScoreSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
// Helper to validate Mongoose ObjectId strings
const objectId = zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});
// Schema for creating a new rank score
exports.createRankScoreSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    courseId: objectId,
    rank_score: zod_1.z.number().min(0, 'Rank score cannot be negative').max(100, 'Rank score cannot exceed 100'),
    level_score: zod_1.z.number().min(0, 'Level score cannot be negative').max(100, 'Level score cannot exceed 100'),
    level: zod_1.z.enum(['Beginner', 'Medium', 'Advanced', 'Pro'], {
        errorMap: () => ({ message: 'Level must be one of: Beginner, Medium, Advanced, Pro' })
    })
});
// Schema for getting rank score by user and course
exports.getRankScoreSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    courseId: objectId
});
// Schema for getting rank scores with optional filters
exports.getRankScoresSchema = zod_1.z.object({
    userId: zod_1.z.string().optional(),
    courseId: objectId.optional(),
    level: zod_1.z.enum(['Beginner', 'Medium', 'Advanced', 'Pro']).optional(),
    limit: zod_1.z.string().transform(val => parseInt(val)).pipe(zod_1.z.number().int().positive()).optional(),
    page: zod_1.z.string().transform(val => parseInt(val)).pipe(zod_1.z.number().int().positive()).optional()
});
