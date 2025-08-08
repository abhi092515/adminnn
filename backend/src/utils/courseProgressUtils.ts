import { Types } from 'mongoose';
import Course from '../models/Course';
import TestResult from '../models/TestResult';
import RankScore from '../models/RankScore';

export interface CourseProgressResult {
    courseId: string;
    courseTitle: string;
    progressPercentage: number;
    totalClasses: number;
    classesWithProgress: number;
    accuracy: number;
    batch_rank: number;
    level: string;
}

export interface SimpleCourseProgress {
    courseId: string;
    progressPercentage: number;
}

/**
 * Aggregation pipeline to calculate course progress percentage based on class completion
 * @param courseId - ObjectId of the course
 * @param userId - String ID of the user
 * @returns Aggregation pipeline array
 */
export const buildCourseProgressPipeline = (courseId: Types.ObjectId, userId: string) => [
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

/**
 * Calculate simple course progress (just percentage) for multiple courses
 * @param courseIds - Array of course ObjectIds
 * @param userId - String ID of the user
 * @returns Promise<SimpleCourseProgress[]>
 */
export const calculateMultipleCourseProgress = async (
    courseIds: Types.ObjectId[],
    userId: string
): Promise<SimpleCourseProgress[]> => {
    if (courseIds.length === 0) return [];

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
        },        {
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

    const results = await Course.aggregate(pipeline);
    return results;
};

/**
 * Calculate comprehensive course progress including accuracy, rank, and level
 * @param courseId - ObjectId of the course
 * @param userId - String ID of the user
 * @returns Promise<CourseProgressResult | null>
 */
export const calculateCourseProgress = async (
    courseId: Types.ObjectId,
    userId: string
): Promise<CourseProgressResult | null> => {
    // Get basic progress percentage
    const progressResult = await Course.aggregate(buildCourseProgressPipeline(courseId, userId));

    if (!progressResult || progressResult.length === 0) {
        return null;
    }

    const courseProgress = progressResult[0];

    // Get test results for accuracy calculation
    const testResults = await TestResult.find({
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
    let level: string;
    if (level_score < 40) {
        level = 'Beginner';
    } else if (level_score > 40 && level_score < 80) {
        level = 'Medium';
    } else if (level_score >= 80 && level_score <= 90) {
        level = 'Advanced';
    } else if (level_score > 90 && level_score <= 100) {
        level = 'Pro';
    } else {
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

        const newRankScore = new RankScore(rankScoreData);
        await newRankScore.save();
        console.log('✅ Rank score saved successfully:', rankScoreData);
    } catch (rankScoreError: any) {
        console.error('⚠️ Error saving rank score:', rankScoreError.message);
        // Continue execution even if rank score save fails
    }

    // Get the maximum rank score for this user-course combination
    let batch_rank = Math.round(rank_score * 100) / 100;
    try {
        const maxRankScore = await RankScore.findOne({
            userId: userId,
            courseId: courseId
        })
            .sort({ rank_score: -1 })
            .limit(1);

        if (maxRankScore && maxRankScore.rank_score > rank_score) {
            batch_rank = Math.round(maxRankScore.rank_score * 100) / 100;
            console.log('📈 Using max rank score:', batch_rank);
        } else {
            console.log('📊 Using current rank score as max:', batch_rank);
        }
    } catch (maxRankError: any) {
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
};
