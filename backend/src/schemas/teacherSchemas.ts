// src/schemas/teacherSchemas.ts
import { z } from 'zod';
import { Types } from 'mongoose';

// Helper to validate Mongoose ObjectId strings (re-used from other schemas)
const isValidObjectId = (val: string) => Types.ObjectId.isValid(val);

// Schema for creating a new Teacher
export const createTeacherSchema = z.object({
  name: z.string().min(1, "Teacher name is required."),
  description: z.string().optional().or(z.literal('')), // Optional string or empty string
  qualification: z.string().min(1, "Qualification is required."),
  picture: z.string().url("Invalid URL format for picture").min(1, "Picture URL is required."),
  video: z.string().url("Invalid URL format for video").optional().or(z.literal('')), // Optional video URL
});

// Schema for updating an existing Teacher
export const updateTeacherSchema = z.object({
  name: z.string().min(1, "Teacher name cannot be empty.").optional(),
  description: z.string().optional().or(z.literal('')),
  qualification: z.string().min(1, "Qualification cannot be empty.").optional(),
  picture: z.string().url("Invalid URL format for picture").min(1, "Picture URL cannot be empty.").optional(),
  video: z.string().url("Invalid URL format for video").optional().or(z.literal('')), // Optional video URL
}).partial(); // Makes all fields optional for update operations