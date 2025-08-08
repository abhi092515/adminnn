// src/schemas/orderSchemas.ts
import { z } from 'zod';
import { Types } from 'mongoose';

// Helper to validate Mongoose ObjectId strings
const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});

// Schema for creating a new Order
export const createOrderSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    courseId: objectId // Must be a valid Course ObjectId
});

// Schema for updating an existing Order
export const updateOrderSchema = z.object({
    userId: z.string().min(1).optional(),
    courseId: objectId.optional()
}).partial(); // Makes all fields optional for update operations

// Schema for getting order by ID (for body requests)
export const getOrderByIdBodySchema = z.object({
    id: objectId, // Ensures the ID is a valid MongoDB ObjectId format
});

// Schema for filtering orders (for query parameters)
export const orderFilterSchema = z.object({
    user: z.string().optional(), // External user ID as string
    course: objectId.optional(),
    startDate: z.string().datetime().optional(), // ISO date string
    endDate: z.string().datetime().optional(), // ISO date string
});

// Schema for getting orders by user with live filter
export const getOrdersByUserSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    isLive: z.boolean({ required_error: 'isLive parameter is required' })
});
