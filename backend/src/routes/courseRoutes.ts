// src/routes/courseRoutes.ts
import express from 'express';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCourseData,
  updateCourseStatus,
  getCourseById2,
  searchCourses,
  // getClassesByCourse, // Commented out - now handled by courseClassController
  getCourseWithUserProgress,
  assignClassesToCourses,
  unassignClassesFromCourses,
  postFilteredCourses,
} from '../controllers/courseController';
import configureMulter from '../config/multerConfig'; // Import Multer config

const router = express.Router();
const uploadBanner = configureMulter('courses/banners').single('image'); // Middleware for banner image

// --- Public Routes ---
router.get('/', getCourses);
router.get('/active', getCourseData);
router.get('/search', searchCourses);
router.post('/filter', postFilteredCourses);
router.get('/:id', getCourseById);
// Removed conflicting route - now handled by courseClassRoutes.ts with proper CourseClass junction table
// router.get('/:courseId/classes', getClassesByCourse);
router.post('/user', getCourseWithUserProgress);

// --- Admin/Protected Routes (assuming middleware for authentication/authorization will be added here) ---

// POST to create a new course, handles 'bannerImage' file upload
router.post('/', uploadBanner, createCourse);

// PUT to update an existing course by ID, handles 'bannerImage' file upload
router.put('/:id', uploadBanner, updateCourse);
router.put('/test-upload/:id', uploadBanner, (req, res) => {
  console.log('--- ✅ /test-upload ROUTE WAS HIT ---');
  console.log('Test Route req.file:', req.file);
  console.log('Test Route req.body:', req.body);
  
  if (req.file) {
    res.status(200).json({ success: true, message: "Test successful, file received.", file: req.file });
  } else {
    res.status(400).json({ success: false, message: "Test failed, NO file was received." });
  }
});


router.delete('/:id', deleteCourse);
router.put('/:id/status', updateCourseStatus);
router.post('/by-id-2', getCourseById2); // Keep if explicitly needed
router.post('/assign-classes', assignClassesToCourses);

// Route for unassigning classes
router.post('/unassign-classes', unassignClassesFromCourses);

export default router;