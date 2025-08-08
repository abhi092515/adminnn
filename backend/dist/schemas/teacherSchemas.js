"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTeacherSchema = exports.createTeacherSchema = void 0;
// src/schemas/teacherSchemas.ts
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
// Helper to validate Mongoose ObjectId strings (re-used from other schemas)
const isValidObjectId = (val) => mongoose_1.Types.ObjectId.isValid(val);
// Schema for creating a new Teacher
exports.createTeacherSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Teacher name is required."),
    description: zod_1.z.string().optional().or(zod_1.z.literal('')), // Optional string or empty string
    qualification: zod_1.z.string().min(1, "Qualification is required."),
    picture: zod_1.z.string().url("Invalid URL format for picture").min(1, "Picture URL is required."),
    video: zod_1.z.string().url("Invalid URL format for video").optional().or(zod_1.z.literal('')), // Optional video URL
});
// Schema for updating an existing Teacher
exports.updateTeacherSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Teacher name cannot be empty.").optional(),
    description: zod_1.z.string().optional().or(zod_1.z.literal('')),
    qualification: zod_1.z.string().min(1, "Qualification cannot be empty.").optional(),
    picture: zod_1.z.string().url("Invalid URL format for picture").min(1, "Picture URL cannot be empty.").optional(),
    video: zod_1.z.string().url("Invalid URL format for video").optional().or(zod_1.z.literal('')), // Optional video URL
}).partial(); // Makes all fields optional for update operations
