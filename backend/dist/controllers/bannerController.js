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
exports.toggleBannerStatus = exports.deleteBanner = exports.updateBanner = exports.getBannerById = exports.createBanner = exports.getActiveBanners = exports.getBanners = void 0;
const Banner_1 = __importDefault(require("../models/Banner"));
const bannerSchemas_1 = require("../schemas/bannerSchemas");
// @desc    Get all banners with optional filtering
// @route   GET /api/banners
// @access  Public
const getBanners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { isActive, page = 1, limit = 10 } = req.query;
        // Build query
        const query = {};
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [banners, totalCount] = yield Promise.all([
            Banner_1.default.find(query)
                .populate('classId', 'title description teacherName image class_link isLive isChat')
                .populate('createdBy', 'firstName lastName email')
                .sort({ priority: 1, createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Banner_1.default.countDocuments(query)
        ]);
        const totalPages = Math.ceil(totalCount / Number(limit));
        res.status(200).json({
            state: 200,
            message: 'Banners retrieved successfully',
            data: [...banners]
        });
    }
    catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: null
        });
    }
});
exports.getBanners = getBanners;
// @desc    Get active banners for homepage
// @route   GET /api/banners/active
// @access  Public
const getActiveBanners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const banners = yield Banner_1.default.getActiveBanners();
        res.status(200).json({
            state: 200,
            message: 'Active banners retrieved successfully',
            data: banners
        });
    }
    catch (error) {
        console.error('Error fetching active banners:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: null
        });
    }
});
exports.getActiveBanners = getActiveBanners;
// @desc    Create a new banner
// @route   POST /api/banners
// @access  Public (should be protected in production)
const createBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bannerData = req.body;
        // Create new banner
        const banner = new Banner_1.default(bannerData);
        const savedBanner = yield banner.save();
        // Populate the response
        const populatedBanner = yield Banner_1.default.findById(savedBanner._id)
            .populate('classId', 'title description teacherName image')
            .populate('createdBy', 'firstName lastName email');
        res.status(201).json({
            state: 201,
            message: 'Banner created successfully',
            data: populatedBanner
        });
    }
    catch (error) {
        console.error('Error creating banner:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: null
        });
    }
});
exports.createBanner = createBanner;
// @desc    Get banner by ID
// @route   GET /api/banners/:id
// @access  Public
const getBannerById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Validate ObjectId
        const validation = bannerSchemas_1.validateObjectId.safeParse({ id });
        if (!validation.success) {
            res.status(400).json({
                state: 400,
                message: 'Invalid banner ID format',
                data: null
            });
            return;
        }
        const banner = yield Banner_1.default.findById(id)
            .populate('classId', 'title description teacherName image')
            .populate('createdBy', 'firstName lastName email');
        if (!banner) {
            res.status(404).json({
                state: 404,
                message: 'Banner not found',
                data: null
            });
            return;
        }
        res.status(200).json({
            state: 200,
            message: 'Banner retrieved successfully',
            data: banner
        });
    }
    catch (error) {
        console.error('Error getting banner:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: null
        });
    }
});
exports.getBannerById = getBannerById;
// @desc    Update banner by ID
// @route   PUT /api/banners/:id
// @access  Public (should be protected in production)
const updateBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Validate ObjectId
        const validation = bannerSchemas_1.validateObjectId.safeParse({ id });
        if (!validation.success) {
            res.status(400).json({
                state: 400,
                message: 'Invalid banner ID format',
                data: null
            });
            return;
        }
        const banner = yield Banner_1.default.findByIdAndUpdate(id, updates, { new: true })
            .populate('classId', 'title description teacherName image')
            .populate('createdBy', 'firstName lastName email');
        if (!banner) {
            res.status(404).json({
                state: 404,
                message: 'Banner not found',
                data: null
            });
            return;
        }
        res.status(200).json({
            state: 200,
            message: 'Banner updated successfully',
            data: banner
        });
    }
    catch (error) {
        console.error('Error updating banner:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: null
        });
    }
});
exports.updateBanner = updateBanner;
// @desc    Delete banner by ID
// @route   DELETE /api/banners/:id
// @access  Public (should be protected in production)
const deleteBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Validate ObjectId
        const validation = bannerSchemas_1.validateObjectId.safeParse({ id });
        if (!validation.success) {
            res.status(400).json({
                state: 400,
                message: 'Invalid banner ID format',
                data: null
            });
            return;
        }
        const banner = yield Banner_1.default.findByIdAndDelete(id);
        if (!banner) {
            res.status(404).json({
                state: 404,
                message: 'Banner not found',
                data: null
            });
            return;
        }
        res.status(200).json({
            state: 200,
            message: 'Banner deleted successfully',
            data: null
        });
    }
    catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: null
        });
    }
});
exports.deleteBanner = deleteBanner;
// @desc    Toggle banner active status
// @route   PATCH /api/banners/:id/toggle
// @access  Public (should be protected in production)
const toggleBannerStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Validate ObjectId
        const validation = bannerSchemas_1.validateObjectId.safeParse({ id });
        if (!validation.success) {
            res.status(400).json({
                state: 400,
                message: 'Invalid banner ID format',
                data: null
            });
            return;
        }
        const banner = yield Banner_1.default.findById(id);
        if (!banner) {
            res.status(404).json({
                state: 404,
                message: 'Banner not found',
                data: null
            });
            return;
        }
        banner.isActive = !banner.isActive;
        yield banner.save();
        const populatedBanner = yield Banner_1.default.findById(id)
            .populate('classId', 'title description teacherName image')
            .populate('createdBy', 'firstName lastName email');
        res.status(200).json({
            state: 200,
            message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
            data: populatedBanner
        });
    }
    catch (error) {
        console.error('Error toggling banner status:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: null
        });
    }
});
exports.toggleBannerStatus = toggleBannerStatus;
