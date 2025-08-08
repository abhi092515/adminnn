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
exports.getUserViewHistory = exports.getClassViewAnalytics = exports.getClassViews = exports.trackClassView = void 0;
const mongoose_1 = require("mongoose");
const View_1 = __importDefault(require("../models/View"));
const Class_1 = __importDefault(require("../models/Class"));
const viewSchemas_1 = require("../schemas/viewSchemas");
// @desc    Track a class view
// @route   POST /api/views/track-class-view
// @access  Public
const trackClassView = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request body
        const validationResult = viewSchemas_1.trackViewSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                message: 'Validation failed',
                data: validationResult.error.issues
            });
            return;
        }
        const { classId, userId, sessionId } = validationResult.data;
        // Validate class exists
        const classExists = yield Class_1.default.findById(classId);
        if (!classExists) {
            res.status(404).json({
                state: 404,
                message: 'Class not found',
                data: null
            });
            return;
        } // Use the optimized tracking function
        const result = yield trackClassViewHelper(classId, {
            userId: userId ? new mongoose_1.Types.ObjectId(userId) : null,
            sessionId
        });
        if (result.success) {
            res.status(201).json({
                state: 201,
                message: 'View tracked successfully',
                data: {
                    classId,
                    isFirstView: result.isFirstView,
                    timestamp: new Date()
                }
            });
        }
        else {
            res.status(500).json({
                state: 500,
                message: 'Failed to track view',
                data: { error: result.error }
            });
        }
    }
    catch (error) {
        console.error('Error tracking class view:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: null
        });
    }
});
exports.trackClassView = trackClassView;
function trackClassViewHelper(classId_1) {
    return __awaiter(this, arguments, void 0, function* (classId, options = {}) {
        const { userId = null, sessionId = null } = options;
        try {
            // Check if this is a unique view
            const isFirstView = !(yield View_1.default.hasViewed(new mongoose_1.Types.ObjectId(classId), userId, sessionId));
            // Prepare counter increments
            const increment = { viewCount: 1 };
            if (isFirstView) {
                increment.uniqueViewCount = 1;
            }
            // Execute both operations in parallel
            yield Promise.all([
                // Update class counters
                Class_1.default.updateOne({ _id: new mongoose_1.Types.ObjectId(classId) }, { $inc: increment }),
                // Create detailed view record
                View_1.default.create({
                    classId: new mongoose_1.Types.ObjectId(classId),
                    userId,
                    sessionId,
                    viewedAt: new Date()
                })
            ]);
            return { success: true, isFirstView };
        }
        catch (error) {
            console.error('Error tracking view:', error);
            // Don't throw - view tracking shouldn't break user experience
            return { success: false, error: error.message };
        }
    });
}
// @desc    Get views for a class
// @route   GET /api/views/class/:classId
// @access  Public
const getClassViews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { classId } = req.params;
        const { startDate, endDate, includeAnonymous = 'true' } = req.query;
        // Validate class exists
        const classExists = yield Class_1.default.findById(classId);
        if (!classExists) {
            res.status(404).json({
                state: 404,
                message: 'Class not found',
                data: null
            });
            return;
        }
        // Build query
        const query = { classId: new mongoose_1.Types.ObjectId(classId) };
        // Date range filter
        if (startDate || endDate) {
            query.viewedAt = {};
            if (startDate) {
                query.viewedAt.$gte = new Date(String(startDate));
            }
            if (endDate) {
                query.viewedAt.$lte = new Date(String(endDate));
            }
        }
        // Exclude anonymous views if requested
        if (String(includeAnonymous).toLowerCase() !== 'true') {
            query.userId = { $exists: true, $ne: null };
        }
        // Get all views without pagination
        const views = yield View_1.default.find(query)
            .populate('userId', 'firstName lastName email')
            .sort({ viewedAt: -1 });
        res.status(200).json({
            state: 200,
            message: 'Class views retrieved successfully',
            data: {
                views,
                totalCount: views.length
            }
        });
    }
    catch (error) {
        console.error('Error fetching class views:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: null
        });
    }
});
exports.getClassViews = getClassViews;
// @desc    Get analytics for a class
// @route   GET /api/views/analytics/:classId
// @access  Public
const getClassViewAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { classId } = req.params;
        const { startDate, endDate, period = 'day' } = req.query;
        // Validate class exists
        const classExists = yield Class_1.default.findById(classId);
        if (!classExists) {
            res.status(404).json({
                state: 404,
                message: 'Class not found',
                data: null
            });
            return;
        }
        // Build time range
        const timeRange = { classId: new mongoose_1.Types.ObjectId(classId) };
        if (startDate || endDate) {
            timeRange.viewedAt = {};
            if (startDate) {
                timeRange.viewedAt.$gte = new Date(String(startDate));
            }
            if (endDate) {
                timeRange.viewedAt.$lte = new Date(String(endDate));
            }
        } // Aggregate analytics
        const analytics = yield View_1.default.aggregate([
            { $match: timeRange },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: 1 },
                    uniqueViewers: {
                        $addToSet: {
                            $cond: [
                                { $ifNull: ['$userId', false] },
                                '$userId',
                                '$sessionId'
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalViews: 1,
                    uniqueViewers: { $size: '$uniqueViewers' }
                }
            }
        ]);
        // Get daily breakdown
        const dailyBreakdown = yield View_1.default.aggregate([
            { $match: timeRange },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$viewedAt'
                        }
                    },
                    views: { $sum: 1 },
                    uniqueUsers: {
                        $addToSet: {
                            $cond: [
                                { $ifNull: ['$userId', false] },
                                '$userId',
                                '$sessionId'
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    views: 1,
                    uniqueUsers: { $size: '$uniqueUsers' }
                }
            },
            { $sort: { date: 1 } }
        ]);
        const result = analytics.length > 0 ? analytics[0] : {
            totalViews: 0,
            uniqueViewers: 0
        };
        res.status(200).json({
            state: 200,
            message: 'Class analytics retrieved successfully',
            data: Object.assign(Object.assign({}, result), { dailyBreakdown,
                timeRange, period: {
                    startDate,
                    endDate
                } })
        });
    }
    catch (error) {
        console.error('Error fetching class analytics:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: null
        });
    }
});
exports.getClassViewAnalytics = getClassViewAnalytics;
// @desc    Get user's view history
// @route   GET /api/views/user/:userId/history
// @access  Public
const getUserViewHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const [views, totalCount] = yield Promise.all([
            View_1.default.find({ userId: new mongoose_1.Types.ObjectId(userId) })
                .populate('classId', 'title description teacherName image')
                .sort({ viewedAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            View_1.default.countDocuments({ userId: new mongoose_1.Types.ObjectId(userId) })
        ]);
        const totalPages = Math.ceil(totalCount / Number(limit));
        res.status(200).json({
            state: 200,
            message: 'User view history retrieved successfully',
            data: {
                views,
                pagination: {
                    currentPage: Number(page),
                    totalPages,
                    totalCount,
                    hasNext: Number(page) < totalPages,
                    hasPrev: Number(page) > 1
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching user view history:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: null
        });
    }
});
exports.getUserViewHistory = getUserViewHistory;
