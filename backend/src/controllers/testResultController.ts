// src/controllers/testResultController.ts
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import TestResult, { ITestResult } from '../models/TestResult';
// Remove User import since we're not managing users locally
import Course from '../models/Course';
import {
  testResultSchema,
  getTestResultByIdSchema,
  testResultFilterSchema,
  getTestResultsByUserAndCourseSchema,
  getTestResultsByUserAndCoursePostSchema
} from '../schemas/testResultSchemas';
import { z } from 'zod';

import { validateReference } from '../utils/dbHelpers';

// @desc    Create or update a test result
// @route   POST /api/test-results
// @access  Public
export const createOrUpdateTestResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationResult = testResultSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        state: 400,
        message: 'Validation failed',        errors: validationResult.error.errors.map((err: any) => ({
          path: err.path.join('.'),
          message: err.message
        })),
        data: null
      });
      return;
    }    const validatedData = validationResult.data;

    // Validate referenced course (userId is external, no validation needed)
    if (!(await validateReference(Course, validatedData.courseId, 'Course', res))) return;

    const testResult = await TestResult.findOneAndUpdate(
      {
        seriesId: validatedData.seriesId,
        userId: validatedData.userId,
        courseId: validatedData.courseId
      },
      validatedData,
      {
        new: true, 
        upsert: true, 
        runValidators: true // Run mongoose validators
      }    ).populate('courseId', 'title'); // Only populate course, not user since it's external

    res.status(201).json({
      state: 201,
      message: 'Test result saved successfully',
      data: testResult
    });
  } catch (error: any) {
    console.error('Error in createOrUpdateTestResult:', error);
    
    // Handle duplicate key error (shouldn't occur with upsert, but just in case)
    if (error.code === 11000) {
      res.status(409).json({
        state: 409,
        message: 'Test result already exists for this combination',
        data: null
      });
      return;
    }

    res.status(500).json({
      state: 500,
      message: 'Internal server error',
      data: null
    });
  }
};

// @desc    Delete a test result by ID
// @route   DELETE /api/test-results/:id
// @access  Public
export const deleteTestResult = async (req: Request, res: Response): Promise<void> => {
  try {

    const paramValidation = getTestResultByIdSchema.safeParse({ id: req.params.id });

    if (!paramValidation.success) {
      res.status(400).json({
        state: 400,
        message: 'Invalid test result ID format',
        data: null
      });
      return;
    }

    const deletedTestResult = await TestResult.findByIdAndDelete(req.params.id);

    if (!deletedTestResult) {
      res.status(404).json({
        state: 404,
        message: 'Test result not found',
        data: null
      });
      return;
    }

    res.status(200).json({
      state: 200,
      message: 'Test result deleted successfully',
      data: deletedTestResult
    });
  } catch (error: any) {
    console.error('Error in deleteTestResult:', error);
    res.status(500).json({
      state: 500,
      message: 'Internal server error',
      data: null
    });
  }
};

// @desc    Get test results by userId and courseId (POST)
// @route   POST /api/test-results/search
// @access  Public
export const getTestResultsByUserAndCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationResult = getTestResultsByUserAndCoursePostSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        state: 400,
        message: 'Validation failed',
        errors: validationResult.error.errors.map((err: any) => ({
          path: err.path.join('.'),
          message: err.message
        })),
        data: null
      });
      return;
    }    const { userId, courseId } = validationResult.data;

    // Validate course reference (userId is external, no validation needed)
    if (!(await validateReference(Course, courseId, 'Course', res))) return;

    // Simple query without filtering
    const testResults = await TestResult.find({
      userId: userId,
      courseId: courseId
    })
      .populate('courseId', 'title') // Only populate course, not user since it's external
      .sort({ createdAt: -1 });

    res.status(200).json({
      state: 200,
      message: 'Test results retrieved successfully',
      data: testResults
    });
  } catch (error: any) {
    console.error('Error in getTestResultsByUserAndCourse:', error);
    res.status(500).json({
      state: 500,
      message: 'Internal server error',
      data: null
    });
  }
};



export const getUserAllTestAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
     const validationResult = getTestResultsByUserAndCoursePostSchema.safeParse(req.body);

        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                message: 'Validation failed',
                errors: validationResult.error.errors.map((err: any) => ({  
                    path: err.path.join('.'),
                    message: err.message
                })),
                data: null
            });
            return;
          }
            const { userId, courseId } = validationResult.data;

    // Validate course reference (userId is external, no validation needed)
    if (!(await validateReference(Course, courseId, 'Course', res))) return;

    const testResults = await TestResult.find({
        userId: userId,
        courseId: courseId
    })
    .populate('courseId', 'title') // Only populate course, not user since it's external


    const totalTests = testResults.length;
    const totalScore = testResults.reduce((acc, result) => acc + result.score, 0);
    const averageScore = totalTests > 0 ? totalScore / totalTests : 0;
    const totalTimeSpent = testResults.reduce((acc, result) => acc + result.timeSpent, 0);
    const averageTimeSpent = totalTests > 0 ? totalTimeSpent / totalTests : 0;
    const totalAccuracy = testResults.reduce((acc, result) => acc + result.accuracy, 0);
    const averageAccuracy = totalTests > 0 ? totalAccuracy / totalTests : 0;
    const totalQuestionsAttempted = testResults.reduce((acc, result) => acc + result.questionsAttempted, 0);
    const totalQuestions = testResults.reduce((acc, result) => acc + result.totalQuestions, 0);


    
    res.status(200).json({
        state: 200,
        message: 'Test analysis retrieved successfully',
        data: {

            attemptedTests: totalTests,
            averageScore,
            totalTimeSpent,
            averageTimeSpent,
            totalAccuracy,
            averageAccuracy,
            totalQuestionsAttempted,
            totalQuestions,
          }
    });



    }
    catch (error: any) {
        console.error('Error in getUserAllTestAnalysis:', error);
        res.status(500).json({
            state: 500,
            message: 'Internal server error',
            data: null
        });
    }
}