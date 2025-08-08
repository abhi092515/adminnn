"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectIdParamSchema = exports.userHistoryQuerySchema = exports.analyticsQuerySchema = exports.viewQuerySchema = exports.trackViewSchema = void 0;
// src/schemas/viewSchemas.ts
const zod_1 = require("zod");
// Schema for tracking a class view
exports.trackViewSchema = zod_1.z.object({
    classId: zod_1.z.string()
        .min(1, 'Class ID is required')
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid class ID format'),
    userId: zod_1.z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
        .optional(),
    sessionId: zod_1.z.string()
        .min(1, 'Session ID cannot be empty')
        .max(100, 'Session ID too long')
        .optional()
}).strict().refine((data) => data.userId || data.sessionId, {
    message: 'Either userId or sessionId must be provided',
    path: ['userId', 'sessionId']
});
// Schema for pagination and filtering views
exports.viewQuerySchema = zod_1.z.object({
    page: zod_1.z.preprocess((val) => parseInt(String(val), 10), zod_1.z.number().int().positive().optional().default(1)),
    limit: zod_1.z.preprocess((val) => parseInt(String(val), 10), zod_1.z.number().int().positive().max(100).optional().default(50)),
    startDate: zod_1.z.preprocess((val) => val ? new Date(String(val)) : undefined, zod_1.z.date().optional()),
    endDate: zod_1.z.preprocess((val) => val ? new Date(String(val)) : undefined, zod_1.z.date().optional()),
    includeAnonymous: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            return val.toLowerCase() === 'true';
        }
        return val;
    }, zod_1.z.boolean().optional().default(true))
}).strict().refine((data) => {
    if (data.startDate && data.endDate) {
        return data.startDate < data.endDate;
    }
    return true;
}, {
    message: 'Start date must be before end date',
    path: ['startDate', 'endDate']
});
// Schema for analytics query parameters
exports.analyticsQuerySchema = zod_1.z.object({
    startDate: zod_1.z.preprocess((val) => val ? new Date(String(val)) : undefined, zod_1.z.date().optional()),
    endDate: zod_1.z.preprocess((val) => val ? new Date(String(val)) : undefined, zod_1.z.date().optional()),
    period: zod_1.z.enum(['day', 'week', 'month', 'year']).optional().default('day')
}).strict().refine((data) => {
    if (data.startDate && data.endDate) {
        return data.startDate < data.endDate;
    }
    return true;
}, {
    message: 'Start date must be before end date',
    path: ['startDate', 'endDate']
});
// Schema for user history query
exports.userHistoryQuerySchema = zod_1.z.object({
    page: zod_1.z.preprocess((val) => parseInt(String(val), 10), zod_1.z.number().int().positive().optional().default(1)),
    limit: zod_1.z.preprocess((val) => parseInt(String(val), 10), zod_1.z.number().int().positive().max(100).optional().default(20))
}).strict();
// Schema for ObjectId parameters
exports.objectIdParamSchema = zod_1.z.object({
    classId: zod_1.z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid class ID format')
        .optional(),
    userId: zod_1.z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
        .optional()
}).strict();
