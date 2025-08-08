// src/schemas/pdfSchemas.ts
import { z } from 'zod';
import { Types } from 'mongoose'; // For ObjectId validation

// Helper to validate Mongoose ObjectId strings
const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format",
});

// Schema for creating a new PDF
export const createPdfSchema = z.object({
  link: z.string().url("Invalid URL format for link").optional().or(z.literal('')), // Optional URL or empty string
  status: z.string().min(1, "Status is required."),
  // isChat: z.boolean({ required_error: "isChat is required and must be a boolean." }),
  isChat: z.coerce.boolean(),
  // isFree: z.boolean({ required_error: "isFree is required and must be a boolean." }),
  isFree: z.coerce.boolean(),      // ✅ Converts "true" to true, "false" to false

  teacherName: z.string().min(1, "Teacher name is required."),
  // priority: z.number().int("Priority must be an integer.").min(0, "Priority cannot be negative."),
  priority: z.coerce.number(),  
  // isLive: z.boolean({ required_error: "isLive is required and must be a boolean." }),
  isLive: z.coerce.boolean(),      // ✅ Converts "true" to true, "false" to false

  // image: z.string().url("Invalid URL format for image").optional().or(z.literal('')), // Optional URL or empty string
  image: z.string().url().optional().or(z.literal('')),

  title: z.string().min(1, "Title is required."),
  // uploadPdf: z.string().url("Invalid URL format for uploadPdf.").min(1, "uploadPdf is required."), // Assuming this is a URL to the PDF file
  // uploadPdf: z.string().min(1, 'A PDF file is required.').url('Invalid PDF URL format.'),
  description: z.string().optional().or(z.literal('')), // Optional string or empty string
  courseBanner: z.string().url("Invalid URL format for courseBanner").optional().or(z.literal('')), // Optional URL or empty string

  // Relationship IDs - these must be valid ObjectIds
  mainCategory: objectId,
  category: objectId,
  section: objectId,
  topic: objectId,
});

// Schema for updating an existing PDF
export const updatePdfSchema = z.object({
  link: z.string().url("Invalid URL format for link").optional().or(z.literal('')),
  status: z.string().min(1, "Status cannot be empty.").optional(),
  isChat: z.boolean().optional(),
  isFree: z.boolean().optional(),
  teacherName: z.string().min(1, "Teacher name cannot be empty.").optional(),
  priority: z.number().int("Priority must be an integer.").min(0, "Priority cannot be negative.").optional(),
  isLive: z.boolean().optional(),
  image: z.string().url("Invalid URL format for image").optional().or(z.literal('')),
  title: z.string().min(1, "Title cannot be empty.").optional(),
  uploadPdf: z.string().url("Invalid URL format for uploadPdf.").min(1, "uploadPdf cannot be empty.").optional(),
  description: z.string().optional().or(z.literal('')),
  courseBanner: z.string().url("Invalid URL format for courseBanner").optional().or(z.literal('')),

  // Relationship IDs - these must be valid ObjectIds if provided
  mainCategory: objectId.optional(),
  category: objectId.optional(),
  section: objectId.optional(),
  topic: objectId.optional(),
}).partial(); // Makes all fields optional for update operations

