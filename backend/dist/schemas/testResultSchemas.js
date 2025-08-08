"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestResultsByUserAndCoursePostSchema = exports.getTestResultsByUserAndCourseSchema = exports.testResultFilterSchema = exports.getTestResultByIdSchema = exports.testResultSchema = void 0;
// src/schemas/testResultSchemas.ts
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const objectId = zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});
exports.testResultSchema = zod_1.z.object({
    seriesId: objectId,
    userId: zod_1.z.string().min(1, 'User ID is required'),
    courseId: objectId,
    accuracy: zod_1.z.number().min(0, "Accuracy cannot be negative").max(100, "Accuracy cannot exceed 100"),
    timeSpent: zod_1.z.number().min(0, "Time spent cannot be negative"), // Time spent in seconds
    totalTime: zod_1.z.number().min(0, "Total time cannot be negative"), // Total allocated time in seconds
    questionsAttempted: zod_1.z.number().int("Questions attempted must be an integer").min(0, "Questions attempted cannot be negative"),
    totalQuestions: zod_1.z.number().int("Total questions must be an integer").min(0, "Total questions cannot be negative"),
    score: zod_1.z.number().min(0, "Score cannot be negative"),
});
// Schema for getting test result by ID (for params validation)
exports.getTestResultByIdSchema = zod_1.z.object({
    id: objectId,
});
// Schema for filtering test results (for query parameters)
exports.testResultFilterSchema = zod_1.z.object({
    userId: zod_1.z.string().optional(), // External user ID as string
    courseId: objectId.optional(),
    seriesId: objectId.optional(),
    minAccuracy: zod_1.z.number().min(0).max(100).optional(),
    maxAccuracy: zod_1.z.number().min(0).max(100).optional(),
    minScore: zod_1.z.number().min(0).optional(),
    maxScore: zod_1.z.number().min(0).optional(),
});
// Schema for getting test results by both userId and courseId (for params validation)
exports.getTestResultsByUserAndCourseSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    courseId: objectId,
});
// Schema for POST request to get test results by user and course (request body)
exports.getTestResultsByUserAndCoursePostSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    courseId: objectId,
});
