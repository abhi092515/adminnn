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
exports.calculateCourseProgress = exports.calculateMultipleCourseProgress = exports.buildCourseProgressPipeline = void 0;
const Course_1 = __importDefault(require("../models/Course"));
const TestResult_1 = __importDefault(require("../models/TestResult"));
const RankScore_1 = __importDefault(require("../models/RankScore"));
/**
 * Aggregation pipeline to calculate course progress percentage based on class completion
 * @param courseId - ObjectId of the course
 * @param userId - String ID of the user
 * @returns Aggregation pipeline array
 */
const buildCourseProgressPipeline = (courseId, userId) => [
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
                        hasProgress: { $gt: [{ $size: { $ifNull: ['$userProgress', []] } }, 0] }
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
                        cond: {
                            $gt: [
                                {
                                    $size: {
                                        $ifNull: ['$$this.userProgress', []]
                                    }
                                },
                                0
                            ]
                        }
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
];
exports.buildCourseProgressPipeline = buildCourseProgressPipeline;
/**
 * Calculate simple course progress (just percentage) for multiple courses
 * @param courseIds - Array of course ObjectIds
 * @param userId - String ID of the user
 * @returns Promise<SimpleCourseProgress[]>
 */
const calculateMultipleCourseProgress = (courseIds, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (courseIds.length === 0)
        return [];
    const pipeline = [
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
                    }, {
                        $project: {
                            _id: 1,
                            hasProgress: { $gt: [{ $size: { $ifNull: ['$userProgress', []] } }, 0] }
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
                            cond: {
                                $gt: [
                                    {
                                        $size: {
                                            $ifNull: ['$$this.userProgress', []]
                                        }
                                    },
                                    0
                                ]
                            }
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
        }, {
            $project: {
                _id: 0,
                courseId: {
                    $cond: {
                        if: { $ne: ['$_id', null] },
                        then: { $toString: '$_id' },
                        else: null
                    }
                },
                progressPercentage: 1
            }
        }
    ];
    const results = yield Course_1.default.aggregate(pipeline);
    return results;
});
exports.calculateMultipleCourseProgress = calculateMultipleCourseProgress;
/**
 * Calculate comprehensive course progress including accuracy, rank, and level
 * @param courseId - ObjectId of the course
 * @param userId - String ID of the user
 * @returns Promise<CourseProgressResult | null>
 */
const calculateCourseProgress = (courseId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get basic progress percentage
    const progressResult = yield Course_1.default.aggregate((0, exports.buildCourseProgressPipeline)(courseId, userId));
    if (!progressResult || progressResult.length === 0) {
        return null;
    }
    const courseProgress = progressResult[0];
    // Get test results for accuracy calculation
    const testResults = yield TestResult_1.default.find({
        userId: userId,
        courseId: courseId
    });
    // Calculate accuracy metrics
    const totalTests = testResults.length;
    const totalAttemptedAccuracy = testResults.reduce((acc, result) => acc + result.accuracy, 0);
    const totalCoursesAttempt = totalTests;
    const userBatchAccuracy = totalCoursesAttempt > 0 ? (totalAttemptedAccuracy / totalCoursesAttempt) : 0;
    const userBatchCompletionPercentage = courseProgress.progressPercentage;
    // Calculate rank score and level score
    const rank_score = (userBatchAccuracy * 70 / 100) + (userBatchCompletionPercentage * 30 / 100);
    const level_score = (userBatchAccuracy * 90 / 100) + (userBatchCompletionPercentage * 10 / 100);
    // Determine level based on level_score
    let level;
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
    // Save rank score to database for future reference
    try {
        const rankScoreData = {
            userId: userId,
            courseId: courseId,
            rank_score: Math.round(rank_score * 100) / 100,
            level_score: Math.round(level_score * 100) / 100,
            level: level
        };
        const newRankScore = new RankScore_1.default(rankScoreData);
        yield newRankScore.save();
        console.log('✅ Rank score saved successfully:', rankScoreData);
    }
    catch (rankScoreError) {
        console.error('⚠️ Error saving rank score:', rankScoreError.message);
        // Continue execution even if rank score save fails
    }
    // Get the maximum rank score for this user-course combination
    let batch_rank = Math.round(rank_score * 100) / 100;
    try {
        const maxRankScore = yield RankScore_1.default.findOne({
            userId: userId,
            courseId: courseId
        })
            .sort({ rank_score: -1 })
            .limit(1);
        if (maxRankScore && maxRankScore.rank_score > rank_score) {
            batch_rank = Math.round(maxRankScore.rank_score * 100) / 100;
            console.log('📈 Using max rank score:', batch_rank);
        }
        else {
            console.log('📊 Using current rank score as max:', batch_rank);
        }
    }
    catch (maxRankError) {
        console.error('⚠️ Error fetching max rank score:', maxRankError.message);
    }
    return {
        courseId: courseProgress.courseId.toString(),
        courseTitle: courseProgress.courseTitle,
        progressPercentage: courseProgress.progressPercentage,
        totalClasses: courseProgress.totalClasses,
        classesWithProgress: courseProgress.classesWithProgress,
        accuracy: Math.round(userBatchAccuracy * 100) / 100,
        batch_rank: batch_rank,
        level: level
    };
});
exports.calculateCourseProgress = calculateCourseProgress;
