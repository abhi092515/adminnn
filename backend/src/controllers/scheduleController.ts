import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Class from '../models/Class';
import Course from '../models/Course';

// @desc    Get batch schedules between start and end dates (using category-based matching like course/classes endpoint)
// @route   POST /api/schedules/batch
// @access  Public
export const getBatchSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, startDate, endDate } = req.body;

    // Validate courseId
    if (!courseId || !Types.ObjectId.isValid(courseId)) {
      res.status(400).json({
        state: 400,
        msg: 'Valid courseId is required',
        data: null
      });
      return;
    }

    // First, get the course to access its mainCategory and category
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        state: 404,
        msg: 'Course not found',
        data: null
      });
      return;
    }

    // Build the base query conditions for classes using category-based matching
    const baseConditions: any = {
      mainCategory: course.mainCategory,
      category: course.category,
      startDate: { $exists: true },
      endDate: { $exists: true },
      status: 'active'
    };

    let queryConditions: any = baseConditions;    // Add date filtering only if both dates are provided (date-only comparison)
    if (startDate && endDate) {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        res.status(400).json({
          state: 400,
          msg: 'Invalid date format. Please use YYYY-MM-DD format',
          data: null
        });
        return;
      }

      // Use MongoDB aggregation for date-only comparison
      queryConditions = [
        { $match: baseConditions },
        {
          $addFields: {
            // Extract date part only (ignore time) from class dates
            classStartDate: { $dateToString: { format: "%Y-%m-%d", date: "$startDate" } },
            classEndDate: { $dateToString: { format: "%Y-%m-%d", date: "$endDate" } }
          }
        },
        {
          $match: {
            $and: [
              { classStartDate: { $lte: endDate } },     // Class starts on or before requested end date
              { classEndDate: { $gte: startDate } }      // Class ends on or after requested start date
            ]
          }
        }
      ];
    }

    // Execute the query with populated data
    let classes;
    if (Array.isArray(queryConditions)) {
      // Use aggregation pipeline for date-only filtering
      const pipeline = [
        ...queryConditions,
        {
          $lookup: {
            from: 'maincategories',
            localField: 'mainCategory',
            foreignField: '_id',
            as: 'mainCategory'
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $lookup: {
            from: 'sections',
            localField: 'section',
            foreignField: '_id',
            as: 'section'
          }
        },
        {
          $lookup: {
            from: 'topics',
            localField: 'topic',
            foreignField: '_id',
            as: 'topic'
          }
        },
        {
          $addFields: {
            mainCategory: { $arrayElemAt: ['$mainCategory', 0] },
            category: { $arrayElemAt: ['$category', 0] },
            section: { $arrayElemAt: ['$section', 0] },
            topic: { $arrayElemAt: ['$topic', 0] }
          }
        },
        {
          $project: {
            classStartDate: 0,
            classEndDate: 0
          }
        },
        { $sort: { startDate: 1 } }
      ];

      classes = await Class.aggregate(pipeline);
    } else {
      // Use regular find for queries without date filtering
      classes = await Class.find(queryConditions)
        .populate('mainCategory', '_id mainCategoryName')
        .populate('category', '_id categoryName')
        .populate('section', '_id sectionName')
        .populate('topic', '_id topicName')
        .sort({ startDate: 1 })
        .exec();
    }    // Format the response data with the new structure
    const formattedClasses = classes.map(cls => {
      // Format dates to "YYYY-MM-DD HH:mm:ss" format
      const formatDate = (date: Date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toISOString().slice(0, 19).replace('T', ' ');
      };

      return {
        class_id: cls._id,
        topic: cls.title || cls.topic?.topicName || 'N/A',
        start_date: formatDate(cls.startDate),
        mapping_date: formatDate(cls.startDate), // Using start_date as mapping_date
        end_date: formatDate(cls.endDate)
      };
    });

    res.status(200).json({
      state: 200,
      msg: 'success',
      data: formattedClasses
    });

  } catch (error: any) {
    console.error('Error in getBatchSchedule:', error);
    res.status(500).json({
      state: 500,
      msg: error.message || 'Server Error',
      data: null
    });
  }
};