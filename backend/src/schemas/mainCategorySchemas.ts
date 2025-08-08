// src/schemas/mainCategorySchemas.ts
import { z } from 'zod';

// Helper function to safely parse boolean strings
const booleanString = z.preprocess((val) => {
  if (typeof val === 'string') {
    if (val.toLowerCase() === 'true') return true;
    if (val.toLowerCase() === 'false') return false;
  }
  return val; // Let Zod's .boolean() handle it if it's already a boolean or an invalid type
}, z.boolean({
  required_error: "assignedToHeader is required and must be a boolean (or 'true'/'false' string).",
  invalid_type_error: "assignedToHeader must be a boolean (or 'true'/'false' string)."
}));

export const createMainCategorySchema = z.object({
  mainCategoryName: z.string().min(1, "Main category name is required."),
  description: z.string().optional().or(z.literal('')),
  assignedToHeader: booleanString, // Uses the preprocessor for boolean conversion
  // --- FIX APPLIED HERE: Use z.enum for stricter validation ---
  status: z.enum(['active', 'inactive'], {
    required_error: "Status is required.",
    invalid_type_error: "Status must be 'active' or 'inactive'."
  }).default('active'),
});

export const updateMainCategorySchema = z.object({
  mainCategoryName: z.string().min(1, "Main category name cannot be empty.").optional(),
  mainCategoryImage: z.string().url("Invalid URL format for main category image.").optional().or(z.literal('')).or(z.literal(null)),
  description: z.string().optional().or(z.literal('')),
  assignedToHeader: booleanString.optional(), // Uses the preprocessor and is optional
  // --- FIX APPLIED HERE: Use z.enum for stricter validation ---
  status: z.enum(['active', 'inactive'], {
    invalid_type_error: "Status must be 'active' or 'inactive'."
  }).optional(),
}).partial(); // .partial() makes all fields within it optional for updates