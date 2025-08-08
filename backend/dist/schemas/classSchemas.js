"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClassSchema = exports.createClassSchema = void 0;
// src/schemas/classSchemas.ts
const zod_1 = require("zod");
const mongoose_1 = require("mongoose"); // For ObjectId validation
// Helper to validate Mongoose ObjectId strings
const objectId = zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});
// --- Base schema for common class properties ---
// This schema defines the core properties that both create and update operations might use.
const baseClassSchema = zod_1.z.object({
    link: zod_1.z.string().url("Invalid URL format for link").optional().or(zod_1.z.literal('')),
    status: zod_1.z.enum(['active', 'inactive', 'draft'], {
        errorMap: (issue, ctx) => {
            if (issue.code === zod_1.z.ZodIssueCode.invalid_enum_value) {
                return { message: `Status must be 'active', 'inactive', or 'draft'.` };
            }
            return { message: ctx.defaultError };
        },
    }).default('draft'), // Default 'draft' if not provided
    // Use z.coerce.boolean() to correctly parse "true" / "false" strings from form-data
    isChat: zod_1.z.coerce.boolean(),
    isFree: zod_1.z.coerce.boolean(),
    isLive: zod_1.z.coerce.boolean(),
    isShort: zod_1.z.coerce.boolean().optional().default(false),
    isTopper: zod_1.z.coerce.boolean().optional().default(false),
    teacherName: zod_1.z.string().min(1, "Teacher name is required."),
    // --- IMPORTANT FIX: Use z.coerce.number() for priority ---
    // This correctly parses numeric strings from form-data into numbers.
    priority: zod_1.z.coerce.number().int("Priority must be an integer.").min(0, "Priority cannot be negative."),
    title: zod_1.z.string().min(1, "Title is required."),
    description: zod_1.z.string().optional().or(zod_1.z.literal('')),
    // Relationship IDs - these must be valid ObjectIds
    mainCategory: objectId,
    category: objectId,
    section: objectId,
    topic: objectId,
    // Date fields with validation
    startDate: zod_1.z.coerce.date().optional(), // Optional in request, defaults to now
    endDate: zod_1.z.coerce.date().optional(), // Optional in request, defaults to 1 year later
});
// --- Schema for creating a new Class ---
// Extends the base schema. Fields that are required for creation but might be optional
// in the base schema (due to default values or context) are explicitly handled here.
exports.createClassSchema = baseClassSchema.extend({
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
exports.updateClassSchema = baseClassSchema.partial().extend({
    // `teacherName` and `title` can be optional for updates, but if provided, must meet min length.
    teacherName: zod_1.z.string().min(1, "Teacher name cannot be empty.").optional(),
    title: zod_1.z.string().min(1, "Title cannot be empty.").optional(),
    image: zod_1.z.union([
        zod_1.z.string().url({ message: "Invalid URL format for image." }),
        zod_1.z.literal(""),
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
