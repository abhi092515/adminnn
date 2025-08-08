import { Router } from 'express';
import {
  getBanners,
  getActiveBanners,
  createBanner,
  getBannerById,
  updateBanner,
  deleteBanner,
  toggleBannerStatus
} from '../controllers/bannerController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Banner:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the banner
 *           example: "60c72b1f9b1e8e001c8f4b11"
 *         title:
 *           type: string
 *           description: Banner title
 *           example: "Special Offer"
 *         description:
 *           type: string
 *           description: Banner description
 *           example: "Get 50% off on all courses"
 *         imageUrl:
 *           type: string
 *           description: Banner image URL
 *           example: "https://example.com/banner.jpg"
 *         classId:
 *           type: string
 *           description: Optional reference to a class
 *           example: "60c72b1f9b1e8e001c8f4b12"
 *         isActive:
 *           type: boolean
 *           description: Whether the banner is active
 *           example: true
 *         priority:
 *           type: number
 *           description: Display priority (lower numbers show first)
 *           example: 1
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: When the banner should start showing
 *           example: "2023-07-15T00:00:00.000Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: When the banner should stop showing
 *           example: "2023-07-30T23:59:59.000Z"
 *         createdBy:
 *           type: string
 *           description: ID of user who created the banner
 *           example: "60c72b1f9b1e8e001c8f4b13"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Banner creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Banner last update timestamp
 */

/**
 * @swagger
 * /api/banners:
 *   get:
 *     summary: Get all banners with optional filtering
 *     tags: [Banners]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
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
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Banners retrieved successfully
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
 *                   example: Banners retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     banners:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Banner'
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
 */
router.get('/', getBanners);

/**
 * @swagger
 * /api/banners:
 *   post:
 *     summary: Create a new banner
 *     tags: [Banners]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - imageUrl
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Special Offer"
 *               description:
 *                 type: string
 *                 example: "Get 50% off on all courses"
 *               imageUrl:
 *                 type: string
 *                 example: "https://example.com/banner.jpg"
 *               classId:
 *                 type: string
 *                 example: "60c72b1f9b1e8e001c8f4b12"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               priority:
 *                 type: number
 *                 example: 1
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               createdBy:
 *                 type: string
 *                 example: "60c72b1f9b1e8e001c8f4b13"
 *     responses:
 *       201:
 *         description: Banner created successfully
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
 *                   example: Banner created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Banner'
 */
router.post('/', createBanner);

/**
 * @swagger
 * /api/banners/active:
 *   get:
 *     summary: Get all active banners for homepage
 *     tags: [Banners]
 *     responses:
 *       200:
 *         description: Active banners retrieved successfully
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
 *                   example: Active banners retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Banner'
 */
router.get('/active', getActiveBanners);

/**
 * @swagger
 * /api/banners/{id}:
 *   get:
 *     summary: Get banner by ID
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     responses:
 *       200:
 *         description: Banner retrieved successfully
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
 *                   example: Banner retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Banner'
 *       404:
 *         description: Banner not found
 */
router.get('/:id', getBannerById);

/**
 * @swagger
 * /api/banners/{id}:
 *   put:
 *     summary: Update banner by ID
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               classId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               priority:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Banner updated successfully
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
 *                   example: Banner updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Banner'
 *       404:
 *         description: Banner not found
 */
router.put('/:id', updateBanner);

/**
 * @swagger
 * /api/banners/{id}:
 *   delete:
 *     summary: Delete banner by ID
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     responses:
 *       200:
 *         description: Banner deleted successfully
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
 *                   example: Banner deleted successfully
 *                 data:
 *                   type: null
 *       404:
 *         description: Banner not found
 */
router.delete('/:id', deleteBanner);

/**
 * @swagger
 * /api/banners/{id}/toggle:
 *   patch:
 *     summary: Toggle banner active status
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     responses:
 *       200:
 *         description: Banner status toggled successfully
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
 *                   example: Banner activated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Banner'
 *       404:
 *         description: Banner not found
 */
router.patch('/:id/toggle', toggleBannerStatus);

export default router;
