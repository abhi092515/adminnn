// src/schemas/testResultSchemas.ts
import { z } from 'zod';
import { Types } from 'mongoose'; 

const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format",
});

export const testResultSchema = z.object({
  seriesId: objectId, 
  userId: z.string().min(1, 'User ID is required'), 
  courseId: objectId, 
  accuracy: z.number().min(0, "Accuracy cannot be negative").max(100, "Accuracy cannot exceed 100"),
  timeSpent: z.number().min(0, "Time spent cannot be negative"), // Time spent in seconds
  totalTime: z.number().min(0, "Total time cannot be negative"), // Total allocated time in seconds
  questionsAttempted: z.number().int("Questions attempted must be an integer").min(0, "Questions attempted cannot be negative"),
  totalQuestions: z.number().int("Total questions must be an integer").min(0, "Total questions cannot be negative"),
  score: z.number().min(0, "Score cannot be negative"),
});

// Schema for getting test result by ID (for params validation)
export const getTestResultByIdSchema = z.object({
  id: objectId, 
});

// Schema for filtering test results (for query parameters)
export const testResultFilterSchema = z.object({
  userId: z.string().optional(), // External user ID as string
  courseId: objectId.optional(),
  seriesId: objectId.optional(),
  minAccuracy: z.number().min(0).max(100).optional(),
  maxAccuracy: z.number().min(0).max(100).optional(),
  minScore: z.number().min(0).optional(),
  maxScore: z.number().min(0).optional(),
});

// Schema for getting test results by both userId and courseId (for params validation)
export const getTestResultsByUserAndCourseSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  courseId: objectId,
});

// Schema for POST request to get test results by user and course (request body)
export const getTestResultsByUserAndCoursePostSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  courseId: objectId,
});
