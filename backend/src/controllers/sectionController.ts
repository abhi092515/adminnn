// src/controllers/sectionController.ts
import { Request, Response } from 'express';
import Section, { ISection } from '../models/Section';
import { Types } from 'mongoose';

// Import Zod schemas
import { z } from 'zod';
import { createSectionSchema, updateSectionSchema } from '../schemas/sectionSchemas';

// @desc    Create a new section
// @route   POST /api/sections
// @access  Public
export const createSection = async (req: Request, res: Response): Promise<void> => {
  try {
    // Zod validation
    const validationResult = createSectionSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        state: 400,
        msg: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        })),
        data: null
      });
      return;
    }

    const { sectionName, status } = validationResult.data;

    // Explicit check for existing section name
    const existingSection = await Section.findOne({ sectionName });
    if (existingSection) {
      res.status(400).json({
        state: 400,
        msg: 'A section with this name already exists.',
        data: null
      });
      return;
    }

    const newSection: ISection = new Section({
      sectionName,
      status,
    });

    const createdSection = await newSection.save();
    res.status(200).json({ // Changed to 200 for success
      state: 200,
      msg: 'Section created successfully',
      data: createdSection
    });
  } catch (error: any) {
    if (error.code === 11000) { // Duplicate key error from MongoDB unique index
      res.status(400).json({
        state: 400,
        msg: 'Duplicate key error: Section Name must be unique.',
        data: null
      });
      return;
    }
    console.error('Error creating section:', error); // Log the error for debugging
    res.status(500).json({
      state: 500,
      msg: error.message || 'Server Error',
      data: null
    });
  }
};

// @desc    Get all sections
// @route   GET /api/sections
// @access  Public
export const getSections = async (req: Request, res: Response): Promise<void> => {
  try {
    const sections = await Section.find({});

    if (sections.length > 0) {
      res.status(200).json({
        state: 200,
        msg: 'success',
        data: sections
      });
    } else {
      // Consistent with your request: 201 for "no data found"
      res.status(201).json({
        state: 201,
        msg: 'No sections found',
        data: []
      });
    }
  } catch (error: any) {
    console.error('Error fetching sections:', error);
    res.status(500).json({
      state: 500,
      msg: error.message || 'Server Error',
      data: []
    });
  }
};

// @desc    Get a single section by ID
// @route   GET /api/sections/:id
// @access  Public
export const getSectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const section = await Section.findById(req.params.id);

    if (section) {
      res.status(200).json({
        state: 200,
        msg: 'success',
        data: section
      });
    } else {
      // Consistent with your request: 201 for "not found"
      res.status(201).json({
        state: 201,
        msg: 'Section not found',
        data: null
      });
    }
  } catch (error: any) {
    console.error('Error fetching section by ID:', error);
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      res.status(400).json({
        state: 400,
        msg: 'Invalid Section ID format.',
        data: null
      });
    } else {
      res.status(500).json({
        state: 500,
        msg: error.message || 'Server Error',
        data: null
      });
    }
  }
};

// @desc    Update a section
// @route   PUT /api/sections/:id
// @access  Public
export const updateSection = async (req: Request, res: Response): Promise<void> => {
  try {
    // Zod validation for update
    const validationResult = updateSectionSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        state: 400,
        msg: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        })),
        data: null
      });
      return;
    }

    const updates = validationResult.data;

    const section: ISection | null = await Section.findById(req.params.id);

    if (section) {
      // Check for duplicate section name if it's being changed
      if (updates.sectionName && updates.sectionName !== section.sectionName) {
        const existingSectionWithNewName = await Section.findOne({ sectionName: updates.sectionName });
        if (existingSectionWithNewName) {
          const currentSectionId = section._id as Types.ObjectId;
          const foundSectionId = existingSectionWithNewName._id as Types.ObjectId;

          if (!currentSectionId.equals(foundSectionId)) {
            res.status(400).json({
              state: 400,
              msg: 'A section with this name already exists.',
              data: null
            });
            return;
          }
        }
      }

      // Apply updates
      Object.assign(section, updates);

      const updatedSection = await section.save();
      res.status(200).json({
        state: 200,
        msg: 'Section updated successfully',
        data: updatedSection
      });
    } else {
      // Consistent with your request: 201 for "not found"
      res.status(201).json({
        state: 201,
        msg: 'Section not found',
        data: null
      });
    }
  } catch (error: any) {
    if (error.code === 11000) { // Duplicate key error from MongoDB unique index
      res.status(400).json({
        state: 400,
        msg: 'Duplicate key error: Section Name must be unique.',
        data: null
      });
      return;
    }
    console.error('Error updating section:', error);
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      res.status(400).json({
        state: 400,
        msg: 'Invalid Section ID format.',
        data: null
      });
    } else {
      res.status(500).json({
        state: 500,
        msg: error.message || 'Server Error',
        data: null
      });
    }
  }
};

// @desc    Delete a section
// @route   DELETE /api/sections/:id
// @access  Public
export const deleteSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const section = await Section.findById(req.params.id);

    if (section) {
      await Section.deleteOne({ _id: section._id });
      res.status(200).json({
        state: 200,
        msg: 'Section removed successfully',
        data: null
      });
    } else {
      // Consistent with your request: 201 for "not found"
      res.status(201).json({
        state: 201,
        msg: 'Section not found',
        data: null
      });
    }
  } catch (error: any) {
    console.error('Error deleting section:', error);
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      res.status(400).json({
        state: 400,
        msg: 'Invalid Section ID format.',
        data: null
      });
    } else {
      res.status(500).json({
        state: 500,
        msg: error.message || 'Server Error',
        data: null
      });
    }
  }
};