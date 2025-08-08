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
exports.getSubscriptionFormData = exports.deleteSubscription = exports.updateSubscription = exports.getSubscriptionById = exports.getAllSubscriptions = exports.createSubscription = void 0;
const subscription_model_1 = __importDefault(require("../models/subscription.model"));
const Course_1 = __importDefault(require("../models/Course"));
const ebookModel_1 = __importDefault(require("../models/ebookModel"));
// import Package from '../models/package.model'; // DUMMY: Package model not needed for now
const couponModel_1 = __importDefault(require("../models/couponModel"));
const Category_1 = __importDefault(require("../models/Category"));
// @desc    Create a new subscription
// @route   POST /api/subscriptions
const createSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const subscription = yield subscription_model_1.default.create(req.body);
    res.status(201).json({ success: true, message: "Subscription created successfully", data: subscription });
});
exports.createSubscription = createSubscription;
// @desc    Get all subscriptions
// @route   GET /api/subscriptions
const getAllSubscriptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const subscriptions = yield subscription_model_1.default.find({}).populate('coupons', 'code');
    res.status(200).json({ success: true, data: subscriptions });
});
exports.getAllSubscriptions = getAllSubscriptions;
// @desc    Get a single subscription by ID
// @route   GET /api/subscriptions/:id
const getSubscriptionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const subscription = yield subscription_model_1.default.findById(req.params.id)
        // ✅ FIX: Updated populate to include '_id' for each reference
        .populate('courses', '_id title')
        .populate('ebooks', '_id title')
        .populate('coupons', '_id code');
    if (!subscription) {
        res.status(404).json({ success: false, message: "Subscription not found" });
        return;
    }
    res.status(200).json({ success: true, data: subscription });
});
exports.getSubscriptionById = getSubscriptionById;
// @desc    Update a subscription
// @route   PUT /api/subscriptions/:id
const updateSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const subscription = yield subscription_model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!subscription) {
        res.status(404).json({ success: false, message: "Subscription not found" });
        return;
    }
    res.status(200).json({ success: true, message: "Subscription updated successfully", data: subscription });
});
exports.updateSubscription = updateSubscription;
// @desc    Delete a subscription
// @route   DELETE /api/subscriptions/:id
const deleteSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const subscription = yield subscription_model_1.default.findByIdAndDelete(req.params.id);
    if (!subscription) {
        res.status(404).json({ success: false, message: "Subscription not found" });
        return;
    }
    res.status(200).json({ success: true, message: "Subscription deleted successfully" });
});
exports.deleteSubscription = deleteSubscription;
// @desc    Get all data needed for the subscription form
// @route   GET /api/subscriptions/form-data
const getSubscriptionFormData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [courses, ebooks, coupons, categories] = yield Promise.all([
        Course_1.default.find({}, '_id title category'),
        ebookModel_1.default.find({}, '_id title category'),
        couponModel_1.default.find({}, '_id code'),
        Category_1.default.find({}, '_id categoryName')
    ]);
    res.status(200).json({
        success: true,
        data: { courses, ebooks, coupons, categories },
    });
});
exports.getSubscriptionFormData = getSubscriptionFormData;
