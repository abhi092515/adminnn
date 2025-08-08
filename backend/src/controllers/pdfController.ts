// src/controllers/pdfController.ts
import { Request, Response } from 'express';
import { Types, Document } from 'mongoose'; // Ensure Document is imported from mongoose
import Pdf, { IPdf } from '../models/Pdf';
import MainCategory from '../models/MainCategory';
import Category from '../models/Category';        
import Section from '../models/Section';          
import Topic from '../models/Topic';              
import fs from 'fs/promises';
import { uploadFileToS3 } from '../config/s3Upload';
// Import Zod and schemas
import { z } from 'zod';
import { createPdfSchema, updatePdfSchema } from '../schemas/pdfSchemas'; // Import the new schemas

// Helper function to check if a referenced ID is valid and exists
const validateReference = async (
  model: any,
  id: string | Types.ObjectId,
  modelName: string,
  res: Response
): Promise<boolean> => {
  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: `Invalid ${modelName} ID provided.` });
    return false;
  }
  const exists = await model.findById(id);
  if (!exists) {
    res.status(404).json({ message: `${modelName} not found.` });
    return false;
  }
  return true;
};

// @desc    Create a new PDF
// @route   POST /api/pdfs
// @access  Public
// export const createPdf = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // 1. Zod validation
//     const validationResult = createPdfSchema.safeParse(req.body);

//     if (!validationResult.success) {
//       res.status(400).json({
//         message: 'Validation failed',
//         errors: validationResult.error.errors.map(err => ({
//           path: err.path.join('.'),
//           message: err.message
//         }))
//       });
//       return;
//     }

//     const validatedData = validationResult.data; // Use validated data

//     // 2. Validate relationships
//     if (!(await validateReference(MainCategory, validatedData.mainCategory, 'Main Category', res))) return;
//     if (!(await validateReference(Category, validatedData.category, 'Category', res))) return;
//     if (!(await validateReference(Section, validatedData.section, 'Section', res))) return;
//     if (!(await validateReference(Topic, validatedData.topic, 'Topic', res))) return;

//     // 3. Check for existing PDF title (assuming title should be unique)
//     const existingPdf = await Pdf.findOne({ title: validatedData.title });
//     if (existingPdf) {
//       res.status(400).json({ message: 'A PDF with this title already exists.' });
//       return;
//     }

//     const newPdf: IPdf = new Pdf(validatedData); // Create PDF directly from validated data

//     const createdPdf = await newPdf.save();

//     // Populate all referenced fields for the response, selecting _id and their respective name/title fields
//     const populatedPdf = await Pdf.findById(createdPdf._id)
//       .populate('mainCategory', '_id mainCategoryName')
//       .populate('category', '_id categoryName')
//       .populate('section', '_id sectionName')
//       .populate('topic', '_id topicName');

//     res.status(201).json(populatedPdf);
//   } catch (error: any) {
//     if (error.code === 11000) { // Duplicate key error from MongoDB unique index
//       res.status(400).json({ message: 'Duplicate key error: PDF Title must be unique.' });
//       return;
//     }
//     res.status(500).json({ message: error.message || 'Server Error' });
//   }
// };
// In src/controllers/pdfController.ts

export const createPdf = async (req: Request, res: Response): Promise<void> => {
  try {
    // ✅ 1. Check for the required file in req.files BEFORE doing anything else
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files || !files.uploadPdf?.[0]) {
      res.status(400).json({ message: 'Validation failed', errors: [{ path: ['uploadPdf'], message: 'A PDF file is required.' }] });
      return;
    }

    // 2. Zod validation for text fields
    const validationResult = createPdfSchema.safeParse(req.body);
    if (!validationResult.success) {
      // If validation fails, clean up any uploaded files
      await fs.unlink(files.uploadPdf[0].path);
      if (files.image?.[0]) {
        await fs.unlink(files.image[0].path);
      }
      res.status(400).json({ message: 'Validation failed', errors: validationResult.error.errors });
      return;
    }
    const validatedData = validationResult.data;

    // 3. Handle file uploads to S3
    let imageUrl: string | undefined = undefined;

    // Upload required PDF
    const pdfFile = files.uploadPdf[0];
    const pdfBuffer = await fs.readFile(pdfFile.path);
    const pdfKey = `pdfs/files/${Date.now()}-${pdfFile.originalname.replace(/\s+/g, '_')}`;
    const pdfUrl = await uploadFileToS3(pdfBuffer, pdfKey, pdfFile.mimetype);
    await fs.unlink(pdfFile.path); // Clean up temp file

    // Upload optional image
    if (files.image?.[0]) {
      const imageFile = files.image[0];
      const imageBuffer = await fs.readFile(imageFile.path);
      const imageKey = `pdfs/images/${Date.now()}-${imageFile.originalname.replace(/\s+/g, '_')}`;
      imageUrl = await uploadFileToS3(imageBuffer, imageKey, imageFile.mimetype);
      await fs.unlink(imageFile.path);
    }

    // 4. Combine text data and file URLs and save to database
    const newPdf = new Pdf({
      ...validatedData,
      image: imageUrl,
      uploadPdf: pdfUrl,
    });

    let createdPdf = await newPdf.save();
    
    // ✅ 5. More efficient population
    createdPdf = await createdPdf.populate([
      { path: 'mainCategory', select: '_id mainCategoryName' },
      { path: 'category', select: ' _id categoryName' },
      { path: 'section', select: '_id sectionName' },
      { path: 'topic', select: '_id topicName' }
    ]);

    res.status(201).json(createdPdf);

  } catch (error: any) {
    // Error handling with file cleanup
    if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        for (const field in files) {
          if (files[field]?.[0]?.path) {
             await fs.unlink(files[field][0].path).catch(err => console.error("Cleanup failed:", err));
          }
        }
    }
    console.error('Error creating PDF:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
// @desc    Get all PDFs (no change needed here for Zod)
// @route   GET /api/pdfs
// @access  Public
export const getPdfs = async (req: Request, res: Response): Promise<void> => {
  try {
    const pdfs = await Pdf.find({})
      .populate('mainCategory', '_id mainCategoryName')
      .populate('category', '_id categoryName')
      .populate('section', '_id sectionName')
      .populate('topic', '_id topicName');

    if (pdfs.length > 0) {
      // If data is found, send 200 OK with the PDFs
      res.status(200).json(pdfs);
    } else {
      // If no data is found, send 201 Created with an empty array.
      // As discussed for GET requests on collections with no results,
      // 200 OK with an empty array is the more standard and recommended practice.
      res.status(201).json([]);
    }
  } catch (error: any) {
    // If an error occurs during the database query, send 500 Internal Server Error
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get a single PDF by ID (no change needed here for Zod)
// @route   GET /api/pdfs/:id
// @access  Public
export const getPdfById = async (req: Request, res: Response): Promise<void> => {
  try {
    const pdfItem = await Pdf.findById(req.params.id)
      .populate('mainCategory', '_id mainCategoryName')
      .populate('category', '_id categoryName')
      .populate('section', '_id sectionName')
      .populate('topic', '_id topicName');

    if (pdfItem) {
      // If the PDF is found, send 200 OK
      res.status(200).json(pdfItem);
    } else {
      // If the PDF is NOT found, send 404 Not Found.
      // This is the correct HTTP status code for a specific resource not found by ID.
      res.status(404).json({ message: 'PDF not found' });
    }
  } catch (error: any) {
    // If there's a server error (e.g., database connection issue, invalid ID format)
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Update a PDF
// @route   PUT /api/pdfs/:id
// @access  Public
export const updatePdf = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Zod validation for update
    const validationResult = updatePdfSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    const updates = validationResult.data; // Use validated data for updates

    // Explicitly type pdfItem to help TypeScript
    const pdfItem: IPdf | null = await Pdf.findById(req.params.id);

    if (pdfItem) {
      // Validate relationships if they are being updated
      if (updates.mainCategory && !(await validateReference(MainCategory, updates.mainCategory, 'Main Category', res))) return;
      if (updates.category && !(await validateReference(Category, updates.category, 'Category', res))) return;
      if (updates.section && !(await validateReference(Section, updates.section, 'Section', res))) return;
      if (updates.topic && !(await validateReference(Topic, updates.topic, 'Topic', res))) return;

      // Check for duplicate title if it's being changed
      if (updates.title && updates.title !== pdfItem.title) {
        const existingPdfWithNewTitle = await Pdf.findOne({ title: updates.title });
        if (existingPdfWithNewTitle) {
          if (!(pdfItem._id as Types.ObjectId).equals(existingPdfWithNewTitle._id as Types.ObjectId)) {
            res.status(400).json({ message: 'A PDF with this title already exists.' });
            return;
          }
        }
      }

      // Apply updates from validated data. Object.assign handles undefined fields from Zod's .partial()
      Object.assign(pdfItem, updates);

      const updatedPdf = await pdfItem.save();
      const populatedPdf = await Pdf.findById(updatedPdf._id)
        .populate('mainCategory', '_id mainCategoryName')
        .populate('category', '_id categoryName')
        .populate('section', '_id sectionName')
        .populate('topic', '_id topicName');

      res.status(200).json(populatedPdf);
    } else {
      res.status(404).json({ message: 'PDF not found' });
    }
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Duplicate key error: PDF Title must be unique.' });
      return;
    }
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Delete a PDF (no change needed here for Zod)
// @route   DELETE /api/pdfs/:id
// @access  Public
export const deletePdf = async (req: Request, res: Response): Promise<void> => {
  try {
    const pdfItem = await Pdf.findById(req.params.id);

    if (pdfItem) {
      await Pdf.deleteOne({ _id: pdfItem._id });
      res.status(200).json({ message: 'PDF removed' });
    } else {
      res.status(404).json({ message: 'PDF not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};