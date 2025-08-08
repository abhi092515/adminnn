import { Request, Response } from 'express';
import Coupon from '../models/couponModel';
import { createCouponSchema, updateCouponSchema } from '../routes/couponRoutes';

// --- CREATE COUPON ---
export const createCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const validationResult = createCouponSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ state: 400, msg: "Validation failed", errors: validationResult.error.flatten() });
            return;
        }

        const { code } = validationResult.data;
        const existingCoupon = await Coupon.findOne({ code });
        if (existingCoupon) {
            res.status(409).json({ state: 409, msg: "A coupon with this code already exists." });
            return;
        }

        const newCoupon = new Coupon(validationResult.data);
        const savedCoupon = await newCoupon.save();
        res.status(201).json({ state: 201, msg: "Coupon created successfully", data: savedCoupon });
    } catch (error: any) {
        res.status(500).json({ state: 500, msg: "Failed to create coupon.", error: error.message });
    }
};

// --- GET ALL COUPONS ---
export const getAllCoupons = async (req: Request, res: Response): Promise<void> => {
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        res.status(200).json({ state: 200, msg: "Coupons retrieved successfully", data: coupons });
    } catch (error: any) {
        res.status(500).json({ state: 500, msg: error.message });
    }
};

// --- GET COUPON BY ID ---
export const getCouponById = async (req: Request, res: Response): Promise<void> => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            res.status(404).json({ state: 404, msg: 'Coupon not found' });
            return;
        }
        res.status(200).json({ state: 200, msg: "Coupon retrieved successfully", data: coupon });
    } catch (error: any) {
        res.status(500).json({ state: 500, msg: error.message });
    }
};

// --- UPDATE COUPON ---
export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            res.status(404).json({ state: 404, msg: 'Coupon not found' });
            return;
        }

        const validationResult = updateCouponSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ state: 400, msg: "Validation failed", errors: validationResult.error.flatten() });
            return;
        }
        
        Object.assign(coupon, validationResult.data);
        const updatedCoupon = await coupon.save();
        res.status(200).json({ state: 200, msg: "Coupon updated successfully", data: updatedCoupon });
    } catch (error: any) {
        res.status(500).json({ state: 500, msg: "Failed to update coupon.", error: error.message });
    }
};

// --- DELETE COUPON ---
export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            res.status(404).json({ state: 404, msg: 'Coupon not found' });
            return;
        }
        res.status(200).json({ state: 200, msg: 'Coupon deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ state: 500, msg: "Failed to delete coupon.", error: error.message });
    }
};

// --- VALIDATE COUPON (BONUS) ---
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code } = req.body;
        if (!code) {
             res.status(400).json({ state: 400, msg: "Coupon code is required." });
             return;
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            res.status(404).json({ state: 404, msg: 'Coupon not found.' });
            return;
        }
        if (!coupon.isActive) {
            res.status(400).json({ state: 400, msg: 'This coupon is no longer active.' });
            return;
        }

        const now = new Date();
        if (coupon.startDate > now) {
            res.status(400).json({ state: 400, msg: 'This coupon is not yet valid.' });
            return;
        }
        if (coupon.expireDate < now) {
            res.status(400).json({ state: 400, msg: 'This coupon has expired.' });
            return;
        }

        res.status(200).json({ state: 200, msg: "Coupon is valid.", data: coupon });

    } catch (error: any) {
        res.status(500).json({ state: 500, msg: "Failed to validate coupon.", error: error.message });
    }
};