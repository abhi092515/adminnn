// src/controllers/classController.ts
import { Request, Response } from 'express';
import { Types, Document } from 'mongoose';
import Class, { IClass } from '../models/Class';
import MainCategory from '../models/MainCategory'; // For validation
import Category from '../models/Category';         // For validation
import Section from '../models/Section';           // For validation
import Topic from '../models/Topic';
import Course from '../models/Course';             // For course validation
import CourseClass from '../models/CourseClass';   // For course-class assignments
import mongoose from 'mongoose';              // For validation

// Import Zod and schemas
import { z } from 'zod';
import { createClassSchema, updateClassSchema } from '../schemas/classSchemas';

// S3 upload imports
import { uploadFileToS3, deleteFileFromS3, extractKeyFromS3Url } from '../config/s3Upload'; // Adjust the path as needed
import * as fsPromises from 'fs/promises'; // Use fs/promises for async file operations
import fs, { link } from 'fs'; // Import 'fs' specifically for existsSync
import multer from 'multer'; // Import Multer to catch Multer errors

// Extend the Request type to include the file property from Multer
declare module 'express' {
  export interface Request {
    file?: Express.Multer.File;
  }
}

// Helper function to check if a referenced ID is valid and exists
const validateReference = async (
  model: any,
  id: string | Types.ObjectId,
  modelName: string,
  res: Response
): Promise<boolean> => {
  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ state: 400, msg: `Invalid ${modelName} ID provided.` });
    return false;
  }
  const exists = await model.findById(id);
  if (!exists) {
    res.status(404).json({ state: 404, msg: `${modelName} not found.` });
    return false;
  }
  return true;
};

// @desc    Create a new class
// @route   POST /api/classes
// @access  Public
export const createClass = async (req: Request, res: Response): Promise<void> => {
  let localFilePath: string | undefined; // Store the path to the locally saved file by Multer for cleanup

  try {
    // 1. Zod validation for text fields in req.body
    const validationResult = createClassSchema.safeParse(req.body);

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

    const validatedData = validationResult.data;    // 2. Validate relationships
    if (!(await validateReference(MainCategory, validatedData.mainCategory, 'Main Category', res))) return;
    if (!(await validateReference(Category, validatedData.category, 'Category', res))) return;
    if (!(await validateReference(Section, validatedData.section, 'Section', res))) return;
    if (!(await validateReference(Topic, validatedData.topic, 'Topic', res))) return;

    // 3. Check for existing class title (assuming title should be unique)
    const existingClass = await Class.findOne({ title: validatedData.title });
    if (existingClass) {
      res.status(400).json({ state: 400, msg: 'A class with this title already exists.' });
      return;
    }

    let s3ImageUrl: string | undefined; // Variable to store the S3 URL

    // 4. Handle file upload if a file was provided by Multer
    if (req.file) {
      localFilePath = req.file.path; // Store the local file path for cleanup
      try {
        const fileBuffer = await fsPromises.readFile(localFilePath); // Read the file into a buffer
        const { originalname, mimetype } = req.file;

        // Generate a unique filename for S3, nested under 'classes/' folder
        const fileNameForS3 = `classes/${Date.now()}-${originalname.replace(/\s/g, '_')}`;
        s3ImageUrl = await uploadFileToS3(fileBuffer, fileNameForS3, mimetype);
        console.log(`Class image uploaded to S3: ${s3ImageUrl}`); // Log the S3 URL for debugging
      } catch (uploadError) {
        console.error('Error uploading class image to S3:', uploadError);
        res.status(500).json({ state: 500, msg: 'Failed to upload class image.' });
        return; // Stop execution if S3 upload fails
      }
    }

    // 5. Create new class instance, assigning the S3 URL to the 'image' field
    const newClass: IClass = new Class({
      ...validatedData,
      image: s3ImageUrl, // Assign the S3 URL to the 'image' field
    });

    const createdClass = await newClass.save();    // 6. Populate all referenced fields for the response
    const populatedClass = await Class.findById(createdClass._id)
      .populate('mainCategory', '_id mainCategoryName')
      .populate('category', '_id categoryName')
      .populate('section', '_id sectionName')
      .populate('topic', '_id topicName');

    res.status(201).json({
      state: 201,
      msg: 'Class created successfully',
      data: populatedClass
    });
  } catch (error: any) {
    console.error('Error creating class:', error); // Log the full error

    if (error instanceof multer.MulterError) {
      res.status(400).json({ state: 400, msg: `File upload error: ${error.message}` });
      return;
    }
    if (error.code === 11000) { // Duplicate key error from MongoDB unique index
      res.status(400).json({ state: 400, msg: 'Duplicate key error: Class Title must be unique.' });
      return;
    }
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  } finally {
    // IMPORTANT: Clean up the locally saved file by Multer regardless of success or failure
    // Use fs.existsSync from the regular 'fs' module
    if (localFilePath && fs.existsSync(localFilePath)) {
      try {
        await fsPromises.unlink(localFilePath); // Use fsPromises.unlink for async deletion
      } catch (err) {
        console.error('Error deleting local class image file:', err);
      }
    }
  }
};

// @desc    Get all classes
// @route   GET /api/classes
// @access  Public
export const getClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const classes = await Class.find({})
      .populate('mainCategory', '_id mainCategoryName')
      .populate('category', '_id categoryName')
      .populate('section', '_id sectionName')
      .populate('topic', '_id topicName');

    if (classes.length > 0) {
      res.status(200).json({
        state: 200,
        msg: 'success',
        data: classes
      });
    } else {
      res.status(200).json({
        state: 200,
        msg: 'No classes found',
        data: []
      });
    }
  } catch (error: any) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};

// @desc    Get a single class by ID
// @route   GET /api/classes/:id
// @access  Public
export const getClassById = async (req: Request, res: Response): Promise<void> => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('mainCategory', '_id mainCategoryName')
      .populate('category', '_id categoryName')
      .populate('section', '_id sectionName')
      .populate('topic', '_id topicName');

    if (classItem) {
      res.status(200).json({
        state: 200,
        msg: 'success',
        data: classItem
      });
    } else {
      res.status(404).json({ state: 404, msg: 'Class not found' });
    }
  } catch (error: any) {
    console.error('Error fetching class by ID:', error);
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      res.status(400).json({ state: 400, msg: 'Invalid Class ID format.' });
    } else {
      res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
  }
};

// @desc    Update a class
// @route   PUT /api/classes/:id
// @access  Public
export const updateClass = async (req: Request, res: Response): Promise<void> => {
  let oldImageUrl: string | undefined; // To store the old image URL for potential deletion
  let localFilePath: string | undefined; // Store the path to the locally saved file for cleanup

  try {
    // 1. Zod validation for update
    const validationResult = updateClassSchema.safeParse(req.body);

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

    const updates = validationResult.data;

    const classItem: IClass | null = await Class.findById(req.params.id);

    if (!classItem) {
      res.status(404).json({ state: 404, msg: 'Class not found' });
      return;
    }

    // Store the old image URL before potential update (for S3 deletion later)
    oldImageUrl = classItem.image; // Use 'image' field from the model    // Validate relationships if they are being updated
    if (updates.mainCategory && !(await validateReference(MainCategory, updates.mainCategory, 'Main Category', res))) return;
    if (updates.category && !(await validateReference(Category, updates.category, 'Category', res))) return;
    if (updates.section && !(await validateReference(Section, updates.section, 'Section', res))) return; if (updates.topic && !(await validateReference(Topic, updates.topic, 'Topic', res))) return;

    // Check for duplicate title if it's being changed
    if (updates.title && updates.title !== classItem.title) {
      const existingClassWithNewTitle = await Class.findOne({ title: updates.title });
      if (existingClassWithNewTitle && !(classItem._id as Types.ObjectId).equals(existingClassWithNewTitle._id as Types.ObjectId)) {
        res.status(400).json({ state: 400, msg: 'A class with this title already exists.' });
        return;
      }
    }

    let s3ImageUrl: string | undefined = classItem.image; // Default to current image URL

    // Handle file upload if a NEW file was provided by Multer
    if (req.file) {
      localFilePath = req.file.path; // Store local file path for cleanup
      try {
        const fileBuffer = await fsPromises.readFile(localFilePath);
        const { originalname, mimetype } = req.file;

        const fileNameForS3 = `classes/${Date.now()}-${originalname.replace(/\s/g, '_')}`;
        s3ImageUrl = await uploadFileToS3(fileBuffer, fileNameForS3, mimetype);
        console.log(`New class image uploaded to S3: ${s3ImageUrl}`);

        classItem.image = s3ImageUrl; // Update the image URL in the document

        // If a new image was uploaded and there was an old image, delete the old one from S3
        if (oldImageUrl) {
          try {
            const keyToDelete = extractKeyFromS3Url(oldImageUrl);
            if (keyToDelete) {
              await deleteFileFromS3(keyToDelete);
              console.log(`Old S3 image deleted: ${keyToDelete}`);
            }
          } catch (deleteError) {
            console.warn('Warning: Could not delete old S3 image during update:', deleteError);
          }
        }

      } catch (uploadError) {
        console.error('Error uploading new class image to S3:', uploadError);
        res.status(500).json({ state: 500, msg: 'Failed to upload new class image.' });
        return;
      }
    } else if ('image' in updates && (updates.image === null || updates.image === '')) {
      // If `image` is explicitly set to `null` or empty string in the body
      // AND no new file is uploaded, it means the user wants to clear the image.
      classItem.image = undefined; // Set to undefined to remove the field from MongoDB

      // Delete the old image from S3 if it exists and is being cleared
      if (oldImageUrl) {
        try {
          const keyToDelete = extractKeyFromS3Url(oldImageUrl);
          if (keyToDelete) {
            await deleteFileFromS3(keyToDelete);
            console.log(`Old S3 image deleted upon clear: ${keyToDelete}`);
          }
        } catch (deleteError) {
          console.warn('Warning: Could not delete old S3 image upon clear:', deleteError);
        }
      }
    }

    // Apply other updates from the validated data.
    // Exclude 'image' from Object.assign if it was handled separately above.
    const { image, ...otherUpdates } = updates;
    Object.assign(classItem, otherUpdates);


    const updatedClass = await classItem.save(); const populatedClass = await Class.findById(updatedClass._id)
      .populate('mainCategory', '_id mainCategoryName')
      .populate('category', '_id categoryName')
      .populate('section', '_id sectionName')
      .populate('topic', '_id topicName');

    res.status(200).json({
      state: 200,
      msg: 'Class updated successfully',
      data: populatedClass
    });
  } catch (error: any) {
    console.error('Error updating class:', error);

    if (error instanceof multer.MulterError) {
      res.status(400).json({ state: 400, msg: `File upload error: ${error.message}` });
      return;
    }
    if (error.code === 11000) {
      res.status(400).json({ state: 400, msg: 'Duplicate key error: Class Title must be unique.' });
      return;
    }
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      res.status(400).json({ state: 400, msg: 'Invalid Class ID format.' });
    } else {
      res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
  } finally {
    // IMPORTANT: Clean up the locally saved file by Multer regardless of success or failure
    // Use fs.existsSync from the regular 'fs' module
    if (localFilePath && fs.existsSync(localFilePath)) {
      try {
        await fsPromises.unlink(localFilePath); // Use fsPromises.unlink for async deletion
      } catch (err) {
        console.error('Error deleting local class image file:', err);
      }
    }
  }
};

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Public
export const deleteClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (classItem) {
      // If an image exists for this class, delete it from S3
      if (classItem.image) {
        try {
          const keyToDelete = extractKeyFromS3Url(classItem.image);
          if (keyToDelete) {
            await deleteFileFromS3(keyToDelete);
            console.log(`S3 image deleted during class deletion: ${keyToDelete}`);
          }
        } catch (deleteError) {
          console.warn('Warning: Could not delete S3 image during class deletion:', deleteError);
          // Continue with class deletion even if S3 delete fails
        }
      }

      await Class.deleteOne({ _id: classItem._id });
      res.status(200).json({ state: 200, msg: 'Class removed', data: null });
    } else {
      res.status(404).json({ state: 404, msg: 'Class not found' });
    }
  } catch (error: any) {
    console.error('Error deleting class:', error);
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      res.status(400).json({ state: 400, msg: 'Invalid Class ID format.' });
    } else {
      res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
  }
};

// @desc    Get filtered classes using aggregation
// @route   POST /api/classes/filter
// @access  Public
// export const getFilteredClasses = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { mainCategoryId, categoryId } = req.body;

//     console.log('Aggregation filter request:', { mainCategoryId, categoryId });

//     const pipeline: any[] = [];
//     const matchConditions: any = {};

//     // Validate and add mainCategory filter if provided
//     if (mainCategoryId) {
//       if (!mongoose.Types.ObjectId.isValid(mainCategoryId)) {
//         res.status(400).json({ state: 400, msg: 'Invalid mainCategory ID format.' });
//         return;
//       }
//       matchConditions.mainCategory = new mongoose.Types.ObjectId(mainCategoryId);
//     }

//     // Validate and add category filter if provided
//     if (categoryId) {
//       if (!mongoose.Types.ObjectId.isValid(categoryId)) {
//         res.status(400).json({ state: 400, msg: 'Invalid category ID format.' });
//         return;
//       }
//       matchConditions.category = new mongoose.Types.ObjectId(categoryId);
//     }

//     // Only add match stage if we have conditions
//     if (Object.keys(matchConditions).length > 0) {
//       pipeline.push({ $match: matchConditions });
//     }

//     // Add lookups to populate referenced fields
//     pipeline.push(
//       {
//         $lookup: {
//           from: 'maincategories', // The actual collection name for MainCategory
//           localField: 'mainCategory',
//           foreignField: '_id',
//           as: 'mainCategoryData'
//         }
//       },
//       {
//         $lookup: {
//           from: 'categories', // The actual collection name for Category
//           localField: 'category',
//           foreignField: '_id',
//           as: 'categoryData'
//         }
//       },
//       {
//         $lookup: {
//           from: 'sections', // The actual collection name for Section
//           localField: 'section',
//           foreignField: '_id',
//           as: 'sectionData'
//         }
//       },
//       {
//         $lookup: {
//           from: 'topics', // The actual collection name for Topic
//           localField: 'topic',
//           foreignField: '_id',
//           as: 'topicData'
//         }
//       }
//     );    // Project the final result to match the populate format
//     pipeline.push({
//       $project: {
//         id: '$_id',
//         title: 1,
//         description: 1,
//         link: 1,
//         classLink: 1,
//         status: 1,
//         image: 1,
//         isChat: 1,
//         isFree: 1,
//         teacherName: 1,
//         priority: 1,
//         isLive: 1,
//         createdAt: 1,
//         updatedAt: 1,
//         mainCategory: {
//           $cond: {
//             if: { $gt: [{ $size: '$mainCategoryData' }, 0] },
//             then: {
//               _id: { $arrayElemAt: ['$mainCategoryData._id', 0] },
//               mainCategoryName: { $arrayElemAt: ['$mainCategoryData.mainCategoryName', 0] }
//             },
//             else: '$mainCategory'
//           }
//         },
//         category: {
//           $cond: {
//             if: { $gt: [{ $size: '$categoryData' }, 0] },
//             then: {
//               _id: { $arrayElemAt: ['$categoryData._id', 0] },
//               categoryName: { $arrayElemAt: ['$categoryData.categoryName', 0] }
//             },
//             else: '$category'
//           }
//         },
//         section: {
//           $cond: {
//             if: { $gt: [{ $size: '$sectionData' }, 0] },
//             then: {
//               _id: { $arrayElemAt: ['$sectionData._id', 0] },
//               sectionName: { $arrayElemAt: ['$sectionData.sectionName', 0] }
//             },
//             else: '$section'
//           }
//         },
//         topic: {
//           $cond: {
//             if: { $gt: [{ $size: '$topicData' }, 0] },
//             then: {
//               _id: { $arrayElemAt: ['$topicData._id', 0] },
//               topicName: { $arrayElemAt: ['$topicData.topicName', 0] }
//             },
//             else: '$topic'
//           }
//         }
//       }
//     });

//     // Sort by priority and creation date
//     pipeline.push({
//       $sort: { priority: 1, createdAt: -1 }
//     });

//     // console.log('Aggregation pipeline:', JSON.stringify(pipeline, null, 2));

//     const data = await Class.aggregate(pipeline);

//     // console.log('Aggregation result count:', data.length);

//     if (data.length > 0) {
//       res.status(200).json({
//         state: 200,
//         msg: 'success',
//         data: data
//       });
//     } else {
//       res.status(200).json({
//         state: 200,
//         msg: 'No filtered classes found',
//         data: []
//       });
//     }
//   } catch (error: any) {
//     console.error('Error fetching filtered classes:', error);
//     res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
//   }
// };

export const getFilteredClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    // --- THIS IS THE FIX ---
    // Read filters from the URL query string, not the request body
    const { mainCategoryId, categoryId } = req.query;

    console.log('Aggregation filter request:', { mainCategoryId, categoryId });

    const pipeline: any[] = [];
    const matchConditions: any = {};

    // Validate and add mainCategory filter if provided
    if (mainCategoryId && typeof mainCategoryId === 'string') {
      if (!mongoose.Types.ObjectId.isValid(mainCategoryId)) {
        res.status(400).json({ state: 400, msg: 'Invalid mainCategory ID format.' });
        return;
      }
      matchConditions.mainCategory = new mongoose.Types.ObjectId(mainCategoryId);
    }

    // Validate and add category filter if provided
    if (categoryId && typeof categoryId === 'string') {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        res.status(400).json({ state: 400, msg: 'Invalid category ID format.' });
        return;
      }
      matchConditions.category = new mongoose.Types.ObjectId(categoryId);
    }

    // Only add match stage if we have conditions
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Add lookups to populate referenced fields
    pipeline.push(
      { $lookup: { from: 'maincategories', localField: 'mainCategory', foreignField: '_id', as: 'mainCategoryData' }},
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryData' }},
      { $lookup: { from: 'sections', localField: 'section', foreignField: '_id', as: 'sectionData' }},
      { $lookup: { from: 'topics', localField: 'topic', foreignField: '_id', as: 'topicData' }}
    );

    // Project the final result
    pipeline.push({
      $project: {
        _id: 0, // Exclude the original _id
        id: '$_id',
        title: 1,
        description: 1,
        link: 1,
        status: 1,
        image: 1,
        isChat: 1,
        isFree: 1,
        teacherName: 1,
        priority: 1,
        isLive: 1,
        createdAt: 1,
        updatedAt: 1,
        mainCategory: { $arrayElemAt: ['$mainCategoryData', 0] },
        category: { $arrayElemAt: ['$categoryData', 0] },
        section: { $arrayElemAt: ['$sectionData', 0] },
        topic: { $arrayElemAt: ['$topicData', 0] }
      }
    });
    
    // In the projection stage, we can further refine the populated fields
    pipeline.push({
      $project: {
        // Carry over all fields from the previous stage
        id: 1, title: 1, description: 1, link: 1, status: 1, image: 1, isChat: 1, 
        isFree: 1, teacherName: 1, priority: 1, isLive: 1, createdAt: 1, updatedAt: 1,
        // Reshape the populated fields
        'mainCategory.id': '$mainCategory._id',
        'mainCategory.mainCategoryName': '$mainCategory.mainCategoryName',
        'category.id': '$category._id',
        'category.categoryName': '$category.categoryName',
        'section.id': '$section._id',
        'section.sectionName': '$section.sectionName',
        'topic.id': '$topic._id',
        'topic.topicName': '$topic.topicName',
      }
    });


    // Sort by priority and creation date
    pipeline.push({ $sort: { priority: 1, createdAt: -1 } });

    const data = await Class.aggregate(pipeline);

    if (data.length > 0) {
      res.status(200).json({ state: 200, msg: 'success', data: data });
    } else {
      res.status(200).json({ state: 200, msg: 'No filtered classes found', data: [] });
    }
  } catch (error: any) {
    console.error('Error fetching filtered classes:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};
// @desc    Toggle class status
// @route   PATCH /api/classes/:id/toggle-status (Changed to PATCH in routes)
// @access  Public
export const toggleClassStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const classToUpdate = await Class.findById(id);

    if (!classToUpdate) {
      res.status(404).json({ state: 404, msg: 'Class not found.' });
      return;
    }

    classToUpdate.status = classToUpdate.status === 'active' ? 'inactive' : 'active';

    const updatedClass = await classToUpdate.save();

    res.status(200).json({
      state: 200,
      msg: 'Class status toggled successfully',
      data: {
        _id: updatedClass._id,
        newStatus: updatedClass.status,
        updatedAt: updatedClass.updatedAt,
      }
    });

  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(400).json({ state: 400, msg: `Invalid Class ID format.` });
    } else {
      console.error('Error toggling class status:', error);
      res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
  }
};

// @desc    Get all live classes
// @route   GET /api/classes/live
// @access  Public
export const getLiveClassByCourseId = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentTime = new Date();

    const pipeline: any[] = [
      {
        $match: {
          startDate: { $lte: currentTime },
          endDate: { $gte: currentTime }
        }
      },
      // Sort by priority and creation date
      { $sort: { priority: 1, createdAt: -1 } },
      // Populate referenced fields
      {
        $lookup: {
          from: 'maincategories',
          localField: 'mainCategory',
          foreignField: '_id',
          as: 'mainCategoryData'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      {
        $lookup: {
          from: 'sections',
          localField: 'section',
          foreignField: '_id',
          as: 'sectionData'
        }
      },
      {
        $lookup: {
          from: 'topics',
          localField: 'topic',
          foreignField: '_id',
          as: 'topicData'
        }
      },      // Project the final result
      {        $project: {
          _id: 0,
          id: '$_id',
          title: 1,
          description: 1,
          class_link: '$link',
          // link: 1,
          status: 1,
          image: 1,
          isChat: 1,
          isFree: 1,
          teacherName: 1,
          priority: 1,
          isLive: 1,
          startDate: 1,
          endDate: 1,
          createdAt: 1,
          updatedAt: 1,
          mainCategory: {
            $cond: {
              if: { $gt: [{ $size: '$mainCategoryData' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$mainCategoryData._id', 0] },
                mainCategoryName: { $arrayElemAt: ['$mainCategoryData.mainCategoryName', 0] }
              },
              else: '$mainCategory'
            }
          },
          category: {
            $cond: {
              if: { $gt: [{ $size: '$categoryData' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$categoryData._id', 0] },
                categoryName: { $arrayElemAt: ['$categoryData.categoryName', 0] }
              },
              else: '$category'
            }
          },
          section: {
            $cond: {
              if: { $gt: [{ $size: '$sectionData' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$sectionData._id', 0] },
                sectionName: { $arrayElemAt: ['$sectionData.sectionName', 0] }
              },
              else: '$section'
            }
          },
          topic: {
            $cond: {
              if: { $gt: [{ $size: '$topicData' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$topicData._id', 0] },
                topicName: { $arrayElemAt: ['$topicData.topicName', 0] }
              },
              else: '$topic'
            }
          }
        }
      }
    ];

    const liveClasses = await Class.aggregate(pipeline); if (liveClasses.length === 0) {
      res.status(200).json({
        state: 200,
        msg: 'No live classes found at the current time',
        data: {
          liveClasses: [],
          totalLiveClasses: 0,
          currentTime: currentTime.toISOString()
        }
      });
    } else {
      const formattedLiveClasses = liveClasses.map(cls => ({
        id: cls._id,
        title: cls.title,
        description: cls.description,
        // link: cls.link,
        class_link: cls.class_link,
        status: cls.status,
        image: cls.image,
        isChat: cls.isChat,
        isFree: cls.isFree,
        teacherName: cls.teacherName,
        priority: cls.priority,
        isLive: cls.isLive,
        startDate: cls.startDate,
        endDate: cls.endDate,
        mainCategory: cls.mainCategory,
        category: cls.category,
        section: cls.section,
        topic: cls.topic,
        createdAt: cls.createdAt,
        updatedAt: cls.updatedAt
      }));

      res.status(200).json({
        state: 200,
        msg: 'Live classes retrieved successfully',
        data: formattedLiveClasses
      });
    }
  } catch (error: any) {
    console.error('Error fetching live classes:', error);
    res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
  }
};

// @desc    Get classes filtered by isShort and isTopper flags
// @route   GET /api/classes/flags
// @access  Public
export const getClassesByFlags = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isShort, isTopper, category } = req.query;

    // Build filter conditions
    const filterConditions: any = {};

    // Add isShort filter if provided
    if (isShort !== undefined) {
      if (isShort === 'true') {
        filterConditions.isShort = true;
      } else if (isShort === 'false') {
        filterConditions.isShort = false;
      } else {
        res.status(400).json({
          state: 400,
          msg: 'Invalid isShort value. Use "true" or "false"',
          data: null
        });
        return;
      }
    }    // Add isTopper filter if provided
    if (isTopper !== undefined) {
      if (isTopper === 'true') {
        filterConditions.isTopper = true;
      } else if (isTopper === 'false') {
        filterConditions.isTopper = false;
      } else {
        res.status(400).json({
          state: 400,
          msg: 'Invalid isTopper value. Use "true" or "false"',
          data: null
        });
        return;
      }
    }

    // Add category filter if provided
    if (category !== undefined) {
      if (!Types.ObjectId.isValid(category as string)) {
        res.status(400).json({
          state: 400,
          msg: 'Invalid category ID format',
          data: null
        });
        return;
      }
      filterConditions.category = new Types.ObjectId(category as string);
    }

    // If no filters provided, return error
    if (Object.keys(filterConditions).length === 0) {
      res.status(400).json({
        state: 400,
        msg: 'At least one filter (isShort or isTopper) must be provided',
        data: null
      });
      return;
    }

    // Execute query with populated data
    const classes = await Class.find(filterConditions)
      .populate('mainCategory', '_id mainCategoryName')
      .populate('category', '_id categoryName')
      .populate('section', '_id sectionName')
      .populate('topic', 'topicName').sort({ priority: 1, createdAt: -1 })
      .exec();

    // If isTopper query is true, group data by topic
    if (isTopper === 'true') {
      // Group classes by topic
      const groupedByTopic = classes.reduce((acc: any, cls: any) => {
        const topicId = cls.topic?._id?.toString() || 'unknown';
        const topicName = cls.topic?.topicName || 'Unknown Topic';
        if (!acc[topicId]) {
          acc[topicId] = {
            topicName: topicName,
            classes: []
          };
        }

        acc[topicId].classes.push({
          id: cls._id,
          title: cls.title,
          description: cls.description,
          teacherName: cls.teacherName,
          startDate: cls.startDate,
          endDate: cls.endDate,
          isLive: cls.isLive,
          isFree: cls.isFree,
          isShort: cls.isShort,
          isTopper: cls.isTopper,
          status: cls.status,
          priority: cls.priority,
          image: cls.image,
          link: cls.link,
          mainCategory: cls.mainCategory,
          category: cls.category,
          section: cls.section,
          topic: cls.topic,
          createdAt: cls.createdAt,
          updatedAt: cls.updatedAt,
          class_link: cls.class_link
        });

        return acc;
      }, {});

      // Convert to array format
      const topicsArray = Object.values(groupedByTopic);

      res.status(200).json({
        state: 200,
        msg: 'success',
        data: topicsArray,
        total: classes.length,
        totalTopics: topicsArray.length,
        filters: filterConditions
      });
    } else {      // Format the response data normally for non-topper queries
      const formattedClasses = classes.map(cls => ({
        id: cls._id,
        title: cls.title,
        description: cls.description,
        teacherName: cls.teacherName,
        startDate: cls.startDate,
        endDate: cls.endDate,
        isLive: cls.isLive,
        isFree: cls.isFree,
        isShort: cls.isShort,
        isTopper: cls.isTopper,
        status: cls.status,
        priority: cls.priority,
        image: cls.image,
        link: cls.link,
        mainCategory: cls.mainCategory,
        category: cls.category,
        section: cls.section,
        topic: cls.topic,
        createdAt: cls.createdAt,
        updatedAt: cls.updatedAt,
        class_link: cls.class_link
      }));

      res.status(200).json({
        state: 200,
        msg: 'success',
        data: formattedClasses,
        total: formattedClasses.length,
        filters: filterConditions
      });
    }

  } catch (error: any) {
    console.error('Error fetching classes by flags:', error);
    res.status(500).json({
      state: 500,
      msg: error.message || 'Server Error',
      data: null
    });
  }
};

// @desc    Get mp4 recordings for a specific class
// @route   GET /api/classes/:classId/recordings
// @access  Public
export const getClassRecordings = async (req: Request, res: Response): Promise<void> => {
  const { classId } = req.params;

  try {
    // Validate classId format
    if (!Types.ObjectId.isValid(classId)) {
      res.status(400).json({
        state: 400,
        message: "Invalid class ID format."
      });
      return;
    }

    // Use aggregation pipeline to get class with mp4Recordings
    const pipeline: any[] = [
      { $match: { _id: new Types.ObjectId(classId) } },
      {
        $project: {
          _id: 0,
          id: '$_id',
          title: 1,
          mp4Recordings: 1
        }
      }
    ];

    const result = await Class.aggregate(pipeline);
    console.log('Aggregation result:', result); // Debugging log

    if (!result.length) {
      res.status(404).json({
        state: 404,
        message: "No class found with the given ID.",
        classId
      });
      return;
    }

    const classData = result[0];

    // Check if mp4Recordings exist and have content
    if (classData.mp4Recordings && classData.mp4Recordings.length > 0) {
      const recordings = classData.mp4Recordings;

      // Format recordings to match the expected structure
      const formattedRecordings = recordings.map((recording: any) => {
        // Handle both object format (with quality, url, size) and string format
        if (typeof recording === 'object' && recording.url) {
          return {
            quality: recording.quality || 'unknown',
            link: recording.url,
            size: recording.size || null
          };
        } else if (typeof recording === 'string') {
          // If it's just a string URL, try to extract quality from filename
          const qualityMatch = recording.match(/(\d+p)/);
          const quality = qualityMatch ? qualityMatch[1] : 'unknown';
          return {
            quality: quality,
            link: recording,
            size: null
          };
        }
        return {
          quality: 'unknown',
          link: recording,
          size: null
        };
      });

      res.status(200).json({
        state: 200,
        message: "Recordings retrieved successfully",
        recordings: formattedRecordings,

      });
      return;
    }

    // No recordings found
    res.status(404).json({
      state: 404,
      message: "Recordings will be available soon",
      classId,
      classTitle: classData.title
    });

  } catch (error: any) {
    console.error('Error fetching class recordings:', error);
    res.status(500).json({
      state: 500,
      message: "Internal server error while fetching recordings.",
      error: error.message || 'Unknown error'
    });
  }
};