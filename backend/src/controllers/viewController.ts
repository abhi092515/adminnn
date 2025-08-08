// src/controllers/viewController.ts
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import View, { IView } from '../models/View';
import Class from '../models/Class';
import { 
  trackViewSchema, 
  viewQuerySchema, 
  analyticsQuerySchema, 
  userHistoryQuerySchema,
  objectIdParamSchema 
} from '../schemas/viewSchemas';

// @desc    Track a class view
// @route   POST /api/views/track-class-view
// @access  Public
export const trackClassView = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validationResult = trackViewSchema.safeParse(req.body);
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
    const classExists = await Class.findById(classId);
    if (!classExists) {
      res.status(404).json({
        state: 404,
        message: 'Class not found',
        data: null
      });
      return;
    }    // Use the optimized tracking function
    const result = await trackClassViewHelper(classId, {
      userId: userId ? new Types.ObjectId(userId) : null,
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
    } else {
      res.status(500).json({
        state: 500,
        message: 'Failed to track view',
        data: { error: result.error }
      });
    }

  } catch (error: any) {
    console.error('Error tracking class view:', error);
    res.status(500).json({
      state: 500,
      message: error.message || 'Server Error',
      data: null
    });
  }
};

async function trackClassViewHelper(classId: string, options: any = {}) {
  const {
    userId = null,
    sessionId = null
  } = options;

  try {
    // Check if this is a unique view
    const isFirstView = !(await View.hasViewed(new Types.ObjectId(classId), userId, sessionId));
    
    // Prepare counter increments
    const increment: any = { viewCount: 1 };
    if (isFirstView) {
      increment.uniqueViewCount = 1;
    }
    
    // Execute both operations in parallel
    await Promise.all([
      // Update class counters
      Class.updateOne({ _id: new Types.ObjectId(classId) }, { $inc: increment }),
        // Create detailed view record
      View.create({
        classId: new Types.ObjectId(classId),
        userId,
        sessionId,
        viewedAt: new Date()
      })
    ]);
    
    return { success: true, isFirstView };
    
  } catch (error: any) {
    console.error('Error tracking view:', error);
    // Don't throw - view tracking shouldn't break user experience
    return { success: false, error: error.message };
  }
}

// @desc    Get views for a class
// @route   GET /api/views/class/:classId
// @access  Public
export const getClassViews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;
    const { 
      startDate, 
      endDate,
      includeAnonymous = 'true'
    } = req.query;

    // Validate class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      res.status(404).json({
        state: 404,
        message: 'Class not found',
        data: null
      });
      return;
    }

    // Build query
    const query: any = { classId: new Types.ObjectId(classId) };

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
    const views = await View.find(query)
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

  } catch (error: any) {
    console.error('Error fetching class views:', error);
    res.status(500).json({
      state: 500,
      message: error.message || 'Server Error',
      data: null
    });
  }
};

// @desc    Get analytics for a class
// @route   GET /api/views/analytics/:classId
// @access  Public
export const getClassViewAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;
    const { startDate, endDate, period = 'day' } = req.query;

    // Validate class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      res.status(404).json({
        state: 404,
        message: 'Class not found',
        data: null
      });
      return;
    }

    // Build time range
    const timeRange: any = { classId: new Types.ObjectId(classId) };
    if (startDate || endDate) {
      timeRange.viewedAt = {};
      if (startDate) {
        timeRange.viewedAt.$gte = new Date(String(startDate));
      }
      if (endDate) {
        timeRange.viewedAt.$lte = new Date(String(endDate));
      }
    }    // Aggregate analytics
    const analytics = await View.aggregate([
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
    const dailyBreakdown = await View.aggregate([
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
    ]);    const result = analytics.length > 0 ? analytics[0] : {
      totalViews: 0,
      uniqueViewers: 0
    };

    res.status(200).json({
      state: 200,
      message: 'Class analytics retrieved successfully',
      data: {
        ...result,
        dailyBreakdown,
        timeRange,
        period: {
          startDate,
          endDate
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching class analytics:', error);
    res.status(500).json({
      state: 500,
      message: error.message || 'Server Error',
      data: null
    });
  }
};

// @desc    Get user's view history
// @route   GET /api/views/user/:userId/history
// @access  Public
export const getUserViewHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [views, totalCount] = await Promise.all([
      View.find({ userId: new Types.ObjectId(userId) })
        .populate('classId', 'title description teacherName image')
        .sort({ viewedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      View.countDocuments({ userId: new Types.ObjectId(userId) })
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

  } catch (error: any) {
    console.error('Error fetching user view history:', error);
    res.status(500).json({
      state: 500,
      message: error.message || 'Server Error',
      data: null
    });
  }
};
