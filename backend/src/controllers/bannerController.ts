import { Request, Response } from 'express';
import Banner from '../models/Banner';
import { validateObjectId } from '../schemas/bannerSchemas';

// @desc    Get all banners with optional filtering
// @route   GET /api/banners
// @access  Public
export const getBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      isActive,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query: any = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [banners, totalCount] = await Promise.all([
      Banner.find(query)
        .populate('classId', 'title description teacherName image class_link isLive isChat')
        .populate('createdBy', 'firstName lastName email')
        .sort({ priority: 1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Banner.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    res.status(200).json({
      state: 200,
      message: 'Banners retrieved successfully',
      data: [...banners]
    });

  } catch (error: any) {
    console.error('Error fetching banners:', error);
    res.status(500).json({
      state: 500,
      message: error.message || 'Server Error',
      data: null
    });
  }
};

// @desc    Get active banners for homepage
// @route   GET /api/banners/active
// @access  Public
export const getActiveBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const banners = await Banner.getActiveBanners();

    res.status(200).json({
      state: 200,
      message: 'Active banners retrieved successfully',
      data: banners
    });

  } catch (error: any) {
    console.error('Error fetching active banners:', error);
    res.status(500).json({
      state: 500,
      message: error.message || 'Server Error',
      data: null
    });
  }
};

// @desc    Create a new banner
// @route   POST /api/banners
// @access  Public (should be protected in production)
export const createBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const bannerData = req.body;

    // Create new banner
    const banner = new Banner(bannerData);
    const savedBanner = await banner.save();

    // Populate the response
    const populatedBanner = await Banner.findById(savedBanner._id)
      .populate('classId', 'title description teacherName image')
      .populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      state: 201,
      message: 'Banner created successfully',
      data: populatedBanner
    });

  } catch (error: any) {
    console.error('Error creating banner:', error);
    res.status(500).json({
      state: 500,
      message: error.message || 'Server Error',
      data: null
    });
  }
};

// @desc    Get banner by ID
// @route   GET /api/banners/:id
// @access  Public
export const getBannerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    const validation = validateObjectId.safeParse({ id });
    if (!validation.success) {
      res.status(400).json({
        state: 400,
        message: 'Invalid banner ID format',
        data: null
      });
      return;
    }

    const banner = await Banner.findById(id)
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

  } catch (error: any) {
    console.error('Error getting banner:', error);
    res.status(500).json({
      state: 500,
      message: error.message || 'Server Error',
      data: null
    });
  }
};

// @desc    Update banner by ID
// @route   PUT /api/banners/:id
// @access  Public (should be protected in production)
export const updateBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate ObjectId
    const validation = validateObjectId.safeParse({ id });
    if (!validation.success) {
      res.status(400).json({
        state: 400,
        message: 'Invalid banner ID format',
        data: null
      });
      return;
    }

    const banner = await Banner.findByIdAndUpdate(id, updates, { new: true })
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

  } catch (error: any) {
    console.error('Error updating banner:', error);
    res.status(500).json({
      state: 500,
      message: error.message || 'Server Error',
      data: null
    });
  }
};

// @desc    Delete banner by ID
// @route   DELETE /api/banners/:id
// @access  Public (should be protected in production)
export const deleteBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    const validation = validateObjectId.safeParse({ id });
    if (!validation.success) {
      res.status(400).json({
        state: 400,
        message: 'Invalid banner ID format',
        data: null
      });
      return;
    }

    const banner = await Banner.findByIdAndDelete(id);

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

  } catch (error: any) {
    console.error('Error deleting banner:', error);
    res.status(500).json({
      state: 500,
      message: error.message || 'Server Error',
      data: null
    });
  }
};

// @desc    Toggle banner active status
// @route   PATCH /api/banners/:id/toggle
// @access  Public (should be protected in production)
export const toggleBannerStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    const validation = validateObjectId.safeParse({ id });
    if (!validation.success) {
      res.status(400).json({
        state: 400,
        message: 'Invalid banner ID format',
        data: null
      });
      return;
    }

    const banner = await Banner.findById(id);

    if (!banner) {
      res.status(404).json({
        state: 404,
        message: 'Banner not found',
        data: null
      });
      return;
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    const populatedBanner = await Banner.findById(id)
      .populate('classId', 'title description teacherName image')
      .populate('createdBy', 'firstName lastName email');

    res.status(200).json({
      state: 200,
      message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
      data: populatedBanner
    });

  } catch (error: any) {
    console.error('Error toggling banner status:', error);
    res.status(500).json({
      state: 500,
      message: error.message || 'Server Error',
      data: null
    });
  }
};
