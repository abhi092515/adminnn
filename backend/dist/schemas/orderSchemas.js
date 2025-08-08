"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersByUserSchema = exports.orderFilterSchema = exports.getOrderByIdBodySchema = exports.updateOrderSchema = exports.createOrderSchema = void 0;
// src/schemas/orderSchemas.ts
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
// Helper to validate Mongoose ObjectId strings
const objectId = zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});
// Schema for creating a new Order
exports.createOrderSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    courseId: objectId // Must be a valid Course ObjectId
});
// Schema for updating an existing Order
exports.updateOrderSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1).optional(),
    courseId: objectId.optional()
}).partial(); // Makes all fields optional for update operations
// Schema for getting order by ID (for body requests)
exports.getOrderByIdBodySchema = zod_1.z.object({
    id: objectId, // Ensures the ID is a valid MongoDB ObjectId format
});
// Schema for filtering orders (for query parameters)
exports.orderFilterSchema = zod_1.z.object({
    user: zod_1.z.string().optional(), // External user ID as string
    course: objectId.optional(),
    startDate: zod_1.z.string().datetime().optional(), // ISO date string
    endDate: zod_1.z.string().datetime().optional(), // ISO date string
});
// Schema for getting orders by user with live filter
exports.getOrdersByUserSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    isLive: zod_1.z.boolean({ required_error: 'isLive parameter is required' })
});
