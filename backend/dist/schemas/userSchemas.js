"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByIdBodySchema = exports.changePasswordSchema = exports.loginUserSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
// src/schemas/userSchemas.ts
const zod_1 = require("zod");
// Schema for creating a new User
exports.createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "User name is required.").trim(),
    email: zod_1.z.string().email("Invalid email format.").toLowerCase().trim(),
    phone: zod_1.z.string().optional().or(zod_1.z.literal('')), // Optional phone number
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long."),
    city: zod_1.z.string().min(1, "City is required.").trim().optional(),
    state: zod_1.z.string().min(1, "State is required.").trim().optional(),
    isActive: zod_1.z.boolean().default(true).optional(),
    profilePicture: zod_1.z.string().url("Invalid URL format for profile picture").optional().or(zod_1.z.literal('')),
});
// Schema for updating an existing User
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "User name cannot be empty.").trim().optional(),
    email: zod_1.z.string().email("Invalid email format.").toLowerCase().trim().optional(),
    phone: zod_1.z.string().optional().or(zod_1.z.literal('')),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long.").optional(),
    city: zod_1.z.string().min(1, "City cannot be empty.").trim().optional(),
    state: zod_1.z.string().min(1, "State cannot be empty.").trim().optional(),
    isActive: zod_1.z.boolean().optional(),
    profilePicture: zod_1.z.string().url("Invalid URL format for profile picture").optional().or(zod_1.z.literal('')),
}).partial(); // Makes all fields optional for update operations
// Schema for user login
exports.loginUserSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format.").toLowerCase().trim(),
    password: zod_1.z.string().min(1, "Password is required."),
});
// Schema for password change
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, "Current password is required."),
    newPassword: zod_1.z.string().min(6, "New password must be at least 6 characters long."),
    confirmPassword: zod_1.z.string().min(1, "Password confirmation is required."),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation password don't match.",
    path: ["confirmPassword"],
});
// Schema for getting user by ID (for body requests)
exports.getUserByIdBodySchema = zod_1.z.object({
    id: zod_1.z.string().refine((val) => val.length === 24, {
        message: "Invalid User ID format",
    }),
});
