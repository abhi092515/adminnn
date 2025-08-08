"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCoupon = exports.deleteCoupon = exports.updateCoupon = exports.getCouponById = exports.getAllCoupons = exports.createCoupon = void 0;
const couponModel_1 = __importDefault(require("../models/couponModel"));
const couponRoutes_1 = require("../routes/couponRoutes");
// --- CREATE COUPON ---
const createCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = couponRoutes_1.createCouponSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ state: 400, msg: "Validation failed", errors: validationResult.error.flatten() });
            return;
        }
        const { code } = validationResult.data;
        const existingCoupon = yield couponModel_1.default.findOne({ code });
        if (existingCoupon) {
            res.status(409).json({ state: 409, msg: "A coupon with this code already exists." });
            return;
        }
        const newCoupon = new couponModel_1.default(validationResult.data);
        const savedCoupon = yield newCoupon.save();
        res.status(201).json({ state: 201, msg: "Coupon created successfully", data: savedCoupon });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: "Failed to create coupon.", error: error.message });
    }
});
exports.createCoupon = createCoupon;
// --- GET ALL COUPONS ---
const getAllCoupons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupons = yield couponModel_1.default.find({}).sort({ createdAt: -1 });
        res.status(200).json({ state: 200, msg: "Coupons retrieved successfully", data: coupons });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: error.message });
    }
});
exports.getAllCoupons = getAllCoupons;
// --- GET COUPON BY ID ---
const getCouponById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupon = yield couponModel_1.default.findById(req.params.id);
        if (!coupon) {
            res.status(404).json({ state: 404, msg: 'Coupon not found' });
            return;
        }
        res.status(200).json({ state: 200, msg: "Coupon retrieved successfully", data: coupon });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: error.message });
    }
});
exports.getCouponById = getCouponById;
// --- UPDATE COUPON ---
const updateCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupon = yield couponModel_1.default.findById(req.params.id);
        if (!coupon) {
            res.status(404).json({ state: 404, msg: 'Coupon not found' });
            return;
        }
        const validationResult = couponRoutes_1.updateCouponSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ state: 400, msg: "Validation failed", errors: validationResult.error.flatten() });
            return;
        }
        Object.assign(coupon, validationResult.data);
        const updatedCoupon = yield coupon.save();
        res.status(200).json({ state: 200, msg: "Coupon updated successfully", data: updatedCoupon });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: "Failed to update coupon.", error: error.message });
    }
});
exports.updateCoupon = updateCoupon;
// --- DELETE COUPON ---
const deleteCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupon = yield couponModel_1.default.findByIdAndDelete(req.params.id);
        if (!coupon) {
            res.status(404).json({ state: 404, msg: 'Coupon not found' });
            return;
        }
        res.status(200).json({ state: 200, msg: 'Coupon deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: "Failed to delete coupon.", error: error.message });
    }
});
exports.deleteCoupon = deleteCoupon;
// --- VALIDATE COUPON (BONUS) ---
const validateCoupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.body;
        if (!code) {
            res.status(400).json({ state: 400, msg: "Coupon code is required." });
            return;
        }
        const coupon = yield couponModel_1.default.findOne({ code: code.toUpperCase() });
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
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: "Failed to validate coupon.", error: error.message });
    }
});
exports.validateCoupon = validateCoupon;
