"use strict";
// import { z } from 'zod';
// import { Types } from 'mongoose';
Object.defineProperty(exports, "__esModule", { value: true });
exports.unassignClassesSchema = exports.assignClassesSchema = exports.courseFilterBodySchema = exports.courseFilterSchema = exports.courseSearchSchema = exports.getCourseByIdBodySchema = exports.updateCourseSchema = exports.createCourseSchema = void 0;
// // Helper to validate Mongoose ObjectId strings
// const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
//   message: "Invalid ObjectId format",
// });
// // --- Embedded Document Schemas ---
// const facultyDetailsSchema = z.object({
//   name: z.string().min(1, 'Faculty name cannot be empty.'),
//   designation: z.string().optional(),
//   bio: z.string().optional(),
//   imageUrl: z.string().url('Faculty image URL must be a valid URL.').optional(),
//   socialLinks: z.object({
//     linkedin: z.string().url().optional(),
//     twitter: z.string().url().optional(),
//     facebook: z.string().url().optional()
//   }).optional(),
//   videoUrl: z.string().url('Faculty video URL must be a valid URL.').optional(),
//   experience: z.string().min(1, 'Faculty experience cannot be empty.'),
//   reach: z.string().min(1, 'Faculty reach cannot be empty.'),
//   description: z.string().min(1, 'Faculty description cannot be empty.'),
// }).strict();
// const demoVideoSchema = z.object({
//   title: z.string().min(1, 'Demo video title cannot be empty.'),
//   url: z.string().url('Demo video URL must be a valid URL.'),
// }).strict();
// const faqItemSchema = z.object({
//   question: z.string().min(1, 'FAQ question cannot be empty.'),
//   answer: z.string().min(1, 'FAQ answer cannot be empty.'),
// }).strict();
// // --- Main Course Schemas ---
// /**
//  * @title createCourseSchema
//  * @description Validates the request body for creating a new course.
//  * Banner is handled via file upload (req.file) and not expected in the body.
//  */
// export const createCourseSchema = z.object({
//   status: z.enum(['active', 'inactive']).default('active').optional(),
//   priority: z.number().int().min(0).default(0).optional(),
//   isLive: z.boolean().default(false).optional(),
//   isRecorded: z.boolean().default(false).optional(),
//   isFree: z.boolean().default(false).optional(),
//   title: z.string().min(3, 'Title must be at least 3 characters long.'),
//   assignHeader: z.string().optional(),
//   description: z.array(z.string()).optional(),
//   mainCategory: objectId,
//   category: objectId,
//   liveClassesCount: z.number().int().min(0).default(0).optional(),
//   recordedClassesCount: z.number().int().min(0).default(0).optional(), courseInfo: z.array(z.string()).default([]).optional(),
//   demoVideos: z.array(demoVideoSchema).default([]).optional(),
//   batchInfoPdfUrl: z.string().url('Batch info PDF URL must be a valid URL.').optional(),
//   facultyDetails: facultyDetailsSchema.optional(),
//   courseHighlights: z.array(z.string().min(1, 'Highlight cannot be empty.')).default([]).optional(),
//   faq: z.array(faqItemSchema).default([]).optional(),
//   price: z.number().int().min(0).default(0).optional(),
// }).strict();
// /**
//  * @title updateCourseSchema
//  * @description Validates the request body for updating an existing course.
//  * Banner can be a URL string (if no file uploaded), null (to remove it), or omitted.
//  * If req.file is present, it takes precedence for the banner.
//  */
// export const updateCourseSchema = z.object({
//   status: z.enum(['active', 'inactive']).optional(),
//   priority: z.number().int().min(0).optional(),
//   isLive: z.boolean().optional(),
//   isRecorded: z.boolean().optional(),
//   isFree: z.boolean().optional(),
//   banner: z.string().url('Banner must be a valid URL.').nullable().optional(),
//   title: z.string().min(3, 'Title must be at least 3 characters long.').optional(),
//   assignHeader: z.string().min(3, 'Assign Header must be at least 3 characters long.').optional(),
//   description: z.array(z.string()).optional(),
//   mainCategory: objectId.optional(),
//   category: objectId.optional(),
//   liveClassesCount: z.number().int().min(0).optional(),
//   recordedClassesCount: z.number().int().min(0).optional(),
//   courseInfo: z.array(z.string()).optional(),
//   demoVideos: z.array(demoVideoSchema).optional(),
//   batchInfoPdfUrl: z.string().url('Batch info PDF URL must be a valid URL.').optional(),
//   facultyDetails: facultyDetailsSchema.optional(), courseHighlights: z.array(z.string().min(1, 'Highlight cannot be empty.')).optional(),
//   faq: z.array(faqItemSchema).optional(),
//   price: z.number().int().min(0).optional(),
// }).partial().strict();
// export const getCourseByIdBodySchema = z.object({
//   id: objectId, // Expects 'id' as a valid ObjectId string in request params/body
// }).strict();
// export const courseSearchSchema = z.object({
//   search: z.string().optional(),
//   page: z.preprocess(
//     (val) => parseInt(String(val), 10),
//     z.number().int().positive().optional().default(1)
//   ),
//   limit: z.preprocess(
//     (val) => parseInt(String(val), 10),
//     z.number().int().positive().optional().default(10)
//   ),
// }).strict();
// export const courseFilterSchema = z.object({
//   isLive: z.preprocess(
//     (val) => {
//       if (typeof val === 'string') {
//         if (val.toLowerCase() === 'true') return true;
//         if (val.toLowerCase() === 'false') return false;
//       }
//       return val; // Return original value if not 'true'/'false' string for Zod to handle
//     },
//     z.boolean().optional()
//   ),
//   isRecorded: z.preprocess(
//     (val) => {
//       if (typeof val === 'string') {
//         if (val.toLowerCase() === 'true') return true;
//         if (val.toLowerCase() === 'false') return false;
//       }
//       return val;
//     },
//     z.boolean().optional()
//   ),
//   isFree: z.preprocess(
//     (val) => {
//       if (typeof val === 'string') {
//         if (val.toLowerCase() === 'true') return true;
//         if (val.toLowerCase() === 'false') return false;
//       }
//       return val;
//     },
//     z.boolean().optional()
//   ),
//   page: z.preprocess(
//     (val) => parseInt(String(val), 10),
//     z.number().int().positive().optional().default(1)
//   ),
//   limit: z.preprocess(
//     (val) => parseInt(String(val), 10),
//     z.number().int().positive().optional().default(10)
//   ),
// }).strict();
// export const courseFilterBodySchema = z.object({
//   isLive: z.boolean().optional(),
//   isRecorded: z.boolean().optional(),
//   isFree: z.boolean().optional(),
//   status: z.enum(['active', 'inactive']).optional(),
//   mainCategory: objectId.optional(),
//   category: objectId.optional(),
// }).strict();
// // --- Schema for assigning classes to courses ---
// export const assignClassesSchema = z.object({
//   courseIds: z.array(objectId).min(1, "At least one course ID is required."),
//   classIds: z.array(objectId).min(1, "At least one class ID is required."),
// });
// // --- Schema for UN-assigning classes from courses ---
// export const unassignClassesSchema = z.object({
//   courseIds: z.array(objectId).min(1, "At least one course ID is required."),
//   classIds: z.array(objectId).min(1, "At least one class ID is required."),
// }); 
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
// Helper to validate Mongoose ObjectId strings
const objectId = zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});
// --- Embedded Document Schemas ---
const facultyDetailsSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Faculty name cannot be empty.'),
    designation: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string().url('Faculty image URL must be a valid URL.').optional(),
    socialLinks: zod_1.z.object({
        linkedin: zod_1.z.string().url().optional(),
        twitter: zod_1.z.string().url().optional(),
        facebook: zod_1.z.string().url().optional()
    }).optional(),
    videoUrl: zod_1.z.string().url('Faculty video URL must be a valid URL.').optional(),
    experience: zod_1.z.string().min(1, 'Faculty experience cannot be empty.'),
    reach: zod_1.z.string().min(1, 'Faculty reach cannot be empty.'),
    description: zod_1.z.string().min(1, 'Faculty description cannot be empty.'),
}).strict();
const demoVideoSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Demo video title cannot be empty.'),
    url: zod_1.z.string().url('Demo video URL must be a valid URL.'),
}).strict();
const faqItemSchema = zod_1.z.object({
    question: zod_1.z.string().min(1, 'FAQ question cannot be empty.'),
    answer: zod_1.z.string().min(1, 'FAQ answer cannot be empty.'),
}).strict();
// --- Main Course Schemas ---
/**
 * @title createCourseSchema (MODIFIED)
 * @description Validates the request body for creating a new course.
 * Uses z.coerce and z.preprocess to handle string data from FormData.
 */
exports.createCourseSchema = zod_1.z.object({
    // Use z.coerce for automatic string-to-boolean/number conversion
    status: zod_1.z.enum(['active', 'inactive']).default('active').optional(),
    priority: zod_1.z.coerce.number().int().min(0).default(0).optional(),
    isLive: zod_1.z.coerce.boolean().default(false).optional(),
    isRecorded: zod_1.z.coerce.boolean().default(false).optional(),
    isFree: zod_1.z.coerce.boolean().default(false).optional(),
    liveClassesCount: zod_1.z.coerce.number().int().min(0).default(0).optional(),
    recordedClassesCount: zod_1.z.coerce.number().int().min(0).default(0).optional(),
    price: zod_1.z.coerce.number().int().min(0).default(0).optional(),
    // These fields are expected as strings, so no changes needed
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters long.'),
    assignHeader: zod_1.z.string().optional(),
    mainCategory: objectId,
    category: objectId,
    batchInfoPdfUrl: zod_1.z.string().url('Batch info PDF URL must be a valid URL.').optional(),
    // Use z.preprocess to safely parse JSON-stringified arrays and objects
    description: zod_1.z.preprocess((val) => {
        if (typeof val === 'string')
            return JSON.parse(val);
        return val;
    }, zod_1.z.array(zod_1.z.string()).optional()),
    courseInfo: zod_1.z.preprocess((val) => {
        if (typeof val === 'string')
            return JSON.parse(val);
        return val;
    }, zod_1.z.array(zod_1.z.string()).default([]).optional()),
    courseHighlights: zod_1.z.preprocess((val) => {
        if (typeof val === 'string')
            return JSON.parse(val);
        return val;
    }, zod_1.z.array(zod_1.z.string().min(1, 'Highlight cannot be empty.')).default([]).optional()),
    demoVideos: zod_1.z.preprocess((val) => {
        if (typeof val === 'string')
            return JSON.parse(val);
        return val;
    }, zod_1.z.array(demoVideoSchema).default([]).optional()),
    facultyDetails: zod_1.z.preprocess((val) => {
        if (typeof val === 'string')
            return JSON.parse(val);
        return val;
    }, facultyDetailsSchema.optional()),
    faq: zod_1.z.preprocess((val) => {
        if (typeof val === 'string')
            return JSON.parse(val);
        return val;
    }, zod_1.z.array(faqItemSchema).default([]).optional()),
}).strict();
/**
 * @title updateCourseSchema (MODIFIED)
 * @description Validates the request body for updating an existing course.
 * Reuses the logic from createCourseSchema and makes all fields optional.
 */
exports.updateCourseSchema = exports.createCourseSchema.extend({
    // Banner is only relevant for updates
    banner: zod_1.z.string().url('Banner must be a valid URL.').nullable().optional(),
}).partial().strict();
exports.getCourseByIdBodySchema = zod_1.z.object({
    id: objectId, // Expects 'id' as a valid ObjectId string in request params/body
}).strict();
exports.courseSearchSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    page: zod_1.z.preprocess((val) => parseInt(String(val), 10), zod_1.z.number().int().positive().optional().default(1)),
    limit: zod_1.z.preprocess((val) => parseInt(String(val), 10), zod_1.z.number().int().positive().optional().default(10)),
}).strict();
exports.courseFilterSchema = zod_1.z.object({
    isLive: zod_1.z.coerce.boolean().optional(),
    isRecorded: zod_1.z.coerce.boolean().optional(),
    isFree: zod_1.z.coerce.boolean().optional(),
    page: zod_1.z.preprocess((val) => parseInt(String(val), 10), zod_1.z.number().int().positive().optional().default(1)),
    limit: zod_1.z.preprocess((val) => parseInt(String(val), 10), zod_1.z.number().int().positive().optional().default(10)),
}).strict();
exports.courseFilterBodySchema = zod_1.z.object({
    isLive: zod_1.z.boolean().optional(),
    isRecorded: zod_1.z.boolean().optional(),
    isFree: zod_1.z.boolean().optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
    mainCategory: objectId.optional(),
    category: objectId.optional(),
}).strict();
// --- Schema for assigning classes to courses ---
exports.assignClassesSchema = zod_1.z.object({
    courseIds: zod_1.z.array(objectId).min(1, "At least one course ID is required."),
    classIds: zod_1.z.array(objectId).min(1, "At least one class ID is required."),
});
// --- Schema for UN-assigning classes from courses ---
exports.unassignClassesSchema = zod_1.z.object({
    courseIds: zod_1.z.array(objectId).min(1, "At least one course ID is required."),
    classIds: zod_1.z.array(objectId).min(1, "At least one class ID is required."),
});
