import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { calculateCourseProgress } from '../utils/courseProgressUtils';

// @desc    Get course progress percentage based on time watched
// @route   POST /api/course-progress
// @access  Public
export const getCourseProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, userId } = req.body;
    
    if (!courseId || !userId) {
      res.status(400).json({ 
        state: 400, 
        message: 'Both courseId and userId are required', 
        data: null 
      });
      return;
    }

    if (!Types.ObjectId.isValid(courseId)) {
      res.status(400).json({ 
        state: 400, 
        message: 'Invalid Course ID format', 
        data: null 
      });
      return;
    }

    console.log('🔍 Debug: Starting course progress calculation');
    console.log('📊 Course ID:', courseId);
    console.log('👤 User ID:', userId);

    const courseProgress = await calculateCourseProgress(new Types.ObjectId(courseId), userId);

    if (!courseProgress) {
      console.log('❌ No course found with ID:', courseId);
      res.status(404).json({ 
        state: 404, 
        message: 'Course not found', 
        data: null 
      });
      return;
    }

    console.log('📈 Course progress result:', JSON.stringify(courseProgress, null, 2));

    res.status(200).json({
      state: 200,
      message: 'Course progress retrieved successfully',
      data: {
        accuracy: courseProgress.accuracy,
        progressPercentage: courseProgress.progressPercentage,
        batch_rank: courseProgress.batch_rank,
        level: courseProgress.level
      }
    });

  } catch (error: any) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ 
      state: 500, 
      message: error.message || 'Server Error', 
      data: null 
    });
  }
};
