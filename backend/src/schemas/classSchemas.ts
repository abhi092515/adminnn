// src/schemas/classSchemas.ts
import { z } from 'zod';
import { Types } from 'mongoose'; // For ObjectId validation

// Helper to validate Mongoose ObjectId strings
const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format",
});

// --- Base schema for common class properties ---
// This schema defines the core properties that both create and update operations might use.
const baseClassSchema = z.object({
  link: z.string().url("Invalid URL format for link").optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'draft'], {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return { message: `Status must be 'active', 'inactive', or 'draft'.` };
      }
      return { message: ctx.defaultError };
    },
  }).default('draft'), // Default 'draft' if not provided
  // Use z.coerce.boolean() to correctly parse "true" / "false" strings from form-data
  isChat: z.coerce.boolean(),
  isFree: z.coerce.boolean(),
  isLive: z.coerce.boolean(),
  isShort: z.coerce.boolean().optional().default(false),
  isTopper: z.coerce.boolean().optional().default(false),

  teacherName: z.string().min(1, "Teacher name is required."),

  // --- IMPORTANT FIX: Use z.coerce.number() for priority ---
  // This correctly parses numeric strings from form-data into numbers.
  priority: z.coerce.number().int("Priority must be an integer.").min(0, "Priority cannot be negative."),

  title: z.string().min(1, "Title is required."),
  description: z.string().optional().or(z.literal('')),

  // Relationship IDs - these must be valid ObjectIds
  mainCategory: objectId,
  category: objectId,
  section: objectId,
  topic: objectId,
  // Date fields with validation
  startDate: z.coerce.date().optional(), // Optional in request, defaults to now
  endDate: z.coerce.date().optional(), // Optional in request, defaults to 1 year later
});

// --- Schema for creating a new Class ---
// Extends the base schema. Fields that are required for creation but might be optional
// in the base schema (due to default values or context) are explicitly handled here.
export const createClassSchema = baseClassSchema.extend({
  // `status` is already handled by default in `baseClassSchema`.
  // If you want to allow it to be optional in the *request body* and still apply the default,
  // ensure `.optional()` is added here.
  status: baseClassSchema.shape.status.optional(), // Inherits default from base, allows omission

  // `image` is handled by Multer as a file upload and will not be in `req.body` directly.
  // Its URL will be assigned by the controller after file processing.
  // Thus, it is NOT part of this Zod schema for direct validation.
});

// --- Schema for updating an existing Class ---
// This schema makes all fields from `baseClassSchema` optional using `.partial()`.
// It then `extends` to provide specific validations for fields like `teacherName` and `title`
// if they *are* provided, or handles the `image` field's specific update logic.
export const updateClassSchema = baseClassSchema.partial().extend({
  // `teacherName` and `title` can be optional for updates, but if provided, must meet min length.
  teacherName: z.string().min(1, "Teacher name cannot be empty.").optional(),
  title: z.string().min(1, "Title cannot be empty.").optional(),
  image: z.union([
    z.string().url({ message: "Invalid URL format for image." }),
    z.literal(""),
]).optional(),

  // --- Image Handling for Updates (Crucial Logic) ---
  // This `image` field in the Zod schema is specifically for when the client sends
  // a string in `req.body.image` to indicate *clearing* the image, or providing an *existing URL*.
  // It does NOT validate a file upload via Multer (`req.file`).
  // Your controller should check `req.file` FIRST for new uploads,
  // then check `req.body.image` for explicit clear commands ('', null).
  // image: z.string().url("Invalid URL format for image.").optional().or(z.literal('')).or(z.literal(null)),
  // Relationship IDs are optional for updates, inherited from `.partial()`
  // and already have `objectId` validation if they are present.
});