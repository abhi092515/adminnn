"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEbookSchema = exports.createEbookSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
// Helper to validate Mongoose ObjectId strings
const objectId = zod_1.z.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});
exports.createEbookSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required."),
    author: zod_1.z.string().min(1, "Author is required."),
    shortDescription: zod_1.z.string().optional(),
    fullDescription: zod_1.z.string().optional(),
    edition: zod_1.z.string().optional(),
    publisher: zod_1.z.string().optional(),
    language: zod_1.z.string().min(1, "Language is required."),
    pages: zod_1.z.coerce.number().int().positive("Pages must be a positive number.").optional(),
    mainCategory: objectId,
    category: objectId,
    videoLink: zod_1.z.string().url("Must be a valid URL.").optional().or(zod_1.z.literal('')),
    oldPrice: zod_1.z.coerce.number().positive("Price must be positive.").optional(),
    newPrice: zod_1.z.coerce.number().positive("New price must be a positive number."),
    status: zod_1.z.enum(['active', 'inactive']).default('active'),
});
// For updates, all fields are optional
exports.updateEbookSchema = exports.createEbookSchema.partial();
