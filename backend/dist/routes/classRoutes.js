"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const classController_1 = require("../controllers/classController");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// --- Multer Configuration ---
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/classes/'; // Dedicated directory for class images
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true }); // Create directory if it doesn't exist
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename using timestamp and original extension
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage: storage,
    // You can add fileFilter and limits here if specific constraints are needed for class images
    // For example:
    // limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    // fileFilter: (req, file, cb) => {
    //   if (file.mimetype.startsWith('image/')) {
    //     cb(null, true);
    //   } else {
    //     cb(new Error('Only image files are allowed for class image.'), false);
    //   }
    // },
});
// --- End Multer Configuration ---
/**
 * @swagger
 * tags:
 * - name: Classes
 * description: API for managing educational classes with multiple relationships
 */
/**
 * @swagger
 * /classes:
 * post:
 * summary: Create a new class
 * tags: [Classes]
 * requestBody:
 * required: true
 * content:
 * multipart/form-data: # Changed to multipart/form-data to reflect actual handling
 * schema:
 * type: object
 * properties:
 * link:
 * type: string
 * format: uri
 * description: URL link for the class (e.g., video conference link). Optional.
 * example: "https://zoom.us/j/123456789"
 * status:
 * type: string
 * description: Current status of the class. Optional, defaults to 'draft'.
 * enum: [active, inactive, draft]
 * example: "draft"
 * isChat:
 * type: string # Send as "true" or "false" string
 * description: Indicates if chat is enabled for the class (send as "true" or "false" string).
 * example: "true"
 * isFree:
 * type: string # Send as "true" or "false" string
 * description: Indicates if the class is free or paid (send as "true" or "false" string).
 * example: "false"
 * teacherName:
 * type: string
 * description: Name of the teacher conducting the class. Required.
 * example: "Prof. Alan Turing"
 * priority:
 * type: string # Send as numeric string
 * description: Priority order for displaying classes (lower number = higher priority). Optional, defaults to 0.
 * example: "10"
 * isLive:
 * type: string # Send as "true" or "false" string
 * description: Indicates if the class is currently live (send as "true" or "false" string).
 * example: "true"
 * image:
 * type: string
 * format: binary # For file upload
 * description: The class thumbnail or banner image file. Optional.
 * title:
 * type: string
 * description: Title of the class (must be unique). Required.
 * example: "Introduction to AI Ethics"
 * description:
 * type: string
 * description: Detailed description of the class. Optional.
 * example: "An introductory course on ethical considerations in Artificial Intelligence."
 * mainCategory:
 * type: string
 * description: The ID of the main category this class belongs to. Required.
 * example: "60c72b1f9b1e8e001c8f4b0d"
 * category:
 * type: string
 * description: The ID of the sub-category this class belongs to. Required.
 * example: "60c72b1f9b1e8e001c8f4b0e"
 * section:
 * type: string
 * description: The ID of the section this class belongs to. Required.
 * example: "60c72b1f9b1e8e001c8f4b0f"
 * topic:
 * type: string
 * description: The ID of the topic this class belongs to. Required.
 * example: "60c72b1f9b1e8e001c8f4b10"
 * responses:
 * 201:
 * description: Class created successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Class created successfully" }
 * data: { $ref: '#/components/schemas/Class' } # Reference the Class schema
 * 400:
 * description: Bad request (e.g., validation failed, duplicate title, invalid IDs, file upload error)
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Validation failed" }
 * errors:
 * type: array
 * items:
 * type: object
 * properties:
 * path: { type: string }
 * message: { type: string }
 * 404:
 * description: Referenced Main Category, Category, Section, or Topic not found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Main Category not found." }
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Server Error" }
 */
/**
 * @swagger
 * /classes:
 * get:
 * summary: Get all classes
 * tags: [Classes]
 * responses:
 * 200:
 * description: A list of classes
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Class' # Reference the Class schema for items
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Server Error" }
 */
router.route('/')
    .post(upload.single('image'), classController_1.createClass)
    .get(classController_1.getClasses);
/**
 * @swagger
 * /classes/filter:
 * post:
 * summary: Get classes filtered by Main Category and/or Category
 * tags: [Classes]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * mainCategoryId:
 * type: string
 * description: Optional ID of the Main Category to filter by.
 * example: "60c72b1f9b1e8e001c8f4b0d"
 * categoryId:
 * type: string
 * description: Optional ID of the Category to filter by.
 * example: "60c72b1f9b1e8e001c8f4b0e"
 * responses:
 * 200:
 * description: A list of filtered classes.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Class' # Reference the Class schema for items
 * 400:
 * description: Invalid ID format.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Invalid mainCategory ID format." }
 * 500:
 * description: Server error.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Server Error" }
 */
router.post('/filter', classController_1.getFilteredClasses);
/**
 * @swagger
 * /classes/live
 *   get:
 *     summary: Get live classes by course ID
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course to get live classes for
 *         example: 60c72b1f9b1e8e001c8f4b0b
 *     responses:
 *       200:
 *         description: Live classes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: number
 *                   example: 200
 *                 msg:
 *                   type: string
 *                   example: "Live classes retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     courseId:
 *                       type: string
 *                       example: "60c72b1f9b1e8e001c8f4b0b"
 *                     courseTitle:
 *                       type: string
 *                       example: "React Fundamentals"
 *                     liveClasses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Class'
 *                     totalLiveClasses:
 *                       type: number
 *                       example: 3
 *                     currentTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Invalid Course ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: number
 *                   example: 400
 *                 msg:
 *                   type: string
 *                   example: "Invalid Course ID format."
 *       404:
 *         description: Course not found or no live classes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: number
 *                   example: 404
 *                 msg:
 *                   type: string
 *                   example: "Course not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: number
 *                   example: 500
 *                 msg:
 *                   type: string
 *                   example: "Server Error"
 */
router.get('/live', classController_1.getLiveClassByCourseId);
/**
 * @swagger
 * /classes/{id}:
 * get:
 * summary: Get a class by ID
 * tags: [Classes]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The ID of the class to retrieve
 * example: 60c72b1f9b1e8e001c8f4b11
 * responses:
 * 200:
 * description: Class found
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Class' # Reference the Class schema
 * 400:
 * description: Invalid Class ID format
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Invalid Class ID format." }
 * 404:
 * description: Class not found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Class not found" }
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Server Error" }
 */
/**
 * @swagger
 * /classes/{id}:
 * put:
 * summary: Update a class by ID
 * tags: [Classes]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The ID of the class to update
 * example: 60c72b1f9b1e8e001c8f4b11
 * requestBody:
 * required: true
 * content:
 * multipart/form-data: # Changed to multipart/form-data
 * schema:
 * type: object
 * properties:
 * link:
 * type: string
 * format: uri
 * description: URL link for the class (e.g., video conference link). Optional.
 * example: "https://zoom.us/j/123456789"
 * status:
 * type: string
 * description: Current status of the class. Optional.
 * enum: [active, inactive, draft]
 * example: "inactive"
 * isChat:
 * type: string # Send as "true" or "false" string
 * description: Indicates if chat is enabled for the class (send as "true" or "false" string). Optional.
 * example: "false"
 * isFree:
 * type: string # Send as "true" or "false" string
 * description: Indicates if the class is free or paid (send as "true" or "false" string). Optional.
 * example: "true"
 * teacherName:
 * type: string
 * description: Name of the teacher conducting the class. Optional.
 * example: "Dr. Jane Doe"
 * priority:
 * type: string # Send as numeric string
 * description: Priority order for displaying classes (lower number = higher priority). Optional.
 * example: "5"
 * isLive:
 * type: string # Send as "true" or "false" string
 * description: Indicates if the class is currently live (send as "true" or "false" string). Optional.
 * example: "false"
 * image:
 * type: string
 * format: binary # For file upload or clearing
 * description: The class thumbnail or banner image file. Send new file to upload. Send an empty string or 'null' as a field value to clear the existing image. Optional.
 * title:
 * type: string
 * description: Title of the class (must be unique). Optional.
 * example: "Introduction to AI Ethics (Revised)"
 * description:
 * type: string
 * description: Detailed description of the class. Optional.
 * example: "An updated comprehensive lecture on advanced quantum physics concepts."
 * mainCategory:
 * type: string
 * description: The ID of the main category this class belongs to. Optional.
 * example: "60c72b1f9b1e8e001c8f4b0d"
 * category:
 * type: string
 * description: The ID of the sub-category this class belongs to. Optional.
 * example: "60c72b1f9b1e8e001c8f4b0e"
 * section:
 * type: string
 * description: The ID of the section this class belongs to. Optional.
 * example: "60c72b1f9b1e8e001c8f4b0f"
 * topic:
 * type: string
 * description: The ID of the topic this class belongs to. Optional.
 * example: "60c72b1f9b1e8e001c8f4b10"
 * responses:
 * 200:
 * description: Class updated successfully
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Class'
 * 400:
 * description: Bad request (e.g., validation failed, duplicate title, invalid IDs, file upload error)
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Validation failed" }
 * errors:
 * type: array
 * items:
 * type: object
 * properties:
 * path: { type: string }
 * message: { type: string }
 * 404:
 * description: Class or referenced resource not found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Class not found" }
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Server Error" }
 */
/**
 * @swagger
 * /classes/{id}:
 * delete:
 * summary: Delete a class by ID
 * tags: [Classes]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The ID of the class to delete
 * example: 60c72b1f9b1e8e001c8f4b11
 * responses:
 * 200:
 * description: Class removed successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Class removed successfully" }
 * 400:
 * description: Invalid Class ID format
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Invalid Class ID format." }
 * 404:
 * description: Class not found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Class not found" }
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Server Error" }
 */
/**
 * @swagger
 * /classes/flags:
 * get:
 * summary: Get classes filtered by boolean flags
 * tags: [Classes] * parameters:
 * - in: query
 * name: isShort
 * schema:
 * type: boolean
 * description: Filter classes that are marked as short
 * example: true
 * - in: query
 * name: isTopper
 * schema:
 * type: boolean
 * description: Filter classes that are marked as topper
 * example: true
 * - in: query
 * name: category
 * schema:
 * type: string
 * description: Filter classes by category ID (ObjectId format)
 * example: "683def9c2f4523ef6c8b188f"
 * responses:
 * 200:
 * description: Classes filtered by flags retrieved successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state:
 * type: number
 * example: 200
 * msg:
 * type: string
 * example: "Classes retrieved successfully"
 * data:
 * type: array
 * items:
 * $ref: '#/components/schemas/Class'
 * 400:
 * description: Invalid query parameters
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state:
 * type: number
 * example: 400
 * msg:
 * type: string
 * example: "Invalid query parameters"
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state:
 * type: number
 * example: 500
 * msg:
 * type: string
 * example: "Server Error"
 */
router.get('/flags', classController_1.getClassesByFlags);
router.route('/:id')
    .get(classController_1.getClassById)
    .put(upload.single('image'), classController_1.updateClass)
    .delete(classController_1.deleteClass);
/**
 * @swagger
 * /classes/{id}/toggle-status:
 * patch:
 * summary: Toggle the status of a class between 'active' and 'inactive' (or 'draft' to 'active').
 * tags: [Classes]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The ID of the class to toggle its status.
 * example: 60c72b1f9b1e8e001c8f4b11
 * responses:
 * 200:
 * description: Class status toggled successfully.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Class status toggled successfully" }
 * _id:
 * type: string
 * example: 60c72b1f9b1e8e001c8f4b11
 * newStatus:
 * type: string
 * enum: [active, inactive, draft]
 * example: "inactive"
 * updatedAt:
 * type: string
 * format: date-time
 * example: "2024-01-01T12:00:00.000Z"
 * 400:
 * description: Invalid Class ID format.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Invalid Class ID format." }
 * 404:
 * description: Class not found.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Class not found." }
 * 500:
 * description: Server error.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Server Error" }
 */
router.patch('/:id/toggle-status', classController_1.toggleClassStatus);
/**
 * @swagger
 * /api/classes/{classId}/recordings:
 *   get:
 *     summary: Get mp4 recordings for a specific class
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         description: The class ID to get recordings for
 *         schema:
 *           type: string
 *           example: "60c72b1f9b1e8e001c8f4b11"
 *     responses:
 *       200:
 *         description: Recordings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state: { type: number, example: 200 }
 *                 message: { type: string, example: "Recordings retrieved successfully" }
 *                 recordings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       quality: { type: string, example: "720p" }
 *                       link: { type: string, example: "https://s3.amazonaws.com/..." }
 *                       size: { type: number, example: 25 }
 *                 classTitle: { type: string, example: "Introduction to AI" }
 *                 totalRecordings: { type: number, example: 3 }
 *       404:
 *         description: Class not found or no recordings available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state: { type: number, example: 404 }
 *                 message: { type: string, example: "Recordings will be available soon" }
 *                 classId: { type: string }
 *                 classTitle: { type: string }
 *       400:
 *         description: Invalid class ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state: { type: number, example: 400 }
 *                 message: { type: string, example: "Invalid class ID format." }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state: { type: number, example: 500 }
 *                 message: { type: string, example: "Internal server error while fetching recordings." }
 */
router.get('/:classId/recordings', classController_1.getClassRecordings);
exports.default = router;
