import { z } from 'zod';
import mongoose from 'mongoose';

// Helper to validate Mongoose ObjectId strings
const objectId = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format",
});

export const createBookSchema = z.object({
  title: z.string().min(1, "Title is required."),
  author: z.string().min(1, "Author is required."),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
  edition: z.string().optional(),
  publisher: z.string().optional(),
  publicationDate: z.coerce.date().optional(), // Coerce string to date
  language: z.string().min(1, "Language is required."),
  dimensions: z.string().optional(),
  pages: z.coerce.number().int().positive("Pages must be a positive number.").optional(),
  mainCategory: objectId,
  category: objectId,
  videoLink: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  oldPrice: z.coerce.number().positive("Price must be positive.").optional(),
  newPrice: z.coerce.number().positive("New price must be a positive number."),
  status: z.enum(['active', 'inactive', 'out-of-stock']).default('active'),
});

// For updates, all fields are optional
export const updateBookSchema = createBookSchema.partial();