"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCouponSchema = exports.createCouponSchema = void 0;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const couponController_1 = require("../controllers/couponController");
const router = express_1.default.Router();
// --- ZOD VALIDATION SCHEMAS ---
// 1. Define the base object schema without any refinements
const baseCouponSchema = zod_1.z.object({
    code: zod_1.z.string().min(3, "Code must be at least 3 characters").transform(val => val.toUpperCase()),
    type: zod_1.z.enum(['percentage', 'fixed']),
    discountValue: zod_1.z.coerce.number().positive("Discount value must be a positive number."),
    usageLimitPerUser: zod_1.z.coerce.number().int().positive().default(1),
    startDate: zod_1.z.coerce.date(),
    expireDate: zod_1.z.coerce.date(),
    applicableOn: zod_1.z.array(zod_1.z.string()).optional(),
    isActive: zod_1.z.boolean().optional().default(true),
});
// 2. Create the schema for 'create' by applying the refinement to the base
exports.createCouponSchema = baseCouponSchema.refine(data => data.expireDate >= data.startDate, {
    message: "Expire date must be on or after the start date",
    path: ["expireDate"],
});
// 3. Create the schema for 'update' by calling .partial() FIRST, then applying the refinement
exports.updateCouponSchema = baseCouponSchema.partial().refine(data => {
    // Only validate if both dates are provided in the update payload
    if (data.startDate && data.expireDate) {
        return data.expireDate >= data.startDate;
    }
    return true; // Pass validation if one or both dates are missing
}, {
    message: "Expire date must be on or after the start date",
    path: ["expireDate"],
});
// --- COUPON API ROUTES ---
router.route('/')
    .post(couponController_1.createCoupon)
    .get(couponController_1.getAllCoupons);
router.post('/validate', couponController_1.validateCoupon);
router.route('/:id')
    .get(couponController_1.getCouponById)
    .put(couponController_1.updateCoupon)
    .delete(couponController_1.deleteCoupon);
exports.default = router;
