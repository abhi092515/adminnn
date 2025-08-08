import { Request, Response } from 'express';
import Subscription from '../models/subscription.model';
import Course from '../models/Course'
import Ebook from '../models/ebookModel';
// import Package from '../models/package.model'; // DUMMY: Package model not needed for now
import Coupon from '../models/couponModel';
import Category from '../models/Category';

// @desc    Create a new subscription
// @route   POST /api/subscriptions
export const createSubscription = async (req: Request, res: Response) => {
    const subscription = await Subscription.create(req.body);
    res.status(201).json({ success: true, message: "Subscription created successfully", data: subscription });
};

// @desc    Get all subscriptions
// @route   GET /api/subscriptions
export const getAllSubscriptions = async (req: Request, res: Response) => {
    const subscriptions = await Subscription.find({}).populate('coupons', 'code');
    res.status(200).json({ success: true, data: subscriptions });
};

// @desc    Get a single subscription by ID
// @route   GET /api/subscriptions/:id
export const getSubscriptionById = async (req: Request, res: Response) => {
    const subscription = await Subscription.findById(req.params.id)
        // ✅ FIX: Updated populate to include '_id' for each reference
        .populate('courses', '_id title')
        .populate('ebooks', '_id title')
        .populate('coupons', '_id code');
       
        
    if (!subscription) {
        res.status(404).json({ success: false, message: "Subscription not found" });
        return;
    }
    res.status(200).json({ success: true, data: subscription });
};

// @desc    Update a subscription
// @route   PUT /api/subscriptions/:id
export const updateSubscription = async (req: Request, res: Response) => {
    const subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    if (!subscription) {
        res.status(404).json({ success: false, message: "Subscription not found" });
        return;
    }
    res.status(200).json({ success: true, message: "Subscription updated successfully", data: subscription });
};

// @desc    Delete a subscription
// @route   DELETE /api/subscriptions/:id
export const deleteSubscription = async (req: Request, res: Response) => {
    const subscription = await Subscription.findByIdAndDelete(req.params.id);
    if (!subscription) {
        res.status(404).json({ success: false, message: "Subscription not found" });
        return;
    }
    res.status(200).json({ success: true, message: "Subscription deleted successfully" });
};


// @desc    Get all data needed for the subscription form
// @route   GET /api/subscriptions/form-data
export const getSubscriptionFormData = async (req: Request, res: Response) => {
    const [courses, ebooks, coupons, categories] = await Promise.all([
        Course.find({}, '_id title category'),
        Ebook.find({}, '_id title category'),
        Coupon.find({}, '_id code'),
        Category.find({}, '_id categoryName')
    ]);

    res.status(200).json({
        success: true,
        data: { courses, ebooks, coupons, categories },
    });
};