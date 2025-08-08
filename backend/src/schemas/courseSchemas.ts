// import { z } from 'zod';
// import { Types } from 'mongoose';

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
import { z } from 'zod';
import { Types } from 'mongoose';

// Helper to validate Mongoose ObjectId strings
const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format",
});

// --- Embedded Document Schemas ---

const facultyDetailsSchema = z.object({
  name: z.string().min(1, 'Faculty name cannot be empty.'),
  designation: z.string().optional(),
  bio: z.string().optional(),
  imageUrl: z.string().url('Faculty image URL must be a valid URL.').optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    facebook: z.string().url().optional()
  }).optional(),
  videoUrl: z.string().url('Faculty video URL must be a valid URL.').optional(),
  experience: z.string().min(1, 'Faculty experience cannot be empty.'),
  reach: z.string().min(1, 'Faculty reach cannot be empty.'),
  description: z.string().min(1, 'Faculty description cannot be empty.'),
}).strict();

const demoVideoSchema = z.object({
  title: z.string().min(1, 'Demo video title cannot be empty.'),
  url: z.string().url('Demo video URL must be a valid URL.'),
}).strict();

const faqItemSchema = z.object({
  question: z.string().min(1, 'FAQ question cannot be empty.'),
  answer: z.string().min(1, 'FAQ answer cannot be empty.'),
}).strict();

// --- Main Course Schemas ---

/**
 * @title createCourseSchema (MODIFIED)
 * @description Validates the request body for creating a new course.
 * Uses z.coerce and z.preprocess to handle string data from FormData.
 */
export const createCourseSchema = z.object({
  // Use z.coerce for automatic string-to-boolean/number conversion
  status: z.enum(['active', 'inactive']).default('active').optional(),
  priority: z.coerce.number().int().min(0).default(0).optional(),
  isLive: z.coerce.boolean().default(false).optional(),
  isRecorded: z.coerce.boolean().default(false).optional(),
  isFree: z.coerce.boolean().default(false).optional(),
  liveClassesCount: z.coerce.number().int().min(0).default(0).optional(),
  recordedClassesCount: z.coerce.number().int().min(0).default(0).optional(),
  price: z.coerce.number().int().min(0).default(0).optional(),

  // These fields are expected as strings, so no changes needed
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  assignHeader: z.string().optional(),
  mainCategory: objectId,
  category: objectId,
  batchInfoPdfUrl: z.string().url('Batch info PDF URL must be a valid URL.').optional(),

  // Use z.preprocess to safely parse JSON-stringified arrays and objects
  description: z.preprocess((val) => {
    if (typeof val === 'string') return JSON.parse(val);
    return val;
  }, z.array(z.string()).optional()),

  courseInfo: z.preprocess((val) => {
    if (typeof val === 'string') return JSON.parse(val);
    return val;
  }, z.array(z.string()).default([]).optional()),

  courseHighlights: z.preprocess((val) => {
    if (typeof val === 'string') return JSON.parse(val);
    return val;
  }, z.array(z.string().min(1, 'Highlight cannot be empty.')).default([]).optional()),

  demoVideos: z.preprocess((val) => {
    if (typeof val === 'string') return JSON.parse(val);
    return val;
  }, z.array(demoVideoSchema).default([]).optional()),

  facultyDetails: z.preprocess((val) => {
    if (typeof val === 'string') return JSON.parse(val);
    return val;
  }, facultyDetailsSchema.optional()),
  
  faq: z.preprocess((val) => {
    if (typeof val === 'string') return JSON.parse(val);
    return val;
  }, z.array(faqItemSchema).default([]).optional()),

}).strict();

/**
 * @title updateCourseSchema (MODIFIED)
 * @description Validates the request body for updating an existing course.
 * Reuses the logic from createCourseSchema and makes all fields optional.
 */
export const updateCourseSchema = createCourseSchema.extend({
  // Banner is only relevant for updates
  banner: z.string().url('Banner must be a valid URL.').nullable().optional(),
}).partial().strict();

export const getCourseByIdBodySchema = z.object({
  id: objectId, // Expects 'id' as a valid ObjectId string in request params/body
}).strict();

export const courseSearchSchema = z.object({
  search: z.string().optional(),
  page: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().positive().optional().default(1)
  ),
  limit: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().positive().optional().default(10)
  ),
}).strict();

export const courseFilterSchema = z.object({
  isLive: z.coerce.boolean().optional(),
  isRecorded: z.coerce.boolean().optional(),
  isFree: z.coerce.boolean().optional(),
  page: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().positive().optional().default(1)
  ),
  limit: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().positive().optional().default(10)
  ),
}).strict();

export const courseFilterBodySchema = z.object({
  isLive: z.boolean().optional(),
  isRecorded: z.boolean().optional(),
  isFree: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  mainCategory: objectId.optional(),
  category: objectId.optional(),
}).strict();

// --- Schema for assigning classes to courses ---
export const assignClassesSchema = z.object({
  courseIds: z.array(objectId).min(1, "At least one course ID is required."),
  classIds: z.array(objectId).min(1, "At least one class ID is required."),
});

// --- Schema for UN-assigning classes from courses ---
export const unassignClassesSchema = z.object({
  courseIds: z.array(objectId).min(1, "At least one course ID is required."),
  classIds: z.array(objectId).min(1, "At least one class ID is required."),
});