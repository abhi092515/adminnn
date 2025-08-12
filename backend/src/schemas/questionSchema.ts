import { z } from 'zod';
import { Types } from 'mongoose';

// Helper to validate Mongoose ObjectId strings
const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format",
});

// Helper to preprocess array fields that might come as strings from form data
const preprocessArrayField = (val: any): string[] => {
  if (Array.isArray(val)) {
    return val.filter(item => typeof item === 'string' && item.trim() !== '');
  }
  if (typeof val === 'string') {
    if (val.trim() === '') return [];
    // Try to parse as JSON first, then fall back to comma-separated
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => typeof item === 'string' && item.trim() !== '');
      }
    } catch (e) {
      // If JSON parsing fails, treat as comma-separated string
      return val.split(',').map(item => item.trim()).filter(item => item !== '');
    }
  }
  return [];
};

// --- Embedded Document Schemas ---

const comprehensionSchema = z.object({
  en: z.string().optional(),
  hi: z.string().optional(),
  be: z.string().optional(),
  gu: z.string().optional(),
}).strict();

const questionSchema = z.object({
  en: z.string().optional(),
  hi: z.string().optional(),
  be: z.string().optional(),
  gu: z.string().optional(),
}).strict();

const questionImageSchema = z.object({
  en: z.string().optional(),
  hi: z.string().optional(),
  be: z.string().optional(),
  gu: z.string().optional(),
}).strict();

const descriptionSchema = z.object({
  en: z.string().optional(),
  hi: z.string().optional(),
  be: z.string().optional(),
  gu: z.string().optional(),
}).strict();

const answerSchema = z.object({
  en: z.string().optional(),
  hi: z.string().optional(),
  be: z.string().optional(),
  gu: z.string().optional(),
}).strict();

const solutionSchema = z.object({
  en: z.string().optional(),
  hi: z.string().optional(),
  be: z.string().optional(),
  gu: z.string().optional(),
}).strict();

const optionsSchema = z.object({
  en: z.string().optional(),
  hi: z.string().optional(),
  be: z.string().optional(),
  gu: z.string().optional(),
}).strict();



// --- Main Course Schemas ---

/**
 * @title createQuestionSchema
 * @description Validates the request body for creating a new course.
 * Banner is handled via file upload (req.file) and not expected in the body.
 */
export const createQuestionSchema = z.object({
  mainCategory: objectId,
  category: objectId,
  sectionId: objectId,
  topicId: objectId,
  subTopicId: objectId,
  quesType: z.string().min(1, "Description is required."),
  answerType: z.string().min(1, "Description is required."),

  status: z.enum(['active', 'inactive']).default('active').optional(),
  priority: z.preprocess((val) => {
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().int().min(0).default(0)).optional(),
  
  comprehension: comprehensionSchema.optional(),
  question: questionSchema,
  questionImage: questionImageSchema.optional(),
  description: descriptionSchema.optional(),
  answer: answerSchema,
  solution: solutionSchema,
  customerId: z.string(),
  options: z.array(optionsSchema).max(10, "You can't have more than 10 options").default([]).optional(),
  difficultyLevel: z.preprocess((val) => {
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().int().min(1).default(1)).optional(),
  marks: z.preprocess((val) => {
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().int().min(0).default(0)).optional(),
  isVerified: z.preprocess((val) => {
    if (typeof val === 'string') return val === 'true';
    return val;
  }, z.boolean().default(false)).optional(),
  quesStatus: z.string().optional().or(z.literal('')),
  reviewerId: objectId.optional(),
  addedBy: objectId.optional(),
  verifiedBy: objectId.optional(),
  reviewedDate: z.string().datetime().optional(), // ISO date string
  parentQuestionId: z.string().optional(),

  compQuesId: z.string().optional(),
  questionView: z.string().optional(),
  
}).strict();

/**
 * @title updateQuestionSchema
 * @description Validates the request body for updating an existing course.
 * Banner can be a URL string (if no file uploaded), null (to remove it), or omitted.
 * If req.file is present, it takes precedence for the banner.
 */
export const updateQuestionSchema = z.object({
   mainCategory: objectId,
  category: objectId,
  sectionId: objectId,
  topicId: objectId,
  subTopicId: objectId,
  quesType: z.string().min(1, "Description is required."),
  answerType: z.string().min(1, "Description is required."),

  status: z.enum(['active', 'inactive']).default('active').optional(),
  priority: z.preprocess((val) => {
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().int().min(0).default(0)).optional(),
  
  comprehension: comprehensionSchema.optional(),
  question: questionSchema,
  questionImage: questionImageSchema.optional(),
  description: descriptionSchema.optional(),
  answer: answerSchema,
  solution: solutionSchema,
  customerId: z.string(),
  options: z.array(optionsSchema).max(10, "You can't have more than 10 options").default([]).optional(),
  difficultyLevel: z.preprocess((val) => {
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().int().min(1).default(1)).optional(),
  marks: z.preprocess((val) => {
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().int().min(0).default(0)).optional(),
  isVerified: z.preprocess((val) => {
    if (typeof val === 'string') return val === 'true';
    return val;
  }, z.boolean().default(false)).optional(),
  quesStatus: z.string().optional().or(z.literal('')),
  reviewerId: objectId.optional(),
  addedBy: objectId.optional(),
  verifiedBy: objectId.optional(),
  reviewedDate: z.string().datetime().optional(), // ISO date string
  parentQuestionId: z.string().optional(),

  compQuesId: z.string().optional(),
  questionView: z.string().optional(),
}).partial().strict();

export const getQuestionByIdBodySchema = z.object({
  id: objectId, // Expects 'id' as a valid ObjectId string in request params/body
}).strict();

export const questionSearchSchema = z.object({
  search: z.string().optional(),
  page: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().positive().optional().default(1)
  ),
  limit: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().positive().optional().default(10)
  ),
}).strict();
