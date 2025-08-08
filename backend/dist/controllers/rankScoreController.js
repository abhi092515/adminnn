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
exports.getCourseLeaderboard = exports.getUserRankScores = exports.getRankScores = exports.getMaxRankScore = exports.createRankScore = void 0;
const mongoose_1 = require("mongoose");
const RankScore_1 = __importDefault(require("../models/RankScore"));
const rankScoreSchemas_1 = require("../schemas/rankScoreSchemas");
// @desc    Create a new rank score record
// @route   POST /api/rank-scores
// @access  Public
const createRankScore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request data
        const validationResult = rankScoreSchemas_1.createRankScoreSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                message: 'Validation failed',
                errors: validationResult.error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                })),
                data: null
            });
            return;
        }
        const validatedData = validationResult.data;
        // Create new rank score record with ObjectId conversion for courseId
        const newRankScore = new RankScore_1.default(Object.assign(Object.assign({}, validatedData), { courseId: new mongoose_1.Types.ObjectId(validatedData.courseId) }));
        const savedRankScore = yield newRankScore.save();
        res.status(201).json({
            state: 201,
            message: 'Rank score created successfully',
            data: savedRankScore
        });
    }
    catch (error) {
        console.error('Error creating rank score:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: null
        });
    }
});
exports.createRankScore = createRankScore;
// @desc    Get max rank score for a user-course combination
// @route   POST /api/rank-scores/max
// @access  Public
const getMaxRankScore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request data
        const validationResult = rankScoreSchemas_1.getRankScoreSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                message: 'Validation failed',
                errors: validationResult.error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                })),
                data: null
            });
            return;
        }
        const { userId, courseId } = validationResult.data;
        // Find the maximum rank score for this user-course combination
        const maxRankScore = yield RankScore_1.default.findOne({
            userId: userId,
            courseId: new mongoose_1.Types.ObjectId(courseId)
        })
            .sort({ rank_score: -1 }) // Sort by rank_score in descending order
            .limit(1);
        if (!maxRankScore) {
            res.status(404).json({
                state: 404,
                message: 'No rank scores found for this user-course combination',
                data: null
            });
            return;
        }
        res.status(200).json({
            state: 200,
            message: 'Max rank score retrieved successfully',
            data: {
                userId: maxRankScore.userId,
                courseId: maxRankScore.courseId,
                max_rank_score: maxRankScore.rank_score,
                level_score: maxRankScore.level_score,
                level: maxRankScore.level,
                achieved_at: maxRankScore.createdAt
            }
        });
    }
    catch (error) {
        console.error('Error fetching max rank score:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: null
        });
    }
});
exports.getMaxRankScore = getMaxRankScore;
// @desc    Get all rank scores with optional filtering
// @route   GET /api/rank-scores
// @access  Public
const getRankScores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate query parameters
        const validationResult = rankScoreSchemas_1.getRankScoresSchema.safeParse(req.query);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                message: 'Invalid query parameters',
                errors: validationResult.error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                })),
                data: null
            });
            return;
        }
        const filters = validationResult.data;
        // Build query object
        const query = {};
        if (filters.userId)
            query.userId = filters.userId;
        if (filters.courseId)
            query.courseId = new mongoose_1.Types.ObjectId(filters.courseId);
        if (filters.level)
            query.level = filters.level;
        // Pagination
        const limit = filters.limit || 10;
        const page = filters.page || 1;
        const skip = (page - 1) * limit;
        // Get rank scores with pagination
        const rankScores = yield RankScore_1.default.find(query)
            .sort({ rank_score: -1, createdAt: -1 })
            .limit(limit)
            .skip(skip);
        // Get total count for pagination info
        const totalCount = yield RankScore_1.default.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);
        res.status(200).json({
            state: 200,
            message: 'Rank scores retrieved successfully',
            data: {
                rankScores,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching rank scores:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: null
        });
    }
});
exports.getRankScores = getRankScores;
// @desc    Get rank scores for a specific user across all courses
// @route   GET /api/rank-scores/user/:userId
// @access  Public
const getUserRankScores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({
                state: 400,
                message: 'User ID is required',
                data: null
            });
            return;
        } // Get all rank scores for the user, grouped by course with max rank score
        const userRankScores = yield RankScore_1.default.aggregate([
            { $match: { userId: userId } },
            {
                $sort: { rank_score: -1 }
            },
            {
                $group: {
                    _id: '$courseId',
                    max_rank_score: { $max: '$rank_score' },
                    best_level_score: { $first: '$level_score' },
                    best_level: { $first: '$level' },
                    latest_attempt: { $max: '$createdAt' },
                    total_attempts: { $sum: 1 }
                }
            },
            {
                $project: {
                    courseId: '$_id',
                    max_rank_score: 1,
                    best_level_score: 1,
                    best_level: 1,
                    latest_attempt: 1,
                    total_attempts: 1,
                    _id: 0
                }
            },
            { $sort: { max_rank_score: -1 } }
        ]);
        res.status(200).json({
            state: 200,
            message: 'User rank scores retrieved successfully',
            data: {
                userId,
                courses: userRankScores,
                total_courses: userRankScores.length
            }
        });
    }
    catch (error) {
        console.error('Error fetching user rank scores:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: null
        });
    }
});
exports.getUserRankScores = getUserRankScores;
// @desc    Get leaderboard for a specific course
// @route   GET /api/rank-scores/leaderboard/:courseId
// @access  Public
const getCourseLeaderboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        if (!courseId) {
            res.status(400).json({
                state: 400,
                message: 'Course ID is required',
                data: null
            });
            return;
        }
        // Validate courseId format
        if (!mongoose_1.Types.ObjectId.isValid(courseId)) {
            res.status(400).json({
                state: 400,
                message: 'Invalid course ID format',
                data: null
            });
            return;
        } // Get leaderboard for the course (max rank score per user)
        const leaderboard = yield RankScore_1.default.aggregate([
            { $match: { courseId: new mongoose_1.Types.ObjectId(courseId) } },
            {
                $sort: { rank_score: -1 }
            },
            {
                $group: {
                    _id: '$userId',
                    max_rank_score: { $max: '$rank_score' },
                    best_level_score: { $first: '$level_score' },
                    best_level: { $first: '$level' },
                    latest_attempt: { $max: '$createdAt' }
                }
            },
            {
                $project: {
                    userId: '$_id',
                    max_rank_score: 1,
                    best_level_score: 1,
                    best_level: 1,
                    latest_attempt: 1,
                    _id: 0
                }
            },
            { $sort: { max_rank_score: -1 } },
            { $limit: limit }
        ]);
        res.status(200).json({
            state: 200,
            message: 'Course leaderboard retrieved successfully',
            data: {
                courseId,
                leaderboard: leaderboard.map((entry, index) => (Object.assign(Object.assign({}, entry), { rank: index + 1 }))),
                total_participants: leaderboard.length
            }
        });
    }
    catch (error) {
        console.error('Error fetching course leaderboard:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: null
        });
    }
});
exports.getCourseLeaderboard = getCourseLeaderboard;
