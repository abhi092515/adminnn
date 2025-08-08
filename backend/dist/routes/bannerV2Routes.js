"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBannerSchema = exports.createBannerSchema = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const zod_1 = require("zod");
const bannerV2Controller_1 = require("../controllers/bannerV2Controller");
const router = express_1.default.Router();
// --- ZOD VALIDATION SCHEMAS ---
exports.createBannerSchema = zod_1.z.object({
    redirectUrl: zod_1.z.string().url("A valid redirect URL is required."),
    priority: zod_1.z.coerce.number().int().optional(),
    isActive: zod_1.z.preprocess((val) => val === 'true' || val === true, zod_1.z.boolean()).optional(),
});
exports.updateBannerSchema = exports.createBannerSchema.partial();
// --- MULTER CONFIGURATION FOR FILE UPLOADS ---
// Use in-memory storage to pass file buffers directly to S3
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
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
    .post(bannerUploads, bannerV2Controller_1.createBanner)
    .get(bannerV2Controller_1.getAllBanners);
router.route('/:id')
    .get(bannerV2Controller_1.getBannerById)
    .put(bannerUploads, bannerV2Controller_1.updateBanner)
    .delete(bannerV2Controller_1.deleteBanner);
exports.default = router;
