"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/viewRoutes.ts
const express_1 = require("express");
const viewController_1 = require("../controllers/viewController");
const router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     View:
 *       type: object
 *       required:
 *         - classId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the view
 *           example: "60c72b1f9b1e8e001c8f4b11"
 *         classId:
 *           type: string
 *           description: The ID of the class being viewed
 *           example: "60c72b1f9b1e8e001c8f4b12"
 *         userId:
 *           type: string
 *           description: The ID of the user viewing the class (optional for anonymous views)
 *           example: "60c72b1f9b1e8e001c8f4b13" *         sessionId:
 *           type: string
 *           description: Session ID for anonymous users
 *           example: "sess_abc123def456"
 *         viewedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the view occurred
 *           example: "2023-07-15T14:30:00.000Z"
 *         completed:
 *           type: boolean
 *           description: Whether the user completed viewing the class
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Record creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Record last update timestamp
 */
/**
 * @swagger
 * /api/views/track-class-view:
 *   post:
 *     summary: Track a class view
 *     tags: [Views]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *             properties:
 *               classId:
 *                 type: string
 *                 description: The ID of the class being viewed
 *                 example: "60c72b1f9b1e8e001c8f4b12"
 *               userId:
 *                 type: string
 *                 description: The ID of the user (optional for anonymous views)
 *                 example: "60c72b1f9b1e8e001c8f4b13"
 *               sessionId:
 *                 type: string
 *                 description: Session ID for anonymous users *                 example: "sess_abc123def456"
 *               completed:
 *                 type: boolean
 *                 description: Whether the user completed viewing the class
 *                 example: true
 *     responses:
 *       201:
 *         description: View tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: number
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "View tracked successfully"
 *                 data:
 *                   $ref: '#/components/schemas/View'
 *       200:
 *         description: View updated successfully
 *       400:
 *         description: Bad request - missing or invalid classId
 *       404:
 *         description: Class not found
 *       500:
 *         description: Server error
 */
router.post('/track-class-view', viewController_1.trackClassView);
/**
 * @swagger
 * /api/views/class/{classId}:
 *   get:
 *     summary: Get views for a specific class
 *     tags: [Views]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: The class ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of views per page
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter views from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter views until this date
 *       - in: query
 *         name: includeAnonymous
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: true
 *         description: Include anonymous views
 *     responses:
 *       200:
 *         description: Class views retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Class views retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     views:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/View'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         totalCount:
 *                           type: number
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 *       404:
 *         description: Class not found
 *       500:
 *         description: Server error
 */
router.get('/class/:classId', viewController_1.getClassViews);
/**
 * @swagger
 * /api/views/analytics/{classId}:
 *   get:
 *     summary: Get view analytics for a specific class
 *     tags: [Views]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: The class ID
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [24h, 7d, 30d, 90d]
 *           default: 7d
 *         description: Time range for analytics
 *     responses:
 *       200:
 *         description: Class analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Class analytics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalViews:
 *                       type: number
 *                       example: 150
 *                     uniqueViewers:
 *                       type: number
 *                       example: 75
 *                     averageDuration:
 *                       type: number
 *                       example: 285.5
 *                     completedViews:
 *                       type: number
 *                       example: 45
 *                     completionRate:
 *                       type: number
 *                       example: 30.0
 *                     dailyBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           views:
 *                             type: number
 *                           uniqueUsers:
 *                             type: number
 *                     timeRange:
 *                       type: string
 *                       example: "7d"
 *                     period:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *       404:
 *         description: Class not found
 *       500:
 *         description: Server error
 */
router.get('/analytics/:classId', viewController_1.getClassViewAnalytics);
/**
 * @swagger
 * /api/views/user/{userId}/history:
 *   get:
 *     summary: Get user's view history
 *     tags: [Views]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of views per page
 *     responses:
 *       200:
 *         description: User view history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "User view history retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     views:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/View'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         totalCount:
 *                           type: number
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 *       500:
 *         description: Server error
 */
router.get('/user/:userId/history', viewController_1.getUserViewHistory);
exports.default = router;
