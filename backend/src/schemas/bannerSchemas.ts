import { z } from 'zod';

// Schema for query parameters when getting banners
export const getBannersQuerySchema = z.object({
  isActive: z.enum(['true', 'false']).optional(),
  page: z.string().regex(/^\d+$/, 'Page must be a number').transform(val => parseInt(val, 10)).optional().default('1'),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(val => parseInt(val, 10)).optional().default('10')
}).strict();

// Schema for ObjectId parameters
export const validateObjectId = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')
}).strict();

// Schema for class ID parameters
export const classIdParamSchema = z.object({
  classId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid class ID format')
}).strict();
