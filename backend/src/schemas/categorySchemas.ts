// src/schemas/categorySchemas.ts
import { z } from 'zod';
import { Types } from 'mongoose'; // For ObjectId validation

// Helper to validate Mongoose ObjectId strings (re-use from other schemas)
const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format",
});

// Schema for creating a new Category
export const createCategorySchema = z.object({
  categoryName: z.string().min(1, "Category name is required."),
  mainCategory: objectId, // Category must be linked to a MainCategory
  // HIGHLIGHT START
  // When a file is uploaded via Multer, `categoryImage` is NOT part of `req.body` as a string.
  // The controller handles the file from `req.file` and then saves the S3 URL.
  // If you allowed sending a URL directly *instead* of a file, you'd keep it here.
  // For file uploads, the text fields in `req.body` are processed, and the image is separate.
  // So, we effectively remove this validation for `categoryImage` from the Zod schema for creation.
  // The Mongoose model will expect a string for categoryImage, but it's optional at the schema level now.
  // categoryImage: z.string().url("Invalid URL format for category image.").optional().or(z.literal('')),
  // HIGHLIGHT END
  categoryDescription: z.string().optional().or(z.literal('')),
  assignedToHeader: z.coerce.boolean({ required_error: "assignedToHeader is required and must be a boolean." }).optional().or(z.literal(false)),

});

// Schema for updating an existing Category
export const updateCategorySchema = z.object({
  categoryName: z.string().min(1, "Category name must not be empty.").optional(),
  mainCategory: objectId.optional(), // Can optionally update the linked MainCategory
  // For updates, `categoryImage` can be a URL string, an empty string to clear it, or `null`.
  // If a new file is uploaded, this field in `req.body` might be undefined,
  // as the file itself is in `req.file`. The controller handles that specifically.
  categoryImage: z.string().url("Invalid URL format for category image.").optional().or(z.literal('')).or(z.literal(null)),
  categoryDescription: z.string().optional().or(z.literal('')),
  assignedToHeader: z.coerce.boolean().optional(),
  status: z.string().min(1, "Status cannot be empty.").optional(),
}).partial(); // `.partial()` makes all fields optional for updates