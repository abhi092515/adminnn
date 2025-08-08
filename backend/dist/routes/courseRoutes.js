"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/courseRoutes.ts
const express_1 = __importDefault(require("express"));
const courseController_1 = require("../controllers/courseController");
const multerConfig_1 = __importDefault(require("../config/multerConfig")); // Import Multer config
const router = express_1.default.Router();
const uploadBanner = (0, multerConfig_1.default)('courses/banners').single('image'); // Middleware for banner image
// --- Public Routes ---
router.get('/', courseController_1.getCourses);
router.get('/active', courseController_1.getCourseData);
router.get('/search', courseController_1.searchCourses);
router.post('/filter', courseController_1.postFilteredCourses);
router.get('/:id', courseController_1.getCourseById);
// Removed conflicting route - now handled by courseClassRoutes.ts with proper CourseClass junction table
// router.get('/:courseId/classes', getClassesByCourse);
router.post('/user', courseController_1.getCourseWithUserProgress);
// --- Admin/Protected Routes (assuming middleware for authentication/authorization will be added here) ---
// POST to create a new course, handles 'bannerImage' file upload
router.post('/', uploadBanner, courseController_1.createCourse);
// PUT to update an existing course by ID, handles 'bannerImage' file upload
router.put('/:id', uploadBanner, courseController_1.updateCourse);
router.put('/test-upload/:id', uploadBanner, (req, res) => {
    console.log('--- ✅ /test-upload ROUTE WAS HIT ---');
    console.log('Test Route req.file:', req.file);
    console.log('Test Route req.body:', req.body);
    if (req.file) {
        res.status(200).json({ success: true, message: "Test successful, file received.", file: req.file });
    }
    else {
        res.status(400).json({ success: false, message: "Test failed, NO file was received." });
    }
});
router.delete('/:id', courseController_1.deleteCourse);
router.put('/:id/status', courseController_1.updateCourseStatus);
router.post('/by-id-2', courseController_1.getCourseById2); // Keep if explicitly needed
router.post('/assign-classes', courseController_1.assignClassesToCourses);
// Route for unassigning classes
router.post('/unassign-classes', courseController_1.unassignClassesFromCourses);
exports.default = router;
