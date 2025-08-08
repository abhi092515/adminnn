import { Request, Response } from 'express';
import { Types } from 'mongoose';
import CourseClass, { ICourseClassModel } from '../models/CourseClass';
import Course from '../models/Course';
import Class from '../models/Class';
import { z } from 'zod';

// Zod schemas for validation
const assignClassSchema = z.object({
  classId: z.string()
    .min(1, 'Class ID is required')
    .refine(val => val !== null && val !== undefined && val.trim() !== '', 'Class ID cannot be null or empty')
    .refine(val => Types.ObjectId.isValid(val), 'Class ID must be a valid ObjectId'),
  priority: z.number().int().min(1).optional()
});

const updatePrioritySchema = z.object({
  priority: z.number().int().min(1, 'Priority must be at least 1')
});

const reorderClassesSchema = z.object({
  classOrder: z.array(z.object({
    classId: z.string().min(1, 'Class ID is required'),
    priority: z.number().int().min(1, 'Priority must be at least 1')
  })).min(1, 'At least one class order is required')
});

// @desc    Assign a class to a course
// @route   POST /api/courses/:courseId/classes
// @access  Public
export const assignClassToCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    // Additional validation for courseId parameter
    if (!courseId || courseId.trim() === '') {
      res.status(400).json({ state: 400, msg: 'Course ID is required in URL parameters.' });
      return;
    }

    // Validate request body
    const validationResult = assignClassSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        state: 400,
        msg: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          path: err.path.join('.'),
          msg: err.message
        }))
      });
      return;
    }

    const { classId, priority } = validationResult.data;

    // Validate IDs
    if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(classId)) {
      res.status(400).json({ state: 400, msg: 'Invalid course or class ID format.' });
      return;
    }

    // Additional null/undefined checks
    if (!courseId || !classId) {
      res.status(400).json({ state: 400, msg: 'Both course ID and class ID are required and cannot be null.' });
      return;
    }

    // Check if course and class exist
    const [course, classItem] = await Promise.all([
      Course.findById(courseId),
      Class.findById(classId)
    ]);

    if (!course) {
      res.status(404).json({ state: 404, msg: 'Course not found.' });
      return;
    }

    if (!classItem) {
      res.status(404).json({ state: 404, msg: 'Class not found.' });
      return;
    }

    // Check if assignment already exists
    const existingAssignment = await CourseClass.findOne({ course: courseId, class: classId });
    if (existingAssignment) {
      res.status(400).json({ state: 400, msg: 'Class is already assigned to this course.' });
      return;
    }

    // If no priority provided, set it as the next available priority
    let finalPriority = priority;
    if (!finalPriority) {
      const lastAssignment = await CourseClass.findOne({ course: courseId })
        .sort({ priority: -1 })
        .limit(1);
      finalPriority = lastAssignment ? lastAssignment.priority + 1 : 1;
    }

    // Create assignment
    const courseClass = new CourseClass({
      course: courseId,
      class: classId,
      priority: finalPriority
    });

    await courseClass.save();

    // Return populated data
    const populatedAssignment = await CourseClass.findById(courseClass._id)
      .populate('course', 'title description')
      .populate({
        path: 'class',
        populate: [
          { path: 'mainCategory', select: '_id mainCategoryName' },
          { path: 'category', select: '_id categoryName' },
          { path: 'section', select: '_id sectionName' },
          { path: 'topic', select: '_id topicName' }
        ]
      });

    res.status(201).json({
      state: 201,
      msg: 'Class assigned to course successfully',
      data: populatedAssignment
    });
  } catch (error: any) {
    console.error('Error assigning class to course:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};

// @desc    Get classes for a course using static method
// @route   GET /api/courses/:courseId/classes
// @access  Public
export const getClassesForCourse = async (req: Request, res: Response): Promise<void> => {
  try { 
    
    const { courseId } = req.params;
    const {
      sortBy = 'priority'
    } = req.query;

    if (!Types.ObjectId.isValid(courseId)) {
      res.status(400).json({ state: 400, msg: 'Invalid course ID format.' });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ state: 404, msg: 'Course not found.' });
      return;
    }
    console.log('DEBUG: Using aggregation pipeline for courseId:', courseId);

    const aggregationPipeline: any[] = [
      {
        $match: {
          course: new Types.ObjectId(courseId)
        }
      },
      // Lookup class details
      {
        $lookup: {
          from: 'classes',
          localField: 'class',
          foreignField: '_id',
          as: 'classDetails'
        }
      },
      // Unwind class details
      {
        $unwind: {
          path: '$classDetails',
          preserveNullAndEmptyArrays: false // Exclude if class doesn't exist
        }
      },
      // Lookup mainCategory
      {
        $lookup: {
          from: 'maincategories',
          localField: 'classDetails.mainCategory',
          foreignField: '_id',
          as: 'mainCategoryDetails'
        }
      },
      // Lookup category
      {
        $lookup: {
          from: 'categories',
          localField: 'classDetails.category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      // Lookup section
      {
        $lookup: {
          from: 'sections',
          localField: 'classDetails.section',
          foreignField: '_id',
          as: 'sectionDetails'
        }
      },
      // Lookup topic
      {
        $lookup: {
          from: 'topics',
          localField: 'classDetails.topic',
          foreignField: '_id',
          as: 'topicDetails'
        }
      },      // Project final structure with flattened class details
      {
        $project: {
          // CourseClass fields
          course: 1,
          priority: 1,
          isActive: 1,
          addedAt: 1,
          classCreatedAt: '$createdAt',
          classUpdatedAt: '$updatedAt',

          // Flattened class fields at root level
          classId: '$classDetails._id',
          title: '$classDetails.title',
          description: '$classDetails.description',
          teacherName: '$classDetails.teacherName',
          duration: '$classDetails.duration',
          startDate: '$classDetails.startDate',
          endDate: '$classDetails.endDate',
          isLive: '$classDetails.isLive',
          isFree: '$classDetails.isFree',
          isShort: '$classDetails.isShort',
          isTopper: '$classDetails.isTopper',
          status: '$classDetails.status',
          image: '$classDetails.image',
          link: '$classDetails.link',
          class_link: '$classDetails.class_link',
          mp4Recordings: '$classDetails.mp4Recordings',
          viewCount: '$classDetails.viewCount',
          uniqueViewCount: '$classDetails.uniqueViewCount',

          // Populated category fields
          mainCategory: {
            $cond: {
              if: { $gt: [{ $size: '$mainCategoryDetails' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$mainCategoryDetails._id', 0] },
                mainCategoryName: { $arrayElemAt: ['$mainCategoryDetails.mainCategoryName', 0] }
              },
              else: null
            }
          },
          category: {
            $cond: {
              if: { $gt: [{ $size: '$categoryDetails' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$categoryDetails._id', 0] },
                categoryName: { $arrayElemAt: ['$categoryDetails.categoryName', 0] }
              },
              else: null
            }
          },
          section: {
            $cond: {
              if: { $gt: [{ $size: '$sectionDetails' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$sectionDetails._id', 0] },
                sectionName: { $arrayElemAt: ['$sectionDetails.sectionName', 0] }
              },
              else: null
            }
          },
          topic: {
            $cond: {
              if: { $gt: [{ $size: '$topicDetails' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$topicDetails._id', 0] },
                topicName: { $arrayElemAt: ['$topicDetails.topicName', 0] }
              },
              else: null
            }
          }
        }
      },
      {
        $sort: {
          priority: 1,
          createdAt: -1
        }
      }
    ];

    console.log('DEBUG: Aggregation pipeline created');

    const classes = await (CourseClass as any).aggregate(aggregationPipeline); console.log('DEBUG: Aggregation returned:', classes.length, 'classes');
    if (classes.length > 0) {
      console.log('DEBUG: First class structure:', {
        courseClassId: classes[0].courseClassId,
        classId: classes[0]._id,
        title: classes[0].title,
        priority: classes[0].priority,
        isActive: classes[0].isActive,
        topicName: classes[0].topic?.topicName
      });
    }// Group classes by topic name
    const groupedClasses = classes.reduce((acc: any, classItem: any) => {
      const topicName = classItem.topic?.topicName || 'Uncategorized';

      if (!acc[topicName]) {
        acc[topicName] = {
          topicName: topicName,
          topicId: classItem.topic?._id || null,
          classes: []
        };
      }

      acc[topicName].classes.push(classItem);
      return acc;
    }, {});

    // Convert grouped object to array and sort by topic name
    const groupedClassesArray = Object.values(groupedClasses).sort((a: any, b: any) =>
      a.topicName.localeCompare(b.topicName)
    );

    console.log('DEBUG: Classes grouped by topic. Found', groupedClassesArray.length, 'topic groups');

    res.status(200).json({
      state: 200,
      msg: 'Classes retrieved and grouped by topic successfully',
      data: {
        course: {
          id: course._id,
          title: course.title,
          isLive: course.isLive,
          isRecorded: course.isRecorded,
          isFree: course.isFree,
          mainCategory: course.mainCategory,
          category: course.category
        },
        classes: groupedClassesArray,

      }
    });
  } catch (error: any) {
    console.error('Error fetching classes for course:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};

// @desc    Get courses for a class using static method
// @route   GET /api/classes/:classId/courses
// @access  Public
export const getCoursesForClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;
    const { includeInactive = 'false' } = req.query;

    if (!Types.ObjectId.isValid(classId)) {
      res.status(400).json({ state: 400, msg: 'Invalid class ID format.' });
      return;
    }

    // Check if class exists
    const classItem = await Class.findById(classId);
    if (!classItem) {
      res.status(404).json({ state: 404, msg: 'Class not found.' });
      return;
    }

    // Use the static method from CourseClass model
    const courses = await CourseClass.getCoursesForClass(
      new Types.ObjectId(classId),
      includeInactive === 'true'
    );

    res.status(200).json({
      state: 200,
      msg: 'Courses retrieved successfully',
      data: courses
    });
  } catch (error: any) {
    console.error('Error fetching courses for class:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};

// @desc    Update class priority in course
// @route   PUT /api/courses/:courseId/classes/:classId/priority
// @access  Public
export const updateClassPriority = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, classId } = req.params;

    // Validate request body
    const validationResult = updatePrioritySchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        state: 400,
        msg: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          path: err.path.join('.'),
          msg: err.message
        }))
      });
      return;
    }

    const { priority } = validationResult.data;

    if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(classId)) {
      res.status(400).json({ state: 400, msg: 'Invalid course or class ID format.' });
      return;
    }

    const courseClass = await CourseClass.findOne({ course: courseId, class: classId });
    if (!courseClass) {
      res.status(404).json({ state: 404, msg: 'Class assignment not found.' });
      return;
    }

    courseClass.priority = priority;
    await courseClass.save();

    // Return updated assignment with populated data
    const updatedAssignment = await CourseClass.findById(courseClass._id)
      .populate('course', 'title')
      .populate('class', 'title description');

    res.status(200).json({
      state: 200,
      msg: 'Priority updated successfully',
      data: updatedAssignment
    });
  } catch (error: any) {
    console.error('Error updating class priority:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};

// @desc    Reorder multiple classes in a course using static method
// @route   PUT /api/courses/:courseId/classes/reorder
// @access  Public
export const reorderClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    // Validate request body
    const validationResult = reorderClassesSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        state: 400,
        msg: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          path: err.path.join('.'),
          msg: err.message
        }))
      });
      return;
    }

    const { classOrder } = validationResult.data;

    if (!Types.ObjectId.isValid(courseId)) {
      res.status(400).json({ state: 400, msg: 'Invalid course ID format.' });
      return;
    }

    // Validate all class IDs
    for (const item of classOrder) {
      if (!Types.ObjectId.isValid(item.classId)) {
        res.status(400).json({ state: 400, msg: `Invalid class ID format: ${item.classId}` });
        return;
      }
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ state: 404, msg: 'Course not found.' });
      return;
    }

    // Convert classOrder to the format expected by the static method
    const classIdPriorityMap = classOrder.map(item => ({
      classId: new Types.ObjectId(item.classId),
      priority: item.priority
    }));

    // Use the static method to reorder priorities with transaction safety
    await CourseClass.reorderPriorities(new Types.ObjectId(courseId), classIdPriorityMap);

    // Return updated classes
    const updatedClasses = await CourseClass.getClassesForCourse(
      new Types.ObjectId(courseId),
      { sortBy: 'priority' }
    );

    res.status(200).json({
      state: 200,
      msg: 'Classes reordered successfully',
      data: updatedClasses
    });
  } catch (error: any) {
    console.error('Error reordering classes:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};

// @desc    Remove class from course
// @route   DELETE /api/courses/:courseId/classes/:classId
// @access  Public
export const removeClassFromCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, classId } = req.params;

    if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(classId)) {
      res.status(400).json({ state: 400, msg: 'Invalid course or class ID format.' });
      return;
    }

    const result = await CourseClass.findOneAndDelete({ course: courseId, class: classId });
    if (!result) {
      res.status(404).json({ state: 404, msg: 'Class assignment not found.' });
      return;
    }

    res.status(200).json({
      state: 200,
      msg: 'Class removed from course successfully',
      data: {
        removedAssignment: {
          course: result.course,
          class: result.class,
          priority: result.priority
        }
      }
    });
  } catch (error: any) {
    console.error('Error removing class from course:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};

// @desc    Toggle class assignment status
// @route   PATCH /api/courses/:courseId/classes/:classId/toggle
// @access  Public
export const toggleClassAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, classId } = req.params;

    if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(classId)) {
      res.status(400).json({ state: 400, msg: 'Invalid course or class ID format.' });
      return;
    }

    const courseClass = await CourseClass.findOne({ course: courseId, class: classId });
    if (!courseClass) {
      res.status(404).json({ state: 404, msg: 'Class assignment not found.' });
      return;
    }

    courseClass.isActive = !courseClass.isActive;
    await courseClass.save();

    res.status(200).json({
      state: 200,
      msg: `Class assignment ${courseClass.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        _id: courseClass._id,
        course: courseClass.course,
        class: courseClass.class,
        isActive: courseClass.isActive,
        priority: courseClass.priority
      }
    });
  } catch (error: any) {
    console.error('Error toggling class assignment:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};

// @desc    Get available classes for assignment to a course (excludes already assigned classes)
// @route   GET /api/courses/:courseId/available-classes
// @access  Public
export const getAvailableClassesForCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const {
      includeInactive = 'true',
      sortBy = 'title'
    } = req.query;

    if (!Types.ObjectId.isValid(courseId)) {
      res.status(400).json({ state: 400, msg: 'Invalid course ID format.' });
      return;
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ state: 404, msg: 'Course not found.' });
      return;
    }

    // Get all assigned class IDs for this course
    const assignedClasses = await CourseClass.find({ course: courseId }).select('class');
    const assignedClassIds = assignedClasses.map(assignment => assignment.class);

    console.log('DEBUG: Found', assignedClassIds.length, 'assigned classes for course', courseId);

    // Build match conditions for classes
    const matchConditions: any = {
      _id: { $nin: assignedClassIds }, // Exclude already assigned classes
      status: 'active' // Only include active classes
    };

    // If includeInactive is false, we already filter by status: 'active'
    // If includeInactive is true, we can include inactive classes too
    if (includeInactive === 'true') {
      delete matchConditions.status; // Remove status filter to include all
    }    // Build sort options
    const sortOptions: any = {};
    if (sortBy === 'title') {
      sortOptions.title = 1;
    } else if (sortBy === 'recent') {
      sortOptions.createdAt = -1;
    } else if (sortBy === 'priority') {
      sortOptions.priority = 1;
      sortOptions.createdAt = -1;
    }

    // Aggregation pipeline to get available classes with populated data
    const aggregationPipeline = [
      { $match: matchConditions },
      // Lookup mainCategory
      {
        $lookup: {
          from: 'maincategories',
          localField: 'mainCategory',
          foreignField: '_id',
          as: 'mainCategoryDetails'
        }
      },
      // Lookup category
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      // Lookup section
      {
        $lookup: {
          from: 'sections',
          localField: 'section',
          foreignField: '_id',
          as: 'sectionDetails'
        }
      },
      // Lookup topic
      {
        $lookup: {
          from: 'topics',
          localField: 'topic',
          foreignField: '_id',
          as: 'topicDetails'
        }
      },
      // Project final structure
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          teacherName: 1,
          duration: 1,
          startDate: 1,
          endDate: 1,
          isLive: 1,
          isFree: 1,
          isShort: 1,
          isTopper: 1,
          status: 1,
          priority: 1,
          image: 1,
          link: 1,
          createdAt: 1,
          updatedAt: 1,
          mainCategory: {
            $cond: {
              if: { $gt: [{ $size: '$mainCategoryDetails' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$mainCategoryDetails._id', 0] },
                mainCategoryName: { $arrayElemAt: ['$mainCategoryDetails.mainCategoryName', 0] }
              },
              else: null
            }
          },
          category: {
            $cond: {
              if: { $gt: [{ $size: '$categoryDetails' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$categoryDetails._id', 0] },
                categoryName: { $arrayElemAt: ['$categoryDetails.categoryName', 0] }
              },
              else: null
            }
          },
          section: {
            $cond: {
              if: { $gt: [{ $size: '$sectionDetails' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$sectionDetails._id', 0] },
                sectionName: { $arrayElemAt: ['$sectionDetails.sectionName', 0] }
              },
              else: null
            }
          },
          topic: {
            $cond: {
              if: { $gt: [{ $size: '$topicDetails' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$topicDetails._id', 0] },
                topicName: { $arrayElemAt: ['$topicDetails.topicName', 0] }
              },
              else: null
            }
          }
        }
      },
      { $sort: sortOptions }
    ];

    // Count total available classes
    const countPipeline = [
      { $match: matchConditions },
      { $count: 'total' }
    ]; console.log('DEBUG: Executing aggregation for available classes');

    const [availableClasses, countResult] = await Promise.all([
      Class.aggregate(aggregationPipeline),
      Class.aggregate(countPipeline)
    ]);

    const totalAvailable = countResult.length > 0 ? countResult[0].total : 0;

    console.log('DEBUG: Found', availableClasses.length, 'available classes out of', totalAvailable, 'total'); res.status(200).json({
      state: 200,
      msg: 'Available classes retrieved successfully',
      data: {
        course: {
          id: course._id,
          title: course.title
        },
        availableClasses,
        summary: {
          totalAssigned: assignedClassIds.length,
          totalAvailable,
          totalClasses: assignedClassIds.length + totalAvailable
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching available classes for course:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};
