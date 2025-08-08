"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMainCategorySchema = exports.createMainCategorySchema = void 0;
// src/schemas/mainCategorySchemas.ts
const zod_1 = require("zod");
// Helper function to safely parse boolean strings
const booleanString = zod_1.z.preprocess((val) => {
    if (typeof val === 'string') {
        if (val.toLowerCase() === 'true')
            return true;
        if (val.toLowerCase() === 'false')
            return false;
    }
    return val; // Let Zod's .boolean() handle it if it's already a boolean or an invalid type
}, zod_1.z.boolean({
    required_error: "assignedToHeader is required and must be a boolean (or 'true'/'false' string).",
    invalid_type_error: "assignedToHeader must be a boolean (or 'true'/'false' string)."
}));
exports.createMainCategorySchema = zod_1.z.object({
    mainCategoryName: zod_1.z.string().min(1, "Main category name is required."),
    description: zod_1.z.string().optional().or(zod_1.z.literal('')),
    assignedToHeader: booleanString, // Uses the preprocessor for boolean conversion
    // --- FIX APPLIED HERE: Use z.enum for stricter validation ---
    status: zod_1.z.enum(['active', 'inactive'], {
        required_error: "Status is required.",
        invalid_type_error: "Status must be 'active' or 'inactive'."
    }).default('active'),
});
exports.updateMainCategorySchema = zod_1.z.object({
    mainCategoryName: zod_1.z.string().min(1, "Main category name cannot be empty.").optional(),
    mainCategoryImage: zod_1.z.string().url("Invalid URL format for main category image.").optional().or(zod_1.z.literal('')).or(zod_1.z.literal(null)),
    description: zod_1.z.string().optional().or(zod_1.z.literal('')),
    assignedToHeader: booleanString.optional(), // Uses the preprocessor and is optional
    // --- FIX APPLIED HERE: Use z.enum for stricter validation ---
    status: zod_1.z.enum(['active', 'inactive'], {
        invalid_type_error: "Status must be 'active' or 'inactive'."
    }).optional(),
}).partial(); // .partial() makes all fields within it optional for updates
