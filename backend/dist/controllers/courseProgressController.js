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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourseProgress = void 0;
const mongoose_1 = require("mongoose");
const courseProgressUtils_1 = require("../utils/courseProgressUtils");
// @desc    Get course progress percentage based on time watched
// @route   POST /api/course-progress
// @access  Public
const getCourseProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, userId } = req.body;
        if (!courseId || !userId) {
            res.status(400).json({
                state: 400,
                message: 'Both courseId and userId are required',
                data: null
            });
            return;
        }
        if (!mongoose_1.Types.ObjectId.isValid(courseId)) {
            res.status(400).json({
                state: 400,
                message: 'Invalid Course ID format',
                data: null
            });
            return;
        }
        console.log('🔍 Debug: Starting course progress calculation');
        console.log('📊 Course ID:', courseId);
        console.log('👤 User ID:', userId);
        const courseProgress = yield (0, courseProgressUtils_1.calculateCourseProgress)(new mongoose_1.Types.ObjectId(courseId), userId);
        if (!courseProgress) {
            console.log('❌ No course found with ID:', courseId);
            res.status(404).json({
                state: 404,
                message: 'Course not found',
                data: null
            });
            return;
        }
        console.log('📈 Course progress result:', JSON.stringify(courseProgress, null, 2));
        res.status(200).json({
            state: 200,
            message: 'Course progress retrieved successfully',
            data: {
                accuracy: courseProgress.accuracy,
                progressPercentage: courseProgress.progressPercentage,
                batch_rank: courseProgress.batch_rank,
                level: courseProgress.level
            }
        });
    }
    catch (error) {
        console.error('Error fetching course progress:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: null
        });
    }
});
exports.getCourseProgress = getCourseProgress;
