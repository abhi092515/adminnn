import express from 'express';
import {
    assignClassToCourse,
    getClassesForCourse,
    getCoursesForClass,
    getAvailableClassesForCourse,
    updateClassPriority,
    reorderClasses,
    removeClassFromCourse,
    toggleClassAssignment
} from '../controllers/courseClassController';

const router = express.Router();

// Course-Class Assignment Routes

// @route   POST /api/courses/:courseId/classes
// @desc    Assign a class to a course
// @access  Public
router.post('/courses/:courseId/classes', assignClassToCourse);

// @route   GET /api/courses/:courseId/classes
// @desc    Get all classes for a specific course
// @access  Public
router.get('/courses/:courseId/classes', getClassesForCourse);

// @route   GET /api/courses/:courseId/available-classes
// @desc    Get all available classes that can be assigned to a course (excludes already assigned)
// @access  Public
router.get('/courses/:courseId/available-classes', getAvailableClassesForCourse);

// @route   GET /api/classes/:classId/courses
// @desc    Get all courses that contain a specific class
// @access  Public
router.get('/classes/:classId/courses', getCoursesForClass);

// @route   PUT /api/courses/:courseId/classes/:classId/priority
// @desc    Update priority of a class within a course
// @access  Public
router.put('/courses/:courseId/classes/:classId/priority', updateClassPriority);

// @route   PUT /api/courses/:courseId/classes/reorder
// @desc    Reorder multiple classes within a course
// @access  Public
router.put('/courses/:courseId/classes/reorder', reorderClasses);

// @route   DELETE /api/courses/:courseId/classes/:classId
// @desc    Remove a class from a course
// @access  Public
router.delete('/courses/:courseId/classes/:classId', removeClassFromCourse);

// @route   PATCH /api/courses/:courseId/classes/:classId/toggle
// @desc    Toggle active/inactive status of a class assignment
// @access  Public
router.patch('/courses/:courseId/classes/:classId/toggle', toggleClassAssignment);

export default router;
