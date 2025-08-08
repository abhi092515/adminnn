import { z } from 'zod';
import { Types } from 'mongoose';

// Helper to validate Mongoose ObjectId strings
const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format",
});

// Schema for creating a new rank score
export const createRankScoreSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  courseId: objectId,
  rank_score: z.number().min(0, 'Rank score cannot be negative').max(100, 'Rank score cannot exceed 100'),
  level_score: z.number().min(0, 'Level score cannot be negative').max(100, 'Level score cannot exceed 100'),
  level: z.enum(['Beginner', 'Medium', 'Advanced', 'Pro'], {
    errorMap: () => ({ message: 'Level must be one of: Beginner, Medium, Advanced, Pro' })
  })
});

// Schema for getting rank score by user and course
export const getRankScoreSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  courseId: objectId
});

// Schema for getting rank scores with optional filters
export const getRankScoresSchema = z.object({
  userId: z.string().optional(),
  courseId: objectId.optional(),
  level: z.enum(['Beginner', 'Medium', 'Advanced', 'Pro']).optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()).optional(),
  page: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()).optional()
});

export type CreateRankScoreRequest = z.infer<typeof createRankScoreSchema>;
export type GetRankScoreRequest = z.infer<typeof getRankScoreSchema>;
export type GetRankScoresRequest = z.infer<typeof getRankScoresSchema>;
