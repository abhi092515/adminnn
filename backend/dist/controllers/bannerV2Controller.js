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
exports.deleteBanner = exports.updateBanner = exports.getBannerById = exports.getAllBanners = exports.createBanner = void 0;
const bannerModelV2_1 = __importDefault(require("../models/bannerModelV2"));
const bannerV2Routes_1 = require("../routes/bannerV2Routes");
const s3Upload_1 = require("../config/s3Upload");
// --- Helper to reduce repetition ---
const handleS3Upload = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const uniqueFileName = `banners/${Date.now()}-${file.originalname}`;
    return yield (0, s3Upload_1.uploadFileToS3)(file.buffer, uniqueFileName, file.mimetype);
});
// --- CREATE BANNER ---
const createBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const validationResult = bannerV2Routes_1.createBannerSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ state: 400, msg: "Validation failed", errors: validationResult.error.flatten() });
            return;
        }
        const files = req.files;
        if (!files || !((_a = files.websiteBanner) === null || _a === void 0 ? void 0 : _a[0]) || !((_b = files.mobileBanner) === null || _b === void 0 ? void 0 : _b[0])) {
            res.status(400).json({ state: 400, msg: "Both website and mobile banners are required." });
            return;
        }
        const [websiteBannerUrl, mobileBannerUrl] = yield Promise.all([
            handleS3Upload(files.websiteBanner[0]),
            handleS3Upload(files.mobileBanner[0])
        ]);
        const newBanner = new bannerModelV2_1.default(Object.assign(Object.assign({}, validationResult.data), { websiteBannerUrl,
            mobileBannerUrl }));
        const savedBanner = yield newBanner.save();
        res.status(201).json({ state: 201, msg: "Banner created successfully", data: savedBanner });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: "Failed to create banner.", error: error.message });
    }
});
exports.createBanner = createBanner;
// --- GET ALL BANNERS ---
const getAllBanners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const banners = yield bannerModelV2_1.default.find({}).sort({ priority: 'asc' });
        res.status(200).json({ state: 200, msg: "Banners retrieved successfully", data: banners });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: error.message });
    }
});
exports.getAllBanners = getAllBanners;
// --- GET BANNER BY ID ---
const getBannerById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // ✅ FIX: Use the BannerV2 model and a correct variable name
        const banner = yield bannerModelV2_1.default.findById(req.params.id);
        if (!banner) {
            res.status(404).json({ state: 404, msg: 'Banner not found' });
            return;
        }
        res.status(200).json({ state: 200, msg: "Banner retrieved successfully", data: banner });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: error.message });
    }
});
exports.getBannerById = getBannerById;
// --- UPDATE BANNER ---
const updateBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // ✅ FIX: Use the BannerV2 model
        const banner = yield bannerModelV2_1.default.findById(req.params.id);
        if (!banner) {
            res.status(404).json({ state: 404, msg: 'Banner not found' });
            return;
        }
        const validationResult = bannerV2Routes_1.updateBannerSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ state: 400, msg: "Validation failed", errors: validationResult.error.flatten() });
            return;
        }
        Object.assign(banner, validationResult.data);
        const files = req.files;
        if (files) {
            if ((_a = files.websiteBanner) === null || _a === void 0 ? void 0 : _a[0]) {
                yield (0, s3Upload_1.deleteFileFromS3)((0, s3Upload_1.extractKeyFromS3Url)(banner.websiteBannerUrl) || '');
                banner.websiteBannerUrl = yield handleS3Upload(files.websiteBanner[0]);
            }
            if ((_b = files.mobileBanner) === null || _b === void 0 ? void 0 : _b[0]) {
                yield (0, s3Upload_1.deleteFileFromS3)((0, s3Upload_1.extractKeyFromS3Url)(banner.mobileBannerUrl) || '');
                banner.mobileBannerUrl = yield handleS3Upload(files.mobileBanner[0]);
            }
        }
        const updatedBanner = yield banner.save();
        res.status(200).json({ state: 200, msg: "Banner updated successfully", data: updatedBanner });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: "Failed to update banner.", error: error.message });
    }
});
exports.updateBanner = updateBanner;
// --- DELETE BANNER ---
const deleteBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // ✅ FIX: Use the BannerV2 model
        const banner = yield bannerModelV2_1.default.findByIdAndDelete(req.params.id);
        if (!banner) {
            res.status(404).json({ state: 404, msg: 'Banner not found' });
            return;
        }
        yield Promise.all([
            (0, s3Upload_1.deleteFileFromS3)((0, s3Upload_1.extractKeyFromS3Url)(banner.websiteBannerUrl) || ''),
            (0, s3Upload_1.deleteFileFromS3)((0, s3Upload_1.extractKeyFromS3Url)(banner.mobileBannerUrl) || '')
        ]);
        res.status(200).json({ state: 200, msg: 'Banner deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: "Failed to delete banner.", error: error.message });
    }
});
exports.deleteBanner = deleteBanner;
