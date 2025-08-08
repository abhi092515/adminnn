// src/controllers/mainCategoryController.ts
import { Request, Response } from 'express';
import MainCategory, { IMainCategory } from '../models/MainCategory';
import { Types } from 'mongoose';

// Import Zod and schemas
import { z } from 'zod';
import { createMainCategorySchema, updateMainCategorySchema } from '../schemas/mainCategorySchemas';

// S3 upload and delete imports from the consolidated file
import { uploadFileToS3 } from '../config/s3Upload';
import { deleteFileFromS3, extractKeyFromS3Url } from "../config/s3Upload";

import fs from 'fs'; // For file system operations (deleting local files)
import multer from 'multer'; // Import Multer to catch Multer errors

// Extend the Request type to include the file property from Multer
declare module 'express' {
  export interface Request {
    file?: Express.Multer.File;
  }
}

// @desc    Create a new main category
// @route   POST /api/main-categories
// @access  Public
export const createMainCategory = async (req: Request, res: Response): Promise<void> => {
  // Store the path to the locally saved file by Multer for cleanup in finally block
  let localFilePath: string | undefined;

  try {
    // 1. Zod validation for text fields in req.body
    const validationResult = createMainCategorySchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        state: 400,
        msg: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        })),
        data: null // Changed from [] to null for consistency with other controllers
      });
      return;
    }

    const validatedData = validationResult.data;

    // 2. Check for existing main category name
    const existingCategory = await MainCategory.findOne({ mainCategoryName: validatedData.mainCategoryName });
    if (existingCategory) {
      res.status(400).json({
        state: 400,
        msg: 'Main Category Name already exists.',
        data: null // Changed from [] to null
      });
      return;
    }

    let s3ImageUrl: string | undefined; // Variable to store the S3 URL

    // 3. Handle file upload if a file was provided by Multer
    if (req.file) {
      localFilePath = req.file.path; // Store the local file path for cleanup
      try {
        const fileBuffer = fs.readFileSync(localFilePath); // Read the file into a buffer
        const { originalname, mimetype } = req.file;

        // Generate a unique filename for S3, nested under 'main-categories/' folder
        // Replace spaces with underscores for cleaner S3 keys
        const fileNameForS3 = `main-categories/${Date.now()}-${originalname.replace(/\s/g, '_')}`;
        s3ImageUrl = await uploadFileToS3(fileBuffer, fileNameForS3, mimetype);
        // console.log(`Main Category image uploaded to S3: ${s3ImageUrl}`); // Keep for debugging if needed
      } catch (uploadError) {
        console.error('Error uploading main category image to S3:', uploadError);
        res.status(500).json({
          state: 500,
          msg: 'Failed to upload main category image.',
          data: null // Changed from [] to null
        });
        return; // Stop execution if S3 upload fails
      }
    }

    // 4. Create new main category instance, assigning the S3 URL to the 'mainCategoryImage' field
    const newCategory: IMainCategory = new MainCategory({
      ...validatedData,
      mainCategoryImage: s3ImageUrl, // Assign the S3 URL here
    });

    const createdCategory = await newCategory.save();

    // Mongoose's toJSON/toObject transform will convert _id to id
    res.status(200).json({
      state: 200,
      msg: 'Main Category created successfully',
      data: createdCategory // This will now have 'id' instead of '_id' due to schema transform
    });
  } catch (error: any) {
    console.error('Error creating main category:', error); // Log the full error

    if (error instanceof multer.MulterError) {
      // Consistent error message and status code with categoryController
      res.status(400).json({
        state: 400,
        msg: `File upload error: ${error.message}`,
        data: null
      });
      return;
    }
    if (error.code === 11000) {
      res.status(400).json({
        state: 400,
        msg: 'Duplicate key error: Main Category Name already exists.', // More specific message
        data: null // Changed from [] to null
      });
      return;
    }
    res.status(500).json({
      state: 500,
      msg: error.message || 'Server Error',
      data: null // Changed from [] to null
    });
  } finally {
    // IMPORTANT: Clean up the locally saved file by Multer regardless of success or failure
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlink(localFilePath, (err) => {
        if (err) console.error('Error deleting local main category image file:', err);
      });
    }
  }
};

// @desc    Get all main categories
// @route   GET /api/main-categories
// @access  Public
export const getMainCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    // The .toJSON() transform on the model will apply to each document in the array
    const categories = await MainCategory.find({});

    if (categories.length > 0) {
      res.status(200).json({
        state: 200,
        msg: 'success',
        data: categories,
      });
    } else {
      // Consistent response status and data type with categoryController
      res.status(200).json({ // Changed to 200 with empty array, more standard
        state: 200,
        msg: 'No data found',
        data: [],
      });
    }
  } catch (error: any) {
    console.error('Error fetching main categories:', error);
    res.status(500).json({
      state: 500,
      msg: error.message || 'Server Error',
      data: [],
    });
  }
};

// @desc    Get a single main category by ID
// @route   GET /api/main-categories/:id
// @access  Public
export const getMainCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await MainCategory.findById(req.params.id);

    if (category) {
      res.status(200).json({
        state: 200,
        msg: 'success',
        data: category
      });
    } else {
      // Consistent response status and data type with categoryController
      res.status(404).json({ // Changed to 404, more semantically correct for not found
        state: 404,
        msg: 'Main Category not found',
        data: null,
      });
    }
  } catch (error: any) {
    console.error('Error fetching main category by ID:', error);
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      res.status(400).json({
        state: 400,
        msg: 'Invalid Main Category ID format.',
        data: null
      });
    } else {
      res.status(500).json({
        state: 500,
        msg: error.message || 'Server Error',
        data: null // Changed from [] to null
      });
    }
  }
};

// @desc    Update a main category
// @route   PUT /api/main-categories/:id
// @access  Public
export const updateMainCategory = async (req: Request, res: Response): Promise<void> => {
  let oldImageUrl: string | undefined; // To store the old image URL for potential deletion
  let localFilePath: string | undefined; // To store the path to the locally saved file for cleanup

  try {
    const validationResult = updateMainCategorySchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        state: 400,
        msg: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        })),
        data: null // Changed from [] to null
      });
      return;
    }

    const updates = validationResult.data;

    const category: IMainCategory | null = await MainCategory.findById(req.params.id);

    if (!category) {
      // Consistent response status and data type with categoryController
      res.status(404).json({ // Changed to 404, more semantically correct for not found
        state: 404,
        msg: 'Main Category not found',
        data: null
      });
      return;
    }

    // Store the old image URL before potential update
    oldImageUrl = category.mainCategoryImage;

    // Check for duplicate mainCategoryName if it's being changed
    if (updates.mainCategoryName !== undefined && updates.mainCategoryName !== category.mainCategoryName) { // Check for undefined to prevent unnecessary findOne
      const existingCategoryWithNewName = await MainCategory.findOne({ mainCategoryName: updates.mainCategoryName });
      if (existingCategoryWithNewName) {
        const currentCategoryId = category._id as Types.ObjectId;
        const foundCategoryId = existingCategoryWithNewName._id as Types.ObjectId;

        if (!currentCategoryId.equals(foundCategoryId)) {
          res.status(400).json({
            state: 400,
            msg: 'Duplicate key error: Main Category Name already exists.', // More specific message
            data: null // Changed from [] to null
          });
          return;
        }
      }
    }

    // Handle file upload if a NEW file was provided by Multer
    if (req.file) {
      localFilePath = req.file.path; // Store local file path for cleanup
      try {
        const fileBuffer = fs.readFileSync(localFilePath);
        const { originalname, mimetype } = req.file;

        const fileNameForS3 = `main-categories/${Date.now()}-${originalname.replace(/\s/g, '_')}`;
        const s3ImageUrl = await uploadFileToS3(fileBuffer, fileNameForS3, mimetype);
        // console.log(`New main category image uploaded to S3: ${s3ImageUrl}`);

        category.mainCategoryImage = s3ImageUrl; // Update the image URL in the document

        // Delete the old image from S3 if it exists and a new one was uploaded
        if (oldImageUrl) {
          try {
            const keyToDelete = extractKeyFromS3Url(oldImageUrl);
            if (keyToDelete) {
              await deleteFileFromS3(keyToDelete);
              // console.log(`Old S3 image deleted: ${keyToDelete}`);
            }
          } catch (deleteError) {
            console.warn('Warning: Could not delete old S3 image during update:', deleteError);
            // Don't block the update if old image deletion fails
          }
        }

      } catch (uploadError) {
        console.error('Error uploading new main category image to S3:', uploadError);
        res.status(500).json({
          state: 500,
          msg: 'Failed to upload new main category image.',
          data: null // Changed from [] to null
        });
        return;
      }
    } else if ('mainCategoryImage' in updates && (updates.mainCategoryImage === null || updates.mainCategoryImage === '')) {
      // If `mainCategoryImage` is explicitly set to `null` or empty string in the body
      // AND no new file is uploaded, it means the user wants to clear the image.
      category.mainCategoryImage = undefined; // Set to undefined to remove the field from MongoDB

      // Delete the old image from S3 if it exists and is being cleared
      if (oldImageUrl) {
        try {
          const keyToDelete = extractKeyFromS3Url(oldImageUrl);
          if (keyToDelete) {
            await deleteFileFromS3(keyToDelete);
            // console.log(`S3 image cleared and deleted: ${keyToDelete}`);
          }
        } catch (deleteError) {
          console.warn('Warning: Could not delete old S3 image upon clear:', deleteError);
        }
      }
    }

    // Apply other updates from the validated data.
    // Exclude 'mainCategoryImage' from Object.assign if it was handled separately above.
    const updatesToApply = { ...updates };
    if (req.file || ('mainCategoryImage' in updates && (updates.mainCategoryImage === null || updates.mainCategoryImage === ''))) {
      delete updatesToApply.mainCategoryImage;
    }
    Object.assign(category, updatesToApply);


    const updatedCategory = await category.save();

    res.status(200).json({
      state: 200,
      msg: 'Main Category updated successfully',
      data: updatedCategory
    });
  } catch (error: any) {
    console.error('Error updating main category:', error);

    if (error instanceof multer.MulterError) {
      // Consistent error message and status code with categoryController
      res.status(400).json({
        state: 400,
        msg: `File upload error: ${error.message}`,
        data: null
      });
      return;
    }
    if (error.code === 11000) {
      res.status(400).json({
        state: 400,
        msg: 'Duplicate key error: Main Category Name already exists.',
        data: null // Changed from [] to null
      });
      return;
    }
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      res.status(400).json({
        state: 400,
        msg: 'Invalid Main Category ID format.',
        data: null // Changed from [] to null
      });
    } else {
      res.status(500).json({
        state: 500,
        msg: error.message || 'Server Error',
        data: null // Changed from [] to null
      });
    }
  } finally {
    // IMPORTANT: Clean up the locally saved file by Multer regardless of success or failure
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlink(localFilePath, (err) => {
        if (err) console.error('Error deleting local main category image file:', err);
      });
    }
  }
};

// @desc    Delete a main category
// @route   DELETE /api/main-categories/:id
// @access  Public
export const deleteMainCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await MainCategory.findById(req.params.id);

    if (category) {
      // If an image exists for this main category, delete it from S3
      if (category.mainCategoryImage) {
        try {
          const keyToDelete = extractKeyFromS3Url(category.mainCategoryImage);
          if (keyToDelete) { // Ensure a valid key was extracted
            await deleteFileFromS3(keyToDelete);
            // console.log(`S3 image deleted during main category deletion: ${keyToDelete}`);
          }
        } catch (deleteError) {
          console.warn('Warning: Could not delete S3 image during main category deletion:', deleteError);
          // Continue with main category deletion even if S3 delete fails
        }
      }

      await MainCategory.deleteOne({ _id: category._id });
      res.status(200).json({
        state: 200,
        msg: 'Main Category removed successfully',
        data: null // Changed from [] to null
      });
    } else {
      // Consistent response status and data type with categoryController
      res.status(404).json({ // Changed to 404, more semantically correct for not found
        state: 404,
        msg: 'Main Category not found',
        data: null
      });
    }
  } catch (error: any) {
    console.error('Error deleting main category:', error);
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      res.status(400).json({
        state: 400,
        msg: 'Invalid Main Category ID format.',
        data: null
      });
    } else {
      res.status(500).json({
        state: 500,
        msg: error.message || 'Server Error',
        data: null // Changed from [] to null
      });
    }
  }
};