// src/schemas/userSchemas.ts
import { z } from 'zod';

// Schema for creating a new User
export const createUserSchema = z.object({
    name: z.string().min(1, "User name is required.").trim(),
    email: z.string().email("Invalid email format.").toLowerCase().trim(),
    phone: z.string().optional().or(z.literal('')), // Optional phone number
    password: z.string().min(6, "Password must be at least 6 characters long."),
    city: z.string().min(1, "City is required.").trim().optional(),
    state: z.string().min(1, "State is required.").trim().optional(),
    isActive: z.boolean().default(true).optional(),
    profilePicture: z.string().url("Invalid URL format for profile picture").optional().or(z.literal('')),
});

// Schema for updating an existing User
export const updateUserSchema = z.object({
    name: z.string().min(1, "User name cannot be empty.").trim().optional(),
    email: z.string().email("Invalid email format.").toLowerCase().trim().optional(),
    phone: z.string().optional().or(z.literal('')),
    password: z.string().min(6, "Password must be at least 6 characters long.").optional(),
    city: z.string().min(1, "City cannot be empty.").trim().optional(),
    state: z.string().min(1, "State cannot be empty.").trim().optional(),
    isActive: z.boolean().optional(),
    profilePicture: z.string().url("Invalid URL format for profile picture").optional().or(z.literal('')),
}).partial(); // Makes all fields optional for update operations

// Schema for user login
export const loginUserSchema = z.object({
    email: z.string().email("Invalid email format.").toLowerCase().trim(),
    password: z.string().min(1, "Password is required."),
});

// Schema for password change
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(6, "New password must be at least 6 characters long."),
    confirmPassword: z.string().min(1, "Password confirmation is required."),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation password don't match.",
    path: ["confirmPassword"],
});

// Schema for getting user by ID (for body requests)
export const getUserByIdBodySchema = z.object({
    id: z.string().refine((val) => val.length === 24, {
        message: "Invalid User ID format",
    }),
});
