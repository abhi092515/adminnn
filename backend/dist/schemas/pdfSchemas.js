"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePdfSchema = exports.createPdfSchema = void 0;
// src/schemas/pdfSchemas.ts
const zod_1 = require("zod");
const mongoose_1 = require("mongoose"); // For ObjectId validation
// Helper to validate Mongoose ObjectId strings
const objectId = zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});
// Schema for creating a new PDF
exports.createPdfSchema = zod_1.z.object({
    link: zod_1.z.string().url("Invalid URL format for link").optional().or(zod_1.z.literal('')), // Optional URL or empty string
    status: zod_1.z.string().min(1, "Status is required."),
    // isChat: z.boolean({ required_error: "isChat is required and must be a boolean." }),
    isChat: zod_1.z.coerce.boolean(),
    // isFree: z.boolean({ required_error: "isFree is required and must be a boolean." }),
    isFree: zod_1.z.coerce.boolean(), // ✅ Converts "true" to true, "false" to false
    teacherName: zod_1.z.string().min(1, "Teacher name is required."),
    // priority: z.number().int("Priority must be an integer.").min(0, "Priority cannot be negative."),
    priority: zod_1.z.coerce.number(),
    // isLive: z.boolean({ required_error: "isLive is required and must be a boolean." }),
    isLive: zod_1.z.coerce.boolean(), // ✅ Converts "true" to true, "false" to false
    // image: z.string().url("Invalid URL format for image").optional().or(z.literal('')), // Optional URL or empty string
    image: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    title: zod_1.z.string().min(1, "Title is required."),
    // uploadPdf: z.string().url("Invalid URL format for uploadPdf.").min(1, "uploadPdf is required."), // Assuming this is a URL to the PDF file
    // uploadPdf: z.string().min(1, 'A PDF file is required.').url('Invalid PDF URL format.'),
    description: zod_1.z.string().optional().or(zod_1.z.literal('')), // Optional string or empty string
    courseBanner: zod_1.z.string().url("Invalid URL format for courseBanner").optional().or(zod_1.z.literal('')), // Optional URL or empty string
    // Relationship IDs - these must be valid ObjectIds
    mainCategory: objectId,
    category: objectId,
    section: objectId,
    topic: objectId,
});
// Schema for updating an existing PDF
exports.updatePdfSchema = zod_1.z.object({
    link: zod_1.z.string().url("Invalid URL format for link").optional().or(zod_1.z.literal('')),
    status: zod_1.z.string().min(1, "Status cannot be empty.").optional(),
    isChat: zod_1.z.boolean().optional(),
    isFree: zod_1.z.boolean().optional(),
    teacherName: zod_1.z.string().min(1, "Teacher name cannot be empty.").optional(),
    priority: zod_1.z.number().int("Priority must be an integer.").min(0, "Priority cannot be negative.").optional(),
    isLive: zod_1.z.boolean().optional(),
    image: zod_1.z.string().url("Invalid URL format for image").optional().or(zod_1.z.literal('')),
    title: zod_1.z.string().min(1, "Title cannot be empty.").optional(),
    uploadPdf: zod_1.z.string().url("Invalid URL format for uploadPdf.").min(1, "uploadPdf cannot be empty.").optional(),
    description: zod_1.z.string().optional().or(zod_1.z.literal('')),
    courseBanner: zod_1.z.string().url("Invalid URL format for courseBanner").optional().or(zod_1.z.literal('')),
    // Relationship IDs - these must be valid ObjectIds if provided
    mainCategory: objectId.optional(),
    category: objectId.optional(),
    section: objectId.optional(),
    topic: objectId.optional(),
}).partial(); // Makes all fields optional for update operations
