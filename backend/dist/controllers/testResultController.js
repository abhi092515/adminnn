"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAllTestAnalysis = exports.getTestResultsByUserAndCourse = exports.deleteTestResult = exports.createOrUpdateTestResult = void 0;
const TestResult_1 = __importDefault(require("../models/TestResult"));
// Remove User import since we're not managing users locally
const Course_1 = __importDefault(require("../models/Course"));
const testResultSchemas_1 = require("../schemas/testResultSchemas");
const dbHelpers_1 = require("../utils/dbHelpers");
// @desc    Create or update a test result
// @route   POST /api/test-results
// @access  Public
const createOrUpdateTestResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = testResultSchemas_1.testResultSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                message: 'Validation failed', errors: validationResult.error.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message
                })),
                data: null
            });
            return;
        }
        const validatedData = validationResult.data;
        // Validate referenced course (userId is external, no validation needed)
        if (!(yield (0, dbHelpers_1.validateReference)(Course_1.default, validatedData.courseId, 'Course', res)))
            return;
        const testResult = yield TestResult_1.default.findOneAndUpdate({
            seriesId: validatedData.seriesId,
            userId: validatedData.userId,
            courseId: validatedData.courseId
        }, validatedData, {
            new: true,
            upsert: true,
            runValidators: true // Run mongoose validators
        }).populate('courseId', 'title'); // Only populate course, not user since it's external
        res.status(201).json({
            state: 201,
            message: 'Test result saved successfully',
            data: testResult
        });
    }
    catch (error) {
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
});
exports.createOrUpdateTestResult = createOrUpdateTestResult;
// @desc    Delete a test result by ID
// @route   DELETE /api/test-results/:id
// @access  Public
const deleteTestResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paramValidation = testResultSchemas_1.getTestResultByIdSchema.safeParse({ id: req.params.id });
        if (!paramValidation.success) {
            res.status(400).json({
                state: 400,
                message: 'Invalid test result ID format',
                data: null
            });
            return;
        }
        const deletedTestResult = yield TestResult_1.default.findByIdAndDelete(req.params.id);
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
    }
    catch (error) {
        console.error('Error in deleteTestResult:', error);
        res.status(500).json({
            state: 500,
            message: 'Internal server error',
            data: null
        });
    }
});
exports.deleteTestResult = deleteTestResult;
// @desc    Get test results by userId and courseId (POST)
// @route   POST /api/test-results/search
// @access  Public
const getTestResultsByUserAndCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = testResultSchemas_1.getTestResultsByUserAndCoursePostSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                message: 'Validation failed',
                errors: validationResult.error.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message
                })),
                data: null
            });
            return;
        }
        const { userId, courseId } = validationResult.data;
        // Validate course reference (userId is external, no validation needed)
        if (!(yield (0, dbHelpers_1.validateReference)(Course_1.default, courseId, 'Course', res)))
            return;
        // Simple query without filtering
        const testResults = yield TestResult_1.default.find({
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
    }
    catch (error) {
        console.error('Error in getTestResultsByUserAndCourse:', error);
        res.status(500).json({
            state: 500,
            message: 'Internal server error',
            data: null
        });
    }
});
exports.getTestResultsByUserAndCourse = getTestResultsByUserAndCourse;
const getUserAllTestAnalysis = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = testResultSchemas_1.getTestResultsByUserAndCoursePostSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                message: 'Validation failed',
                errors: validationResult.error.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message
                })),
                data: null
            });
            return;
        }
        const { userId, courseId } = validationResult.data;
        // Validate course reference (userId is external, no validation needed)
        if (!(yield (0, dbHelpers_1.validateReference)(Course_1.default, courseId, 'Course', res)))
            return;
        const testResults = yield TestResult_1.default.find({
            userId: userId,
            courseId: courseId
        })
            .populate('courseId', 'title'); // Only populate course, not user since it's external
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
    catch (error) {
        console.error('Error in getUserAllTestAnalysis:', error);
        res.status(500).json({
            state: 500,
            message: 'Internal server error',
            data: null
        });
    }
});
exports.getUserAllTestAnalysis = getUserAllTestAnalysis;
