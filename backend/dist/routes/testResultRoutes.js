"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/testResultRoutes.ts
const express_1 = require("express");
const testResultController_1 = require("../controllers/testResultController");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   - name: Test Results
 *     description: API for managing user test results
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     TestResult:
 *       type: object
 *       required:
 *         - seriesId
 *         - userId
 *         - courseId
 *         - accuracy
 *         - timeSpent
 *         - totalTime
 *         - questionsAttempted
 *         - totalQuestions
 *         - score
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the test result
 *           example: 60c72b1f9b1e8e001c8f4b15
 *         seriesId:
 *           type: string
 *           description: ID of the test series
 *           example: 60c72b1f9b1e8e001c8f4b12
 *         userId:
 *           type: string
 *           description: ID of the user who took the test
 *           example: 60c72b1f9b1e8e001c8f4b13
 *         courseId:
 *           type: string
 *           description: ID of the course the test belongs to
 *           example: 60c72b1f9b1e8e001c8f4b14
 *         accuracy:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Test accuracy percentage
 *           example: 85.5
 *         timeSpent:
 *           type: number
 *           minimum: 0
 *           description: Time spent on test in seconds
 *           example: 1800
 *         totalTime:
 *           type: number
 *           minimum: 0
 *           description: Total allocated time for test in seconds
 *           example: 3600
 *         questionsAttempted:
 *           type: integer
 *           minimum: 0
 *           description: Number of questions attempted
 *           example: 45
 *         totalQuestions:
 *           type: integer
 *           minimum: 0
 *           description: Total number of questions in the test
 *           example: 50
 *         score:
 *           type: number
 *           minimum: 0
 *           description: Test score
 *           example: 425
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the test result was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the test result was last updated
 */
/**
 * @swagger
 * /api/test-results:
 *   post:
 *     summary: Create or update a test result
 *     tags: [Test Results]
 *     description: Creates a new test result or updates existing one for the same seriesId, userId, and courseId combination
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - seriesId
 *               - userId
 *               - courseId
 *               - accuracy
 *               - timeSpent
 *               - totalTime
 *               - questionsAttempted
 *               - totalQuestions
 *               - score
 *             properties:
 *               seriesId:
 *                 type: string
 *                 example: 60c72b1f9b1e8e001c8f4b12
 *               userId:
 *                 type: string
 *                 example: 60c72b1f9b1e8e001c8f4b13
 *               courseId:
 *                 type: string
 *                 example: 60c72b1f9b1e8e001c8f4b14
 *               accuracy:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 85.5
 *               timeSpent:
 *                 type: number
 *                 minimum: 0
 *                 example: 1800
 *               totalTime:
 *                 type: number
 *                 minimum: 0
 *                 example: 3600
 *               questionsAttempted:
 *                 type: integer
 *                 minimum: 0
 *                 example: 45
 *               totalQuestions:
 *                 type: integer
 *                 minimum: 0
 *                 example: 50
 *               score:
 *                 type: number
 *                 minimum: 0
 *                 example: 425
 *     responses:
 *       201:
 *         description: Test result created/updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Test result saved successfully
 *                 data:
 *                   $ref: '#/components/schemas/TestResult'
 *       400:
 *         description: Bad request (validation failed)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: string
 *                       message:
 *                         type: string
 *                 data:
 *                   type: null
 *       404:
 *         description: Referenced user or course not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/test-results:
 *   get:
 *     summary: Get all test results with optional filtering
 *     tags: [Test Results]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *         example: 60c72b1f9b1e8e001c8f4b13
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *         example: 60c72b1f9b1e8e001c8f4b14
 *       - in: query
 *         name: seriesId
 *         schema:
 *           type: string
 *         description: Filter by series ID
 *         example: 60c72b1f9b1e8e001c8f4b12
 *       - in: query
 *         name: minAccuracy
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         description: Minimum accuracy filter
 *         example: 70
 *       - in: query
 *         name: maxAccuracy
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         description: Maximum accuracy filter
 *         example: 90
 *       - in: query
 *         name: minScore
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum score filter
 *         example: 300
 *       - in: query
 *         name: maxScore
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum score filter
 *         example: 500
 *     responses:
 *       200:
 *         description: Test results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Test results retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TestResult'
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/test-results/{id}:
 *   get:
 *     summary: Get a test result by ID
 *     tags: [Test Results]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the test result to retrieve
 *         example: 60c72b1f9b1e8e001c8f4b15
 *     responses:
 *       200:
 *         description: Test result retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Test result retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/TestResult'
 *       400:
 *         description: Invalid test result ID format
 *       404:
 *         description: Test result not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/test-results/{id}:
 *   delete:
 *     summary: Delete a test result by ID
 *     tags: [Test Results]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the test result to delete
 *         example: 60c72b1f9b1e8e001c8f4b15
 *     responses:
 *       200:
 *         description: Test result deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Test result deleted successfully
 *                 data:
 *                   $ref: '#/components/schemas/TestResult'
 *       400:
 *         description: Invalid test result ID format
 *       404:
 *         description: Test result not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/test-results/user/{userId}:
 *   get:
 *     summary: Get all test results for a specific user
 *     tags: [Test Results]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *         example: 60c72b1f9b1e8e001c8f4b13
 *     responses:
 *       200:
 *         description: User test results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: User test results retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TestResult'
 *       400:
 *         description: Invalid user ID format
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/test-results/course/{courseId}:
 *   get:
 *     summary: Get all test results for a specific course
 *     tags: [Test Results]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *         example: 60c72b1f9b1e8e001c8f4b14
 *     responses:
 *       200:
 *         description: Course test results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Course test results retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TestResult'
 *       400:
 *         description: Invalid course ID format
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/test-results/user/{userId}/course/{courseId}:
 *   get:
 *     summary: Get all test results for a specific user and course combination
 *     tags: [Test Results]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *         example: 60c72b1f9b1e8e001c8f4b13
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *         example: 60c72b1f9b1e8e001c8f4b14
 *     responses:
 *       200:
 *         description: Test results for user and course retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Test results retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TestResult'
 *       400:
 *         description: Invalid user ID or course ID format
 *       404:
 *         description: User or course not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/test-results/search:
 *   post:
 *     summary: Get test results by user and course
 *     tags: [Test Results]
 *     description: Retrieve all test results for a specific user and course combination
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - courseId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user
 *                 example: 60c72b1f9b1e8e001c8f4b13
 *               courseId:
 *                 type: string
 *                 description: ID of the course
 *                 example: 60c72b1f9b1e8e001c8f4b14
 *     responses:
 *       200:
 *         description: Test results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Test results retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TestResult'
 *       400:
 *         description: Bad request (validation failed)
 *       404:
 *         description: User or course not found
 *       500:
 *         description: Server error
 */
// Routes
router.route('/')
    .post(testResultController_1.createOrUpdateTestResult);
router.route('/search')
    .post(testResultController_1.getTestResultsByUserAndCourse);
router.route('/analysis')
    .post(testResultController_1.getUserAllTestAnalysis);
router.route('/:id')
    .delete(testResultController_1.deleteTestResult);
exports.default = router;
