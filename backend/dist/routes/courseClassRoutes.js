"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseClassController_1 = require("../controllers/courseClassController");
const router = express_1.default.Router();
// Course-Class Assignment Routes
// @route   POST /api/courses/:courseId/classes
// @desc    Assign a class to a course
// @access  Public
router.post('/courses/:courseId/classes', courseClassController_1.assignClassToCourse);
// @route   GET /api/courses/:courseId/classes
// @desc    Get all classes for a specific course
// @access  Public
router.get('/courses/:courseId/classes', courseClassController_1.getClassesForCourse);
// @route   GET /api/courses/:courseId/available-classes
// @desc    Get all available classes that can be assigned to a course (excludes already assigned)
// @access  Public
router.get('/courses/:courseId/available-classes', courseClassController_1.getAvailableClassesForCourse);
// @route   GET /api/classes/:classId/courses
// @desc    Get all courses that contain a specific class
// @access  Public
router.get('/classes/:classId/courses', courseClassController_1.getCoursesForClass);
// @route   PUT /api/courses/:courseId/classes/:classId/priority
// @desc    Update priority of a class within a course
// @access  Public
router.put('/courses/:courseId/classes/:classId/priority', courseClassController_1.updateClassPriority);
// @route   PUT /api/courses/:courseId/classes/reorder
// @desc    Reorder multiple classes within a course
// @access  Public
router.put('/courses/:courseId/classes/reorder', courseClassController_1.reorderClasses);
// @route   DELETE /api/courses/:courseId/classes/:classId
// @desc    Remove a class from a course
// @access  Public
router.delete('/courses/:courseId/classes/:classId', courseClassController_1.removeClassFromCourse);
// @route   PATCH /api/courses/:courseId/classes/:classId/toggle
// @desc    Toggle active/inactive status of a class assignment
// @access  Public
router.patch('/courses/:courseId/classes/:classId/toggle', courseClassController_1.toggleClassAssignment);
exports.default = router;
