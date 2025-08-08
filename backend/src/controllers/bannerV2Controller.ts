import { Request, Response } from 'express';
import BannerV2 from '../models/bannerModelV2';
import { createBannerSchema, updateBannerSchema } from '../routes/bannerV2Routes';
import { uploadFileToS3, deleteFileFromS3, extractKeyFromS3Url } from '../config/s3Upload';

// --- Helper to reduce repetition ---
const handleS3Upload = async (file: Express.Multer.File): Promise<string> => {
    const uniqueFileName = `banners/${Date.now()}-${file.originalname}`;
    return await uploadFileToS3(file.buffer, uniqueFileName, file.mimetype);
};

// --- CREATE BANNER ---
export const createBanner = async (req: Request, res: Response): Promise<void> => {
    try {
        const validationResult = createBannerSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ state: 400, msg: "Validation failed", errors: validationResult.error.flatten() });
            return;
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (!files || !files.websiteBanner?.[0] || !files.mobileBanner?.[0]) {
            res.status(400).json({ state: 400, msg: "Both website and mobile banners are required." });
            return;
        }

        const [websiteBannerUrl, mobileBannerUrl] = await Promise.all([
            handleS3Upload(files.websiteBanner[0]),
            handleS3Upload(files.mobileBanner[0])
        ]);

        const newBanner = new BannerV2({
            ...validationResult.data,
            websiteBannerUrl,
            mobileBannerUrl,
        });

        const savedBanner = await newBanner.save();
        res.status(201).json({ state: 201, msg: "Banner created successfully", data: savedBanner });

    } catch (error: any) {
        res.status(500).json({ state: 500, msg: "Failed to create banner.", error: error.message });
    }
};

// --- GET ALL BANNERS ---
export const getAllBanners = async (req: Request, res: Response): Promise<void> => {
    try {
        const banners = await BannerV2.find({}).sort({ priority: 'asc' });
        res.status(200).json({ state: 200, msg: "Banners retrieved successfully", data: banners });
    } catch (error: any) {
        res.status(500).json({ state: 500, msg: error.message });
    }
};

// --- GET BANNER BY ID ---
export const getBannerById = async (req: Request, res: Response): Promise<void> => {
    try {
        // ✅ FIX: Use the BannerV2 model and a correct variable name
        const banner = await BannerV2.findById(req.params.id);
        if (!banner) {
            res.status(404).json({ state: 404, msg: 'Banner not found' });
            return;
        }
        res.status(200).json({ state: 200, msg: "Banner retrieved successfully", data: banner });
    } catch (error: any) {
        res.status(500).json({ state: 500, msg: error.message });
    }
};

// --- UPDATE BANNER ---
export const updateBanner = async (req: Request, res: Response): Promise<void> => {
    try {
        // ✅ FIX: Use the BannerV2 model
        const banner = await BannerV2.findById(req.params.id);
        if (!banner) {
            res.status(404).json({ state: 404, msg: 'Banner not found' });
            return;
        }

        const validationResult = updateBannerSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ state: 400, msg: "Validation failed", errors: validationResult.error.flatten() });
            return;
        }
        
        Object.assign(banner, validationResult.data);

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (files) {
            if (files.websiteBanner?.[0]) {
                await deleteFileFromS3(extractKeyFromS3Url(banner.websiteBannerUrl) || '');
                banner.websiteBannerUrl = await handleS3Upload(files.websiteBanner[0]);
            }
            if (files.mobileBanner?.[0]) {
                await deleteFileFromS3(extractKeyFromS3Url(banner.mobileBannerUrl) || '');
                banner.mobileBannerUrl = await handleS3Upload(files.mobileBanner[0]);
            }
        }

        const updatedBanner = await banner.save();
        res.status(200).json({ state: 200, msg: "Banner updated successfully", data: updatedBanner });
    } catch (error: any) {
        res.status(500).json({ state: 500, msg: "Failed to update banner.", error: error.message });
    }
};

// --- DELETE BANNER ---
export const deleteBanner = async (req: Request, res: Response): Promise<void> => {
    try {
        // ✅ FIX: Use the BannerV2 model
        const banner = await BannerV2.findByIdAndDelete(req.params.id);
        if (!banner) {
            res.status(404).json({ state: 404, msg: 'Banner not found' });
            return;
        }

        await Promise.all([
            deleteFileFromS3(extractKeyFromS3Url(banner.websiteBannerUrl) || ''),
            deleteFileFromS3(extractKeyFromS3Url(banner.mobileBannerUrl) || '')
        ]);

        res.status(200).json({ state: 200, msg: 'Banner deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ state: 500, msg: "Failed to delete banner.", error: error.message });
    }
};