import express from 'express';
import {
  createRankScore,
  getMaxRankScore,
  getRankScores,
  getUserRankScores,
  getCourseLeaderboard
} from '../controllers/rankScoreController';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RankScore:
 *       type: object
 *       required:
 *         - userId
 *         - courseId
 *         - rank_score
 *         - level_score
 *         - level
 *       properties:
 *         userId:
 *           type: string
 *           description: The user's ID
 *         courseId:
 *           type: string
 *           description: The course's ID
 *         rank_score:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: The calculated rank score
 *         level_score:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: The calculated level score
 *         level:
 *           type: string
 *           enum: [Beginner, Medium, Advanced, Pro]
 *           description: The user's level
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/rank-scores:
 *   post:
 *     summary: Create a new rank score record
 *     tags: [RankScore]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - courseId
 *               - rank_score
 *               - level_score
 *               - level
 *             properties:
 *               userId:
 *                 type: string
 *               courseId:
 *                 type: string
 *               rank_score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               level_score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               level:
 *                 type: string
 *                 enum: [Beginner, Medium, Advanced, Pro]
 *     responses:
 *       201:
 *         description: Rank score created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', createRankScore);

/**
 * @swagger
 * /api/rank-scores/max:
 *   post:
 *     summary: Get the maximum rank score for a user-course combination
 *     tags: [RankScore]
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
 *               courseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Max rank score retrieved successfully
 *       404:
 *         description: No rank scores found
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/max', getMaxRankScore);

/**
 * @swagger
 * /api/rank-scores:
 *   get:
 *     summary: Get all rank scores with optional filtering
 *     tags: [RankScore]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [Beginner, Medium, Advanced, Pro]
 *         description: Filter by level
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Rank scores retrieved successfully
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Server error
 */
router.get('/', getRankScores);

/**
 * @swagger
 * /api/rank-scores/user/{userId}:
 *   get:
 *     summary: Get rank scores for a specific user across all courses
 *     tags: [RankScore]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's ID
 *     responses:
 *       200:
 *         description: User rank scores retrieved successfully
 *       400:
 *         description: User ID is required
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', getUserRankScores);

/**
 * @swagger
 * /api/rank-scores/leaderboard/{courseId}:
 *   get:
 *     summary: Get leaderboard for a specific course
 *     tags: [RankScore]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The course's ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top users to return
 *     responses:
 *       200:
 *         description: Course leaderboard retrieved successfully
 *       400:
 *         description: Course ID is required
 *       500:
 *         description: Server error
 */
router.get('/leaderboard/:courseId', getCourseLeaderboard);

export default router;
