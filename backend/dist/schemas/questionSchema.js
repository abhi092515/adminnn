"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionSearchSchema = exports.getQuestionByIdBodySchema = exports.updateQuestionSchema = exports.createQuestionSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
// Helper to validate Mongoose ObjectId strings
const objectId = zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});
// Helper to preprocess array fields that might come as strings from form data
const preprocessArrayField = (val) => {
    if (Array.isArray(val)) {
        return val.filter(item => typeof item === 'string' && item.trim() !== '');
    }
    if (typeof val === 'string') {
        if (val.trim() === '')
            return [];
        // Try to parse as JSON first, then fall back to comma-separated
        try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
                return parsed.filter(item => typeof item === 'string' && item.trim() !== '');
            }
        }
        catch (e) {
            // If JSON parsing fails, treat as comma-separated string
            return val.split(',').map(item => item.trim()).filter(item => item !== '');
        }
    }
    return [];
};
// --- Embedded Document Schemas ---
const comprehensionSchema = zod_1.z.object({
    en: zod_1.z.string().optional(),
    hi: zod_1.z.string().optional(),
    be: zod_1.z.string().optional(),
    gu: zod_1.z.string().optional(),
}).strict();
const questionSchema = zod_1.z.object({
    en: zod_1.z.string().optional(),
    hi: zod_1.z.string().optional(),
    be: zod_1.z.string().optional(),
    gu: zod_1.z.string().optional(),
}).strict();
const questionImageSchema = zod_1.z.object({
    en: zod_1.z.string().optional(),
    hi: zod_1.z.string().optional(),
    be: zod_1.z.string().optional(),
    gu: zod_1.z.string().optional(),
}).strict();
const descriptionSchema = zod_1.z.object({
    en: zod_1.z.string().optional(),
    hi: zod_1.z.string().optional(),
    be: zod_1.z.string().optional(),
    gu: zod_1.z.string().optional(),
}).strict();
const answerSchema = zod_1.z.object({
    en: zod_1.z.string().optional(),
    hi: zod_1.z.string().optional(),
    be: zod_1.z.string().optional(),
    gu: zod_1.z.string().optional(),
}).strict();
const solutionSchema = zod_1.z.object({
    en: zod_1.z.string().optional(),
    hi: zod_1.z.string().optional(),
    be: zod_1.z.string().optional(),
    gu: zod_1.z.string().optional(),
}).strict();
const optionsSchema = zod_1.z.object({
    en: zod_1.z.string().optional(),
    hi: zod_1.z.string().optional(),
    be: zod_1.z.string().optional(),
    gu: zod_1.z.string().optional(),
}).strict();
// --- Main Course Schemas ---
/**
 * @title createQuestionSchema
 * @description Validates the request body for creating a new course.
 * Banner is handled via file upload (req.file) and not expected in the body.
 */
exports.createQuestionSchema = zod_1.z.object({
    mainCategory: objectId,
    category: objectId,
    sectionId: objectId,
    topicId: objectId,
    subTopicId: objectId,
    quesType: zod_1.z.string().min(1, "Description is required."),
    answerType: zod_1.z.string().min(1, "Description is required."),
    status: zod_1.z.enum(['active', 'inactive']).default('active').optional(),
    priority: zod_1.z.preprocess((val) => {
        if (typeof val === 'string')
            return parseInt(val, 10);
        return val;
    }, zod_1.z.number().int().min(0).default(0)).optional(),
    comprehension: comprehensionSchema.optional(),
    question: questionSchema,
    questionImage: questionImageSchema.optional(),
    description: descriptionSchema.optional(),
    answer: answerSchema,
    solution: solutionSchema,
    customerId: zod_1.z.string(),
    options: zod_1.z.array(optionsSchema).max(10, "You can't have more than 10 options").default([]).optional(),
    difficultyLevel: zod_1.z.preprocess((val) => {
        if (typeof val === 'string')
            return parseInt(val, 10);
        return val;
    }, zod_1.z.number().int().min(1).default(1)).optional(),
    marks: zod_1.z.preprocess((val) => {
        if (typeof val === 'string')
            return parseInt(val, 10);
        return val;
    }, zod_1.z.number().int().min(0).default(0)).optional(),
    isVerified: zod_1.z.preprocess((val) => {
        if (typeof val === 'string')
            return val === 'true';
        return val;
    }, zod_1.z.boolean().default(false)).optional(),
    quesStatus: zod_1.z.string().optional().or(zod_1.z.literal('')),
    reviewerId: objectId.optional(),
    addedBy: objectId.optional(),
    verifiedBy: objectId.optional(),
    reviewedDate: zod_1.z.string().datetime().optional(), // ISO date string
    parentQuestionId: zod_1.z.string().optional(),
    compQuesId: zod_1.z.string().optional(),
    questionView: zod_1.z.string().optional(),
}).strict();
/**
 * @title updateQuestionSchema
 * @description Validates the request body for updating an existing course.
 * Banner can be a URL string (if no file uploaded), null (to remove it), or omitted.
 * If req.file is present, it takes precedence for the banner.
 */
exports.updateQuestionSchema = zod_1.z.object({
    mainCategory: objectId,
    category: objectId,
    sectionId: objectId,
    topicId: objectId,
    subTopicId: objectId,
    quesType: zod_1.z.string().min(1, "Description is required."),
    answerType: zod_1.z.string().min(1, "Description is required."),
    status: zod_1.z.enum(['active', 'inactive']).default('active').optional(),
    priority: zod_1.z.preprocess((val) => {
        if (typeof val === 'string')
            return parseInt(val, 10);
        return val;
    }, zod_1.z.number().int().min(0).default(0)).optional(),
    comprehension: comprehensionSchema.optional(),
    question: questionSchema,
    questionImage: questionImageSchema.optional(),
    description: descriptionSchema.optional(),
    answer: answerSchema,
    solution: solutionSchema,
    customerId: zod_1.z.string(),
    options: zod_1.z.array(optionsSchema).max(10, "You can't have more than 10 options").default([]).optional(),
    difficultyLevel: zod_1.z.preprocess((val) => {
        if (typeof val === 'string')
            return parseInt(val, 10);
        return val;
    }, zod_1.z.number().int().min(1).default(1)).optional(),
    marks: zod_1.z.preprocess((val) => {
        if (typeof val === 'string')
            return parseInt(val, 10);
        return val;
    }, zod_1.z.number().int().min(0).default(0)).optional(),
    isVerified: zod_1.z.preprocess((val) => {
        if (typeof val === 'string')
            return val === 'true';
        return val;
    }, zod_1.z.boolean().default(false)).optional(),
    quesStatus: zod_1.z.string().optional().or(zod_1.z.literal('')),
    reviewerId: objectId.optional(),
    addedBy: objectId.optional(),
    verifiedBy: objectId.optional(),
    reviewedDate: zod_1.z.string().datetime().optional(), // ISO date string
    parentQuestionId: zod_1.z.string().optional(),
    compQuesId: zod_1.z.string().optional(),
    questionView: zod_1.z.string().optional(),
}).partial().strict();
exports.getQuestionByIdBodySchema = zod_1.z.object({
    id: objectId, // Expects 'id' as a valid ObjectId string in request params/body
}).strict();
exports.questionSearchSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    page: zod_1.z.preprocess((val) => parseInt(String(val), 10), zod_1.z.number().int().positive().optional().default(1)),
    limit: zod_1.z.preprocess((val) => parseInt(String(val), 10), zod_1.z.number().int().positive().optional().default(10)),
}).strict();
