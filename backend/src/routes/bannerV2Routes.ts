import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner
} from '../controllers/bannerV2Controller';

const router = express.Router();

// --- ZOD VALIDATION SCHEMAS ---
export const createBannerSchema = z.object({
  redirectUrl: z.string().url("A valid redirect URL is required."),
  priority: z.coerce.number().int().optional(),
  isActive: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
});

export const updateBannerSchema = createBannerSchema.partial();

// --- MULTER CONFIGURATION FOR FILE UPLOADS ---
// Use in-memory storage to pass file buffers directly to S3
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to handle website and mobile banner uploads
const bannerUploads = upload.fields([
  { name: 'websiteBanner', maxCount: 1 },
  { name: 'mobileBanner', maxCount: 1 },
]);

// router.use((req, res, next) => {
//   console.log(`[BANNER V2 ROUTER LOG] Router active for path: ${req.path}`);
//   next();
// });


// --- BANNER API ROUTES ---
router.route('/')
  .post(bannerUploads, createBanner)
  .get(getAllBanners);

router.route('/:id')
  .get(getBannerById)
  .put(bannerUploads, updateBanner)
  .delete(deleteBanner);

export default router;