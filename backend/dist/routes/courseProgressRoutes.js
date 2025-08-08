"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseProgressController_1 = require("../controllers/courseProgressController");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/course-progress/:
 *   post:
 *     summary: Get course progress with accuracy data
 *     tags: [Course Progress]
 *     description: Calculate course progress percentage based on time watched and include accuracy data from test results
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - userId
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: ID of the course
 *                 example: 60c72b1f9b1e8e001c8f4b14
 *               userId:
 *                 type: string
 *                 description: ID of the user
 *                 example: 60c72b1f9b1e8e001c8f4b13
 *     responses:
 *       200:
 *         description: Course progress and accuracy retrieved successfully
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
 *                   example: Course progress retrieved successfully
 *                 data:
 *                   type: object
 *                   properties: *                     accuracy:
 *                       type: number
 *                       description: Average accuracy percentage from all test attempts
 *                       example: 85.75
 *                     progressPercentage:
 *                       type: number
 *                       description: Course progress percentage based on completed classes
 *                       example: 40.0
 *                     batch_rank:
 *                       type: number
 *                       description: Maximum rank score achieved by user for this course
 *                       example: 78.25
 *                     level:
 *                       type: string
 *                       description: User's current level based on level score
 *                       enum: [Beginner, Medium, Advanced, Pro]
 *                       example: Advanced
 *       400:
 *         description: Bad request (missing or invalid parameters)
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
// --- Public Routes ---
router.post('/', courseProgressController_1.getCourseProgress);
exports.default = router;
