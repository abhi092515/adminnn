import express from 'express';
import { z } from 'zod';
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon
} from '../controllers/couponController';

const router = express.Router();

// --- ZOD VALIDATION SCHEMAS ---

// 1. Define the base object schema without any refinements
const baseCouponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").transform(val => val.toUpperCase()),
  type: z.enum(['percentage', 'fixed']),
  discountValue: z.coerce.number().positive("Discount value must be a positive number."),
  usageLimitPerUser: z.coerce.number().int().positive().default(1),
  startDate: z.coerce.date(),
  expireDate: z.coerce.date(),
  applicableOn: z.array(z.string()).optional(),
  isActive: z.boolean().optional().default(true),
});

// 2. Create the schema for 'create' by applying the refinement to the base
export const createCouponSchema = baseCouponSchema.refine(data => data.expireDate >= data.startDate, {
  message: "Expire date must be on or after the start date",
  path: ["expireDate"],
});

// 3. Create the schema for 'update' by calling .partial() FIRST, then applying the refinement
export const updateCouponSchema = baseCouponSchema.partial().refine(data => {
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
  .post(createCoupon)
  .get(getAllCoupons);

router.post('/validate', validateCoupon);

router.route('/:id')
  .get(getCouponById)
  .put(updateCoupon)
  .delete(deleteCoupon);

export default router;