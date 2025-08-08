// src/schemas/viewSchemas.ts
import { z } from 'zod';

// Schema for tracking a class view
export const trackViewSchema = z.object({
  classId: z.string()
    .min(1, 'Class ID is required')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid class ID format'),
  userId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
    .optional(),
  sessionId: z.string()
    .min(1, 'Session ID cannot be empty')
    .max(100, 'Session ID too long')
    .optional()
}).strict().refine(
  (data) => data.userId || data.sessionId,
  {
    message: 'Either userId or sessionId must be provided',
    path: ['userId', 'sessionId']
  }
);

// Schema for pagination and filtering views
export const viewQuerySchema = z.object({
  page: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().positive().optional().default(1)
  ),
  limit: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().positive().max(100).optional().default(50)
  ),
  startDate: z.preprocess(
    (val) => val ? new Date(String(val)) : undefined,
    z.date().optional()
  ),
  endDate: z.preprocess(
    (val) => val ? new Date(String(val)) : undefined,
    z.date().optional()
  ),
  includeAnonymous: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        return val.toLowerCase() === 'true';
      }
      return val;
    },
    z.boolean().optional().default(true)
  )
}).strict().refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate < data.endDate;
    }
    return true;
  },
  {
    message: 'Start date must be before end date',
    path: ['startDate', 'endDate']
  }
);

// Schema for analytics query parameters
export const analyticsQuerySchema = z.object({
  startDate: z.preprocess(
    (val) => val ? new Date(String(val)) : undefined,
    z.date().optional()
  ),
  endDate: z.preprocess(
    (val) => val ? new Date(String(val)) : undefined,
    z.date().optional()
  ),
  period: z.enum(['day', 'week', 'month', 'year']).optional().default('day')
}).strict().refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate < data.endDate;
    }
    return true;
  },
  {
    message: 'Start date must be before end date',
    path: ['startDate', 'endDate']
  }
);

// Schema for user history query
export const userHistoryQuerySchema = z.object({
  page: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().positive().optional().default(1)
  ),
  limit: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().positive().max(100).optional().default(20)
  )
}).strict();

// Schema for ObjectId parameters
export const objectIdParamSchema = z.object({
  classId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid class ID format')
    .optional(),
  userId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
    .optional()
}).strict();

export type TrackViewInput = z.infer<typeof trackViewSchema>;
export type ViewQueryInput = z.infer<typeof viewQuerySchema>;
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
export type UserHistoryQueryInput = z.infer<typeof userHistoryQuerySchema>;
export type ObjectIdParamInput = z.infer<typeof objectIdParamSchema>;
