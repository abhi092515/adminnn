// src/controllers/teacherController.ts
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Teacher, { ITeacher } from '../models/teacher'; // Import the Teacher model

// Import Zod schemas
import { createTeacherSchema, updateTeacherSchema } from '../schemas/teacherSchemas';
import { z } from 'zod';

// Helper function to check if a referenced ID is valid and exists (not strictly needed for Teacher's own CRUD, but good to keep if it were to reference other models)
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


// @desc    Create a new Teacher
// @route   POST /api/teachers
// @access  Public
export const createTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    // Zod validation
    const validationResult = createTeacherSchema.safeParse(req.body);

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

    const validatedData = validationResult.data;

    // Check for existing Teacher name (assuming name should be unique)
    const existingTeacher = await Teacher.findOne({ name: validatedData.name });
    if (existingTeacher) {
      res.status(400).json({ message: 'A teacher with this name already exists.' });
      return;
    }

    const newTeacher: ITeacher = new Teacher(validatedData);
    const createdTeacher = await newTeacher.save();

    res.status(201).json(createdTeacher);
  } catch (error: any) {
    if (error.code === 11000) { // Duplicate key error from MongoDB unique index
      res.status(400).json({ message: 'Duplicate key error: Teacher Name must be unique.' });
      return;
    }
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get all Teachers
// @route   GET /api/teachers
// @access  Public
export const getTeachers = async (req: Request, res: Response): Promise<void> => {
  try {
    const teachers = await Teacher.find({});

    if (teachers.length > 0) {
      // If data is found, send 200 OK with the teachers
      res.status(200).json(teachers);
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

// @desc    Get a single Teacher by ID
// @route   GET /api/teachers/:id
// @access  Public
export const getTeacherById = async (req: Request, res: Response): Promise<void> => {
  try {
    const teacherItem = await Teacher.findById(req.params.id);

    if (teacherItem) {
      res.status(200).json(teacherItem);
    } else {
      res.status(404).json({ message: 'Teacher not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Update a Teacher
// @route   PUT /api/teachers/:id
// @access  Public
export const updateTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    // Zod validation for update
    const validationResult = updateTeacherSchema.safeParse(req.body);

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

    const updates = validationResult.data;

    const teacherItem: ITeacher | null = await Teacher.findById(req.params.id);

    if (teacherItem) {
      // Check for duplicate name if it's being changed
      if (updates.name && updates.name !== teacherItem.name) {
        const existingTeacherWithNewName = await Teacher.findOne({ name: updates.name });
        if (existingTeacherWithNewName) {
          if (!(teacherItem._id as Types.ObjectId).equals(existingTeacherWithNewName._id as Types.ObjectId)) {
            res.status(400).json({ message: 'A teacher with this name already exists.' });
            return;
          }
        }
      }

      // Apply updates from validated data
      Object.assign(teacherItem, updates);

      const updatedTeacher = await teacherItem.save();
      res.status(200).json(updatedTeacher);
    } else {
      res.status(404).json({ message: 'Teacher not found' });
    }
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Duplicate key error: Teacher Name must be unique.' });
      return;
    }
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Delete a Teacher
// @route   DELETE /api/teachers/:id
// @access  Public
export const deleteTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const teacherItem = await Teacher.findById(req.params.id);

    if (teacherItem) {
      await Teacher.deleteOne({ _id: teacherItem._id });
      res.status(200).json({ message: 'Teacher removed' });
    } else {
      res.status(404).json({ message: 'Teacher not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};