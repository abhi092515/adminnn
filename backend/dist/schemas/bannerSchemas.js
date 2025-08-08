"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classIdParamSchema = exports.validateObjectId = exports.getBannersQuerySchema = void 0;
const zod_1 = require("zod");
// Schema for query parameters when getting banners
exports.getBannersQuerySchema = zod_1.z.object({
    isActive: zod_1.z.enum(['true', 'false']).optional(),
    page: zod_1.z.string().regex(/^\d+$/, 'Page must be a number').transform(val => parseInt(val, 10)).optional().default('1'),
    limit: zod_1.z.string().regex(/^\d+$/, 'Limit must be a number').transform(val => parseInt(val, 10)).optional().default('10')
}).strict();
// Schema for ObjectId parameters
exports.validateObjectId = zod_1.z.object({
    id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')
}).strict();
// Schema for class ID parameters
exports.classIdParamSchema = zod_1.z.object({
    classId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid class ID format')
}).strict();
