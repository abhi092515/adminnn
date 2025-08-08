

import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import CoursePdf from '../models/CoursePdf';
import Course from '../models/Course';
import Pdf from '../models/Pdf';
import mongoose, { Schema, Document, PipelineStage} from 'mongoose';


// Zod schemas for validation
const assignPdfToCourseSchema = z.object({
  pdfId: z.string().refine(val => Types.ObjectId.isValid(val), {
    message: 'Invalid PDF ID format'
  }),
  priority: z.number().min(1).int().optional()
});

const updatePdfPrioritySchema = z.object({
  priority: z.number().min(1).int()
});

const reorderPdfsSchema = z.object({
  pdfOrder: z.array(z.object({
    pdfId: z.string().refine(val => Types.ObjectId.isValid(val), {
      message: 'Invalid PDF ID format'
    }),
    priority: z.number().min(1).int()
  }))
});

// @desc    Assign PDF to course
// @route   POST /api/courses/:courseId/pdfs
// @access  Public
// export const assignPdfToCourse = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { courseId } = req.params;

//     // Validate course ID format
//     if (!Types.ObjectId.isValid(courseId)) {
//       res.status(400).json({ state: 400, msg: 'Invalid course ID format.' });
//       return;
//     }

//     // Validate request body
//     const validationResult = assignPdfToCourseSchema.safeParse(req.body);
//     if (!validationResult.success) {
//       res.status(400).json({
//         state: 400,
//         msg: 'Validation failed',
//         errors: validationResult.error.errors.map(err => ({
//           path: err.path.join('.'),
//           msg: err.message
//         }))
//       });
//       return;
//     }

//     const { pdfId, priority } = validationResult.data;

//     // Check if course and PDF exist
//     const [course, pdf] = await Promise.all([
//       Course.findById(courseId),
//       Pdf.findById(pdfId)
//     ]);

//     if (!course) {
//       res.status(404).json({ state: 404, msg: 'Course not found.' });
//       return;
//     }

//     if (!pdf) {
//       res.status(404).json({ state: 404, msg: 'PDF not found.' });
//       return;
//     }

//     // Check if assignment already exists
//     const existingAssignment = await CoursePdf.findOne({
//       course: courseId,
//       pdf: pdfId
//     });

//     if (existingAssignment) {
//       res.status(400).json({ state: 400, msg: 'PDF is already assigned to this course.' });
//       return;
//     }

//     // If no priority provided, set it as the next available priority
//     let finalPriority = priority;
//     if (!finalPriority) {
//       const lastAssignment = await CoursePdf.findOne({ course: courseId })
//         .sort({ priority: -1 })
//         .limit(1);
//       finalPriority = lastAssignment ? lastAssignment.priority + 1 : 1;
//     }

//     // Create assignment
//     const coursePdf = new CoursePdf({
//       course: courseId,
//       pdf: pdfId,
//       priority: finalPriority
//     });

//     await coursePdf.save();

//     // Return populated data
//     const populatedAssignment = await CoursePdf.findById(coursePdf._id)
//       .populate('course', 'title description')
//       .populate({
//         path: 'pdf',
//         populate: [
//           { path: 'mainCategory', select: '_id mainCategoryName' },
//           { path: 'category', select: '_id categoryName' },
//           { path: 'section', select: '_id sectionName' },
//           { path: 'topic', select: '_id topicName' }
//         ]
//       });

//     res.status(201).json({
//       state: 201,
//       msg: 'PDF assigned to course successfully',
//       data: populatedAssignment
//     });
//   } catch (error: any) {
//     console.error('Error assigning PDF to course:', error);
//     res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
//   }
// };
// export const assignPdfToCourse = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { courseId } = req.params;
//     if (!Types.ObjectId.isValid(courseId)) {
//     res.status(400).json({ state: 400, msg: 'Invalid course ID format.' })
//     return ;
//     }

//     const validationResult = assignPdfToCourseSchema.safeParse(req.body);
//     if (!validationResult.success) {
//  res.status(400).json({ state: 400, msg: 'Validation failed', errors: validationResult.error.errors })
//  return ;
//     }

//     const { pdfId } = validationResult.data;

//     // Perform the update. The { new: true } option returns the updated document.
//     const updatedCourse = await Course.findByIdAndUpdate(
//       courseId,
//       { $addToSet: { assignedPdfs: pdfId } }, // Atomically adds the PDF ID if it's not already there
//       { new: true }
//     );

//     if (!updatedCourse) {
//       res.status(404).json({ state: 404, msg: 'Course not found.' })
//       return ;
//     }

//     // ✅ FIX: We no longer call .populate() here, avoiding the error.
//     // The frontend will refetch the fully populated data separately.

//     res.status(200).json({
//       state: 200,
//       msg: 'PDF assigned successfully',
//       data: updatedCourse // Return the successfully updated (but unpopulated) course
//     });

//   } catch (error: any) {
//     console.error('Error assigning PDF to course:', error);
//     res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
//   }
// };
export const assignPdfToCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    // Validate course ID format
    if (!Types.ObjectId.isValid(courseId)) {
      res.status(400).json({ state: 400, msg: 'Invalid course ID format.' });
      return;
    }

    // Validate request body
    const validationResult = assignPdfToCourseSchema.safeParse(req.body);
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

    const { pdfId, priority } = validationResult.data;

    // Check if course and PDF exist
    const [course, pdf] = await Promise.all([
      Course.findById(courseId),
      Pdf.findById(pdfId)
    ]);

    if (!course) {
      res.status(404).json({ state: 404, msg: 'Course not found.' });
      return;
    }

    if (!pdf) {
      res.status(404).json({ state: 404, msg: 'PDF not found.' });
      return;
    }

    // Check if assignment already exists
    const existingAssignment = await CoursePdf.findOne({
      course: courseId,
      pdf: pdfId
    });

    if (existingAssignment) {
      res.status(400).json({ state: 400, msg: 'PDF is already assigned to this course.' });
      return;
    }

    // If no priority provided, set it as the next available priority
    let finalPriority = priority;
    if (!finalPriority) {
      const lastAssignment = await CoursePdf.findOne({ course: courseId })
        .sort({ priority: -1 })
        .limit(1);
      finalPriority = lastAssignment ? lastAssignment.priority + 1 : 1;
    }

    // Create assignment
    const coursePdf = new CoursePdf({
      course: courseId,
      pdf: pdfId,
      priority: finalPriority
    });

    await coursePdf.save();

    // Return populated data
    const populatedAssignment = await CoursePdf.findById(coursePdf._id)
      .populate('course', 'title description')
      .populate({
        path: 'pdf',
        populate: [
          { path: 'mainCategory', select: '_id mainCategoryName' },
          { path: 'category', select: '_id categoryName' },
          { path: 'section', select: '_id sectionName' },
          { path: 'topic', select: '_id topicName' }
        ]
      });

    res.status(201).json({
      state: 201,
      msg: 'PDF assigned to course successfully',
      data: populatedAssignment
    });
  } catch (error: any) {
    console.error('Error assigning PDF to course:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};

// @desc    Get PDFs for a course
// @route   GET /api/courses/:courseId/pdfs
// @access  Public
export const getPdfsForCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const {
      includeInactive = 'false',
      sortBy = 'priority',
      groupBy = 'none' // Parameter to control grouping
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
    }    // If groupBy is 'topic', use aggregation pipeline similar to getClassesByCourse
    if (groupBy === 'topic') {
      const pipeline: any[] = [
        { $match: { _id: new Types.ObjectId(courseId) } },
        {
          $lookup: {
            from: 'coursepdfs',
            let: { courseId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$course', '$$courseId'] },
                  ...(includeInactive !== 'true' && { isActive: true })
                }
              },
              { $sort: { priority: 1, createdAt: -1 } },
              {
                $lookup: {
                  from: 'pdfs',
                  localField: 'pdf',
                  foreignField: '_id',
                  as: 'pdfData',
                  pipeline: [
                    {
                      $lookup: {
                        from: 'maincategories',
                        localField: 'mainCategory',
                        foreignField: '_id',
                        as: 'mainCategoryInfo',
                        pipeline: [{ $project: { _id: 0, id: '$_id', mainCategoryName: 1 } }]
                      }
                    },
                    {
                      $lookup: {
                        from: 'categories',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'categoryInfo',
                        pipeline: [{ $project: { _id: 0, id: '$_id', categoryName: 1 } }]
                      }
                    },
                    {
                      $lookup: {
                        from: 'sections',
                        localField: 'section',
                        foreignField: '_id',
                        as: 'sectionInfo',
                        pipeline: [{ $project: { _id: 0, id: '$_id', sectionName: 1 } }]
                      }
                    },
                    {
                      $lookup: {
                        from: 'topics',
                        localField: 'topic',
                        foreignField: '_id',
                        as: 'topicInfo',
                        pipeline: [{ $project: { _id: 0, id: '$_id', topicName: 1 } }]
                      }
                    },
                    {
                      $addFields: {
                        mainCategory: { $arrayElemAt: ['$mainCategoryInfo', 0] },
                        category: { $arrayElemAt: ['$categoryInfo', 0] },
                        section: { $arrayElemAt: ['$sectionInfo', 0] },
                        topic: { $arrayElemAt: ['$topicInfo', 0] }
                      }
                    },
                    {
                      $project: {
                        _id: 0,
                        id: '$_id',
                        title: 1,
                        description: 1,
                        pdfUrl: 1,
                        uploadPdf: 1,
                        mainCategory: 1,
                        category: 1,
                        section: 1,
                        topic: 1,
                        courseBanner: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        assignedPdfs: 1
                      }
                    }
                  ]
                }
              },
              {
                $addFields: {
                  pdf: { $arrayElemAt: ['$pdfData', 0] }
                }
              },
              {
                $project: {
                  _id: 0,
                  id: '$_id',
                  priority: 1,
                  isActive: 1,
                  addedAt: 1,
                  pdf: 1,
                  createdAt: 1,
                  updatedAt: 1
                }
              }
            ],
            as: 'pdfs'
          }
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
            title: 1,
            pdfs: 1,
            assignedPdfs: 1,
            totalPdfs: { $size: '$pdfs' }
          }
        }
      ];

      const result = await Course.aggregate(pipeline);

      if (!result.length) {
        res.status(404).json({ state: 404, msg: 'Course not found', data: null });
        return;
      }

      const courseData = result[0];
      // Group PDFs by topics similar to how classes are grouped by topics
      const topicMap: { [key: string]: any[] } = {};
      console.log('Course Data:', courseData);

      courseData.pdfs.forEach((pdfItem: any) => {
        const topicName = pdfItem.pdf?.topic?.topicName || 'No Topic';

        if (!topicMap[topicName]) {
          topicMap[topicName] = [];
        }

        topicMap[topicName].push(pdfItem);
      });

      // Convert to array format with topicName and pdfs
      const topicsArray = Object.keys(topicMap).map(topicName => ({
        topicName: topicName,
        pdfs: topicMap[topicName]
      })); res.status(200).json({
        state: 200,
        msg: 'PDFs grouped by topics retrieved successfully',
        data: {
          courseId: courseData.id,
          courseTitle: courseData.title,
          topics: topicsArray,
          totalPdfs: courseData.totalPdfs,
          assignedPdfs: courseData.assignedPdfs || []
        }
      });
      return;
    }    // Original flat list logic without pagination
    const coursePdfs = await (CoursePdf as any).getPdfsForCourse(
      new Types.ObjectId(courseId),
      {
        includeInactive: includeInactive === 'true',
        sortBy: sortBy as string
      }
    );

    // Get the course with assignedPdfs field and populate PDF details
    const courseWithAssignedPdfs = await Course.findById(courseId)
      .select('assignedPdfs title')
      .populate({
        path: 'assignedPdfs',
        model: 'Pdf',
        select: '_id title description uploadPdf image teacherName status isFree',
        populate: [
          { path: 'mainCategory', select: '_id mainCategoryName' },
          { path: 'category', select: '_id categoryName' },
          { path: 'section', select: '_id sectionName' },
          { path: 'topic', select: '_id topicName' }
        ]
      })
      .lean();

    // Transform the populated PDFs to include id instead of _id
    const transformedAssignedPdfs = (courseWithAssignedPdfs?.assignedPdfs || []).map((pdf: any) => ({
      id: pdf._id,
      title: pdf.title,
      description: pdf.description,
      uploadPdf: pdf.uploadPdf,
      image: pdf.image,
      teacherName: pdf.teacherName,
      status: pdf.status,
      isFree: pdf.isFree,
      mainCategory: pdf.mainCategory ? {
        id: pdf.mainCategory._id,
        mainCategoryName: pdf.mainCategory.mainCategoryName
      } : null,
      category: pdf.category ? {
        id: pdf.category._id,
        categoryName: pdf.category.categoryName
      } : null,
      section: pdf.section ? {
        id: pdf.section._id,
        sectionName: pdf.section.sectionName
      } : null,
      topic: pdf.topic ? {
        id: pdf.topic._id,
        topicName: pdf.topic.topicName
      } : null
    }));

    res.status(200).json({
      state: 200,
      msg: 'PDFs retrieved successfully',
      data: {
        pdfs: coursePdfs,
        totalPdfs: coursePdfs.length,
        assignedPdfs: transformedAssignedPdfs
      }
    });
  } catch (error: any) {
    console.error('Error fetching PDFs for course:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};

// @desc    Get courses for a PDF
// @route   GET /api/pdfs/:pdfId/courses
// @access  Public
export const getCoursesForPdf = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pdfId } = req.params;
    const { includeInactive = 'false' } = req.query;

    if (!Types.ObjectId.isValid(pdfId)) {
      res.status(400).json({ state: 400, msg: 'Invalid PDF ID format.' });
      return;
    }

    // Check if PDF exists
    const pdf = await Pdf.findById(pdfId);
    if (!pdf) {
      res.status(404).json({ state: 404, msg: 'PDF not found.' });
      return;
    }

    const coursePdfs = await (CoursePdf as any).getCoursesForPdf(
      new Types.ObjectId(pdfId),
      includeInactive === 'true'
    );

    res.status(200).json({
      state: 200,
      msg: 'Courses retrieved successfully',
      data: coursePdfs
    });
  } catch (error: any) {
    console.error('Error fetching courses for PDF:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};

// @desc    Update PDF priority in course
// @route   PUT /api/courses/:courseId/pdfs/:pdfId/priority
// @access  Public
export const updatePdfPriority = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, pdfId } = req.params;

    if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(pdfId)) {
      res.status(400).json({ state: 400, msg: 'Invalid course or PDF ID format.' });
      return;
    }

    // Validate request body
    const validationResult = updatePdfPrioritySchema.safeParse(req.body);
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

    const coursePdf = await CoursePdf.findOne({
      course: courseId,
      pdf: pdfId
    });

    if (!coursePdf) {
      res.status(404).json({ state: 404, msg: 'PDF assignment not found.' });
      return;
    }

    coursePdf.priority = priority;
    await coursePdf.save();

    const updatedAssignment = await CoursePdf.findById(coursePdf._id)
      .populate('course', 'title')
      .populate('pdf', 'title description');

    res.status(200).json({
      state: 200,
      msg: 'Priority updated successfully',
      data: updatedAssignment
    });
  } catch (error: any) {
    console.error('Error updating PDF priority:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};

// @desc    Reorder PDFs in a course
// @route   PUT /api/courses/:courseId/pdfs/reorder
// @access  Public
export const reorderPdfs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!Types.ObjectId.isValid(courseId)) {
      res.status(400).json({ state: 400, msg: 'Invalid course ID format.' });
      return;
    }

    // Validate request body
    const validationResult = reorderPdfsSchema.safeParse(req.body);
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

    const { pdfOrder } = validationResult.data;

    // Convert string IDs to ObjectIds
    const pdfIdPriorityMap = pdfOrder.map(item => ({
      pdfId: new Types.ObjectId(item.pdfId),
      priority: item.priority
    }));

    // Use the static method to reorder priorities
    await (CoursePdf as any).reorderPriorities(
      new Types.ObjectId(courseId),
      pdfIdPriorityMap
    );

    res.status(200).json({
      state: 200,
      msg: 'PDFs reordered successfully'
    });
  } catch (error: any) {
    console.error('Error reordering PDFs:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};

// @desc    Remove PDF from course
// @route   DELETE /api/courses/:courseId/pdfs/:pdfId
// @access  Public
export const removePdfFromCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, pdfId } = req.params;

    if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(pdfId)) {
      res.status(400).json({ state: 400, msg: 'Invalid course or PDF ID format.' });
      return;
    }

    const result = await CoursePdf.findOneAndDelete({
      course: courseId,
      pdf: pdfId
    });

    if (!result) {
      res.status(404).json({ state: 404, msg: 'PDF assignment not found.' });
      return;
    }

    res.status(200).json({
      state: 200,
      msg: 'PDF removed from course successfully'
    });
  } catch (error: any) {
    console.error('Error removing PDF from course:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};

// @desc    Toggle PDF status in course
// @route   PATCH /api/courses/:courseId/pdfs/:pdfId/toggle-status
// @access  Public
export const togglePdfStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, pdfId } = req.params;

    if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(pdfId)) {
      res.status(400).json({ state: 400, msg: 'Invalid course or PDF ID format.' });
      return;
    }

    const coursePdf = await CoursePdf.findOne({
      course: courseId,
      pdf: pdfId
    });

    if (!coursePdf) {
      res.status(404).json({ state: 404, msg: 'PDF assignment not found.' });
      return;
    }

    coursePdf.isActive = !coursePdf.isActive;
    await coursePdf.save();

    res.status(200).json({
      state: 200,
      msg: 'PDF status toggled successfully',
      data: {
        _id: coursePdf._id,
        isActive: coursePdf.isActive,
        updatedAt: coursePdf.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Error toggling PDF status:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};

// @desc    Get assigned PDF URLs for a course (from assignedPdfs field)
// @route   GET /api/courses/:courseId/assigned-pdfs
// @access  Public
export const getAssignedPdfsForCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!Types.ObjectId.isValid(courseId)) {
      res.status(400).json({ state: 400, msg: 'Invalid course ID format.' });
      return;
    }

    // Use aggregation pipeline to get course with populated assigned PDFs
    const pipeline = [
      { $match: { _id: new Types.ObjectId(courseId) } },
      {
        $lookup: {
          from: 'pdfs',
          localField: 'assignedPdfs',
          foreignField: '_id',
          as: 'assignedPdfsData',
          pipeline: [
            {
              $lookup: {
                from: 'maincategories',
                localField: 'mainCategory',
                foreignField: '_id',
                as: 'mainCategoryInfo',
                pipeline: [{ $project: { _id: 0, id: '$_id', mainCategoryName: 1 } }]
              }
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'categoryInfo',
                pipeline: [{ $project: { _id: 0, id: '$_id', categoryName: 1 } }]
              }
            },
            {
              $lookup: {
                from: 'sections',
                localField: 'section',
                foreignField: '_id',
                as: 'sectionInfo',
                pipeline: [{ $project: { _id: 0, id: '$_id', sectionName: 1 } }]
              }
            },
            {
              $lookup: {
                from: 'topics',
                localField: 'topic',
                foreignField: '_id',
                as: 'topicInfo',
                pipeline: [{ $project: { _id: 0, id: '$_id', topicName: 1 } }]
              }
            },
            {
              $addFields: {
                mainCategory: { $arrayElemAt: ['$mainCategoryInfo', 0] },
                category: { $arrayElemAt: ['$categoryInfo', 0] },
                section: { $arrayElemAt: ['$sectionInfo', 0] },
                topic: { $arrayElemAt: ['$topicInfo', 0] }
              }
            },
            {
              $project: {
                _id: 0,
                id: '$_id',
                title: 1,
                description: 1,
                uploadPdf: 1,
                image: 1,
                teacherName: 1,
                status: 1,
                isFree: 1,
                mainCategory: 1,
                category: 1,
                section: 1,
                topic: 1
              }
            }
          ]
        }
      },
      {
        $project: {
          _id: 0,
          courseId: '$_id',
          courseTitle: '$title',
          assignedPdfs: '$assignedPdfsData',
          totalAssignedPdfs: { $size: '$assignedPdfsData' }
        }
      }
    ];

    const result = await Course.aggregate(pipeline);

    if (!result.length) {
      res.status(404).json({ state: 404, msg: 'Course not found.' });
      return;
    } const courseData = result[0];    // Group assigned PDFs by topics
    const topicMap: { [key: string]: any[] } = {};

    courseData.assignedPdfs.forEach((pdfData: any) => {
      const topicName = pdfData.topic?.topicName || 'No Topic';

      if (!topicMap[topicName]) {
        topicMap[topicName] = [];
      }

      // Wrap each PDF in an object with pdf property
      topicMap[topicName].push({
        pdf: pdfData
      });
    });

    // Convert to array format with topicName and pdfs
    const topicsArray = Object.keys(topicMap).map(topicName => ({
      topicName: topicName,
      pdfs: topicMap[topicName]
    }));

    res.status(200).json({
      state: 200,
      msg: 'Assigned PDFs grouped by topics retrieved successfully',
      data: {
        courseId: courseData.courseId,
        courseTitle: courseData.courseTitle,
        topics: topicsArray,
        totalAssignedPdfs: courseData.totalAssignedPdfs
      }
    });

  } catch (error: any) {
    console.error('Error fetching assigned PDFs for course:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};

export const getAssignedPdfsForCourseV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { groupBy = 'none' } = req.query;

    if (!Types.ObjectId.isValid(courseId)) {
      res.status(400).json({ state: 400, msg: 'Invalid course ID format.' });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ state: 404, msg: 'Course not found.' });
      return;
    }

    const pipeline: PipelineStage[] = [
      { $match: { course: new Types.ObjectId(courseId) } },
      { $lookup: { from: 'pdfs', localField: 'pdf', foreignField: '_id', as: 'pdfDetails' } },
      { $unwind: '$pdfDetails' },
      { $lookup: { from: 'topics', localField: 'pdfDetails.topic', foreignField: '_id', as: 'topicDetails' } },
      // ... (your other lookups for category, etc., can remain here)
      {
        $project: {
          _id: 0, // Exclude the default _id from CoursePdf
          id: '$pdfDetails._id',
          title: '$pdfDetails.title',
          description: '$pdfDetails.description',
          uploadPdf: '$pdfDetails.uploadPdf',
          image: '$pdfDetails.image',
          status: '$pdfDetails.status',
          isFree: '$pdfDetails.isFree',
          priority: '$priority',
          topic: { $arrayElemAt: ['$topicDetails', 0] } // Project the topic object
        }
      },
      { $sort: { priority: 1 } }
    ];

    const pdfs = await CoursePdf.aggregate(pipeline);

    if (groupBy === 'topic') {
      const topicMap: { [key: string]: any[] } = {};

      pdfs.forEach((pdfItem: any) => {
        // ✅ CORRECTED LOGIC: Access topic directly from pdfItem
        const topicName = pdfItem.topic?.topicName || 'Uncategorized';

        if (!topicMap[topicName]) {
          topicMap[topicName] = [];
        }
        topicMap[topicName].push(pdfItem);
      });

      const topicsArray = Object.keys(topicMap).map(topicName => ({
        topicName: topicName,
        pdfs: topicMap[topicName]
      }));

      res.status(200).json({
        state: 200,
        msg: 'PDFs grouped by topics retrieved successfully',
        data: {
          courseId: course._id,
          courseTitle: course.title,
          topics: topicsArray,
          totalPdfs: pdfs.length
        }
      });
    } else {
      // This is the response for when you are NOT grouping
      res.status(200).json({
        state: 200,
        msg: 'Assigned PDFs retrieved successfully',
        data: {
          courseId: course._id,
          courseTitle: course.title,
          pdfs: pdfs, // Return the flat list of PDFs
          totalPdfs: pdfs.length
        }
      });
    }
  } catch (error: any) {
    console.error('Error fetching assigned PDFs for course:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};

// @desc    Get unassigned PDF URLs for a course 
// @route   GET /api/courses/:courseId/available-pdfs
// @access  Public
export const getAvailablePdfsForCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params
    console.log(courseId, 'courseId')

    const assignedPdfs = await CoursePdf.find({ course: courseId }).select('pdf')
    const assignedPdfIds = assignedPdfs.map((pdf: any) => pdf.pdf)

    const matchConditions: any = {
      _id: { $nin: assignedPdfIds }
    }

    const aggregationPipeline: PipelineStage[] = [
      {
        $match: matchConditions
      },
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
      {
        $project: {
          // _id: 1,
          id:  '$_id',
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
    ]

    const countPipeline: PipelineStage[] = [
      {
        $match: matchConditions
      },
      {
        $count: 'totalCount'
      }
    ]

    const [availablePdfs, countResult] = await Promise.all([
      Pdf.aggregate(aggregationPipeline),
      Pdf.aggregate(countPipeline)
    ]);



    const totalAvailable = countResult.length > 0 ? countResult[0].total : 0;

    console.log('DEBUG: Found', availablePdfs.length, 'available classes out of', totalAvailable, 'total');
    res.status(200).json({
      state: 200,
      msg: 'Available classes retrieved successfully',
      data: {
        pdfs: availablePdfs,
      }
    });
  }

  catch (error: any) {
    console.error('Error fetching available PDFs for course:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }



}