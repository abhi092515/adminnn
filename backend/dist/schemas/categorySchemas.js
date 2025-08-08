"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategorySchema = exports.createCategorySchema = void 0;
// src/schemas/categorySchemas.ts
const zod_1 = require("zod");
const mongoose_1 = require("mongoose"); // For ObjectId validation
// Helper to validate Mongoose ObjectId strings (re-use from other schemas)
const objectId = zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});
// Schema for creating a new Category
exports.createCategorySchema = zod_1.z.object({
    categoryName: zod_1.z.string().min(1, "Category name is required."),
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
    categoryDescription: zod_1.z.string().optional().or(zod_1.z.literal('')),
    assignedToHeader: zod_1.z.coerce.boolean({ required_error: "assignedToHeader is required and must be a boolean." }).optional().or(zod_1.z.literal(false)),
});
// Schema for updating an existing Category
exports.updateCategorySchema = zod_1.z.object({
    categoryName: zod_1.z.string().min(1, "Category name must not be empty.").optional(),
    mainCategory: objectId.optional(), // Can optionally update the linked MainCategory
    // For updates, `categoryImage` can be a URL string, an empty string to clear it, or `null`.
    // If a new file is uploaded, this field in `req.body` might be undefined,
    // as the file itself is in `req.file`. The controller handles that specifically.
    categoryImage: zod_1.z.string().url("Invalid URL format for category image.").optional().or(zod_1.z.literal('')).or(zod_1.z.literal(null)),
    categoryDescription: zod_1.z.string().optional().or(zod_1.z.literal('')),
    assignedToHeader: zod_1.z.coerce.boolean().optional(),
    status: zod_1.z.string().min(1, "Status cannot be empty.").optional(),
}).partial(); // `.partial()` makes all fields optional for updates
