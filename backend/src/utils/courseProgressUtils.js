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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCourseProgress = exports.calculateMultipleCourseProgress = exports.buildCourseProgressPipeline = void 0;
var Course_1 = require("../models/Course");
var TestResult_1 = require("../models/TestResult");
var RankScore_1 = require("../models/RankScore");
/**
 * Aggregation pipeline to calculate course progress percentage based on class completion
 * @param courseId - ObjectId of the course
 * @param userId - String ID of the user
 * @returns Aggregation pipeline array
 */
var buildCourseProgressPipeline = function (courseId, userId) { return [
    { $match: { _id: courseId } },
    {
        $lookup: {
            from: 'classes',
            let: { courseMainCategory: '$mainCategory', courseCategory: '$category' },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$mainCategory', '$$courseMainCategory'] },
                                { $eq: ['$category', '$$courseCategory'] },
                                { $eq: ['$status', 'active'] }
                            ]
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'classprogresses',
                        let: { classId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: [{ $toObjectId: '$classId' }, '$$classId'] },
                                            { $eq: ['$userId', userId] }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    userStartTime: 1,
                                    userEndTime: 1,
                                    classId: 1,
                                    userId: 1
                                }
                            }
                        ],
                        as: 'userProgress'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        userProgress: 1,
                        hasProgress: { $gt: [{ $size: '$userProgress' }, 0] }
                    }
                }
            ],
            as: 'classes'
        }
    },
    {
        $addFields: {
            totalClasses: { $size: '$classes' },
            classesWithProgress: {
                $size: {
                    $filter: {
                        input: '$classes',
                        cond: { $gt: [{ $size: '$$this.userProgress' }, 0] }
                    }
                }
            }
        }
    },
    {
        $addFields: {
            progressPercentage: {
                $cond: {
                    if: { $gt: ['$totalClasses', 0] },
                    then: {
                        $round: [
                            {
                                $multiply: [
                                    { $divide: ['$classesWithProgress', '$totalClasses'] },
                                    100
                                ]
                            },
                            2
                        ]
                    },
                    else: 0
                }
            }
        }
    },
    {
        $project: {
            _id: 0,
            courseId: '$_id',
            courseTitle: '$title',
            progressPercentage: 1,
            totalClasses: 1,
            classesWithProgress: 1
        }
    }
]; };
exports.buildCourseProgressPipeline = buildCourseProgressPipeline;
/**
 * Calculate simple course progress (just percentage) for multiple courses
 * @param courseIds - Array of course ObjectIds
 * @param userId - String ID of the user
 * @returns Promise<SimpleCourseProgress[]>
 */
var calculateMultipleCourseProgress = function (courseIds, userId) { return __awaiter(void 0, void 0, void 0, function () {
    var pipeline, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (courseIds.length === 0)
                    return [2 /*return*/, []];
                pipeline = [
                    { $match: { _id: { $in: courseIds } } },
                    {
                        $lookup: {
                            from: 'classes',
                            let: { courseMainCategory: '$mainCategory', courseCategory: '$category' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ['$mainCategory', '$$courseMainCategory'] },
                                                { $eq: ['$category', '$$courseCategory'] },
                                                { $eq: ['$status', 'active'] }
                                            ]
                                        }
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'classprogresses',
                                        let: { classId: '$_id' },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $and: [
                                                            { $eq: [{ $toObjectId: '$classId' }, '$$classId'] },
                                                            { $eq: ['$userId', userId] }
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $project: {
                                                    _id: 0,
                                                    classId: 1,
                                                    userId: 1
                                                }
                                            }
                                        ],
                                        as: 'userProgress'
                                    }
                                },
                                {
                                    $project: {
                                        _id: 1,
                                        hasProgress: { $gt: [{ $size: '$userProgress' }, 0] }
                                    }
                                }
                            ],
                            as: 'classes'
                        }
                    },
                    {
                        $addFields: {
                            totalClasses: { $size: '$classes' },
                            classesWithProgress: {
                                $size: {
                                    $filter: {
                                        input: '$classes',
                                        cond: { $gt: [{ $size: '$$this.userProgress' }, 0] }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $addFields: {
                            progressPercentage: {
                                $cond: {
                                    if: { $gt: ['$totalClasses', 0] },
                                    then: {
                                        $round: [
                                            {
                                                $multiply: [
                                                    { $divide: ['$classesWithProgress', '$totalClasses'] },
                                                    100
                                                ]
                                            },
                                            2
                                        ]
                                    },
                                    else: 0
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            courseId: { $toString: '$_id' },
                            progressPercentage: 1
                        }
                    }
                ];
                return [4 /*yield*/, Course_1.default.aggregate(pipeline)];
            case 1:
                results = _a.sent();
                return [2 /*return*/, results];
        }
    });
}); };
exports.calculateMultipleCourseProgress = calculateMultipleCourseProgress;
/**
 * Calculate comprehensive course progress including accuracy, rank, and level
 * @param courseId - ObjectId of the course
 * @param userId - String ID of the user
 * @returns Promise<CourseProgressResult | null>
 */
var calculateCourseProgress = function (courseId, userId) { return __awaiter(void 0, void 0, void 0, function () {
    var progressResult, courseProgress, testResults, totalTests, totalAttemptedAccuracy, totalCoursesAttempt, userBatchAccuracy, userBatchCompletionPercentage, rank_score, level_score, level, rankScoreData, newRankScore, rankScoreError_1, batch_rank, maxRankScore, maxRankError_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Course_1.default.aggregate((0, exports.buildCourseProgressPipeline)(courseId, userId))];
            case 1:
                progressResult = _a.sent();
                if (!progressResult || progressResult.length === 0) {
                    return [2 /*return*/, null];
                }
                courseProgress = progressResult[0];
                return [4 /*yield*/, TestResult_1.default.find({
                        userId: userId,
                        courseId: courseId
                    })];
            case 2:
                testResults = _a.sent();
                totalTests = testResults.length;
                totalAttemptedAccuracy = testResults.reduce(function (acc, result) { return acc + result.accuracy; }, 0);
                totalCoursesAttempt = totalTests;
                userBatchAccuracy = totalCoursesAttempt > 0 ? (totalAttemptedAccuracy / totalCoursesAttempt) : 0;
                userBatchCompletionPercentage = courseProgress.progressPercentage;
                rank_score = (userBatchAccuracy * 70 / 100) + (userBatchCompletionPercentage * 30 / 100);
                level_score = (userBatchAccuracy * 90 / 100) + (userBatchCompletionPercentage * 10 / 100);
                if (level_score < 40) {
                    level = 'Beginner';
                }
                else if (level_score > 40 && level_score < 80) {
                    level = 'Medium';
                }
                else if (level_score >= 80 && level_score <= 90) {
                    level = 'Advanced';
                }
                else if (level_score > 90 && level_score <= 100) {
                    level = 'Pro';
                }
                else {
                    level = 'Beginner';
                }
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                rankScoreData = {
                    userId: userId,
                    courseId: courseId,
                    rank_score: Math.round(rank_score * 100) / 100,
                    level_score: Math.round(level_score * 100) / 100,
                    level: level
                };
                newRankScore = new RankScore_1.default(rankScoreData);
                return [4 /*yield*/, newRankScore.save()];
            case 4:
                _a.sent();
                console.log('✅ Rank score saved successfully:', rankScoreData);
                return [3 /*break*/, 6];
            case 5:
                rankScoreError_1 = _a.sent();
                console.error('⚠️ Error saving rank score:', rankScoreError_1.message);
                return [3 /*break*/, 6];
            case 6:
                batch_rank = Math.round(rank_score * 100) / 100;
                _a.label = 7;
            case 7:
                _a.trys.push([7, 9, , 10]);
                return [4 /*yield*/, RankScore_1.default.findOne({
                        userId: userId,
                        courseId: courseId
                    })
                        .sort({ rank_score: -1 })
                        .limit(1)];
            case 8:
                maxRankScore = _a.sent();
                if (maxRankScore && maxRankScore.rank_score > rank_score) {
                    batch_rank = Math.round(maxRankScore.rank_score * 100) / 100;
                    console.log('📈 Using max rank score:', batch_rank);
                }
                else {
                    console.log('📊 Using current rank score as max:', batch_rank);
                }
                return [3 /*break*/, 10];
            case 9:
                maxRankError_1 = _a.sent();
                console.error('⚠️ Error fetching max rank score:', maxRankError_1.message);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/, {
                    courseId: courseProgress.courseId.toString(),
                    courseTitle: courseProgress.courseTitle,
                    progressPercentage: courseProgress.progressPercentage,
                    totalClasses: courseProgress.totalClasses,
                    classesWithProgress: courseProgress.classesWithProgress,
                    accuracy: Math.round(userBatchAccuracy * 100) / 100,
                    batch_rank: batch_rank,
                    level: level
                }];
        }
    });
}); };
exports.calculateCourseProgress = calculateCourseProgress;
