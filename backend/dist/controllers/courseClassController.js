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
exports.getAvailableClassesForCourse = exports.toggleClassAssignment = exports.removeClassFromCourse = exports.reorderClasses = exports.updateClassPriority = exports.getCoursesForClass = exports.getClassesForCourse = exports.assignClassToCourse = void 0;
const mongoose_1 = require("mongoose");
const CourseClass_1 = __importDefault(require("../models/CourseClass"));
const Course_1 = __importDefault(require("../models/Course"));
const Class_1 = __importDefault(require("../models/Class"));
const zod_1 = require("zod");
// Zod schemas for validation
const assignClassSchema = zod_1.z.object({
    classId: zod_1.z.string()
        .min(1, 'Class ID is required')
        .refine(val => val !== null && val !== undefined && val.trim() !== '', 'Class ID cannot be null or empty')
        .refine(val => mongoose_1.Types.ObjectId.isValid(val), 'Class ID must be a valid ObjectId'),
    priority: zod_1.z.number().int().min(1).optional()
});
const updatePrioritySchema = zod_1.z.object({
    priority: zod_1.z.number().int().min(1, 'Priority must be at least 1')
});
const reorderClassesSchema = zod_1.z.object({
    classOrder: zod_1.z.array(zod_1.z.object({
        classId: zod_1.z.string().min(1, 'Class ID is required'),
        priority: zod_1.z.number().int().min(1, 'Priority must be at least 1')
    })).min(1, 'At least one class order is required')
});
// @desc    Assign a class to a course
// @route   POST /api/courses/:courseId/classes
// @access  Public
const assignClassToCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        // Additional validation for courseId parameter
        if (!courseId || courseId.trim() === '') {
            res.status(400).json({ state: 400, msg: 'Course ID is required in URL parameters.' });
            return;
        }
        // Validate request body
        const validationResult = assignClassSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                msg: 'Validation failed',
                errors: validationResult.error.errors.map(err => ({
                    path: err.path.join('.'),
                    msg: err.message
                }))
            });
            return;
        }
        const { classId, priority } = validationResult.data;
        // Validate IDs
        if (!mongoose_1.Types.ObjectId.isValid(courseId) || !mongoose_1.Types.ObjectId.isValid(classId)) {
            res.status(400).json({ state: 400, msg: 'Invalid course or class ID format.' });
            return;
        }
        // Additional null/undefined checks
        if (!courseId || !classId) {
            res.status(400).json({ state: 400, msg: 'Both course ID and class ID are required and cannot be null.' });
            return;
        }
        // Check if course and class exist
        const [course, classItem] = yield Promise.all([
            Course_1.default.findById(courseId),
            Class_1.default.findById(classId)
        ]);
        if (!course) {
            res.status(404).json({ state: 404, msg: 'Course not found.' });
            return;
        }
        if (!classItem) {
            res.status(404).json({ state: 404, msg: 'Class not found.' });
            return;
        }
        // Check if assignment already exists
        const existingAssignment = yield CourseClass_1.default.findOne({ course: courseId, class: classId });
        if (existingAssignment) {
            res.status(400).json({ state: 400, msg: 'Class is already assigned to this course.' });
            return;
        }
        // If no priority provided, set it as the next available priority
        let finalPriority = priority;
        if (!finalPriority) {
            const lastAssignment = yield CourseClass_1.default.findOne({ course: courseId })
                .sort({ priority: -1 })
                .limit(1);
            finalPriority = lastAssignment ? lastAssignment.priority + 1 : 1;
        }
        // Create assignment
        const courseClass = new CourseClass_1.default({
            course: courseId,
            class: classId,
            priority: finalPriority
        });
        yield courseClass.save();
        // Return populated data
        const populatedAssignment = yield CourseClass_1.default.findById(courseClass._id)
            .populate('course', 'title description')
            .populate({
            path: 'class',
            populate: [
                { path: 'mainCategory', select: '_id mainCategoryName' },
                { path: 'category', select: '_id categoryName' },
                { path: 'section', select: '_id sectionName' },
                { path: 'topic', select: '_id topicName' }
            ]
        });
        res.status(201).json({
            state: 201,
            msg: 'Class assigned to course successfully',
            data: populatedAssignment
        });
    }
    catch (error) {
        console.error('Error assigning class to course:', error);
        res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
});
exports.assignClassToCourse = assignClassToCourse;
// @desc    Get classes for a course using static method
// @route   GET /api/courses/:courseId/classes
// @access  Public
const getClassesForCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { courseId } = req.params;
        const { sortBy = 'priority' } = req.query;
        if (!mongoose_1.Types.ObjectId.isValid(courseId)) {
            res.status(400).json({ state: 400, msg: 'Invalid course ID format.' });
            return;
        }
        const course = yield Course_1.default.findById(courseId);
        if (!course) {
            res.status(404).json({ state: 404, msg: 'Course not found.' });
            return;
        }
        console.log('DEBUG: Using aggregation pipeline for courseId:', courseId);
        const aggregationPipeline = [
            {
                $match: {
                    course: new mongoose_1.Types.ObjectId(courseId)
                }
            },
            // Lookup class details
            {
                $lookup: {
                    from: 'classes',
                    localField: 'class',
                    foreignField: '_id',
                    as: 'classDetails'
                }
            },
            // Unwind class details
            {
                $unwind: {
                    path: '$classDetails',
                    preserveNullAndEmptyArrays: false // Exclude if class doesn't exist
                }
            },
            // Lookup mainCategory
            {
                $lookup: {
                    from: 'maincategories',
                    localField: 'classDetails.mainCategory',
                    foreignField: '_id',
                    as: 'mainCategoryDetails'
                }
            },
            // Lookup category
            {
                $lookup: {
                    from: 'categories',
                    localField: 'classDetails.category',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            // Lookup section
            {
                $lookup: {
                    from: 'sections',
                    localField: 'classDetails.section',
                    foreignField: '_id',
                    as: 'sectionDetails'
                }
            },
            // Lookup topic
            {
                $lookup: {
                    from: 'topics',
                    localField: 'classDetails.topic',
                    foreignField: '_id',
                    as: 'topicDetails'
                }
            }, // Project final structure with flattened class details
            {
                $project: {
                    // CourseClass fields
                    course: 1,
                    priority: 1,
                    isActive: 1,
                    addedAt: 1,
                    classCreatedAt: '$createdAt',
                    classUpdatedAt: '$updatedAt',
                    // Flattened class fields at root level
                    classId: '$classDetails._id',
                    title: '$classDetails.title',
                    description: '$classDetails.description',
                    teacherName: '$classDetails.teacherName',
                    duration: '$classDetails.duration',
                    startDate: '$classDetails.startDate',
                    endDate: '$classDetails.endDate',
                    isLive: '$classDetails.isLive',
                    isFree: '$classDetails.isFree',
                    isShort: '$classDetails.isShort',
                    isTopper: '$classDetails.isTopper',
                    status: '$classDetails.status',
                    image: '$classDetails.image',
                    link: '$classDetails.link',
                    class_link: '$classDetails.class_link',
                    mp4Recordings: '$classDetails.mp4Recordings',
                    viewCount: '$classDetails.viewCount',
                    uniqueViewCount: '$classDetails.uniqueViewCount',
                    // Populated category fields
                    mainCategory: {
                        $cond: {
                            if: { $gt: [{ $size: '$mainCategoryDetails' }, 0] },
                            then: {
                                _id: { $arrayElemAt: ['$mainCategoryDetails._id', 0] },
                                mainCategoryName: { $arrayElemAt: ['$mainCategoryDetails.mainCategoryName', 0] }
                            },
                            else: null
                        }
                    },
                    category: {
                        $cond: {
                            if: { $gt: [{ $size: '$categoryDetails' }, 0] },
                            then: {
                                _id: { $arrayElemAt: ['$categoryDetails._id', 0] },
                                categoryName: { $arrayElemAt: ['$categoryDetails.categoryName', 0] }
                            },
                            else: null
                        }
                    },
                    section: {
                        $cond: {
                            if: { $gt: [{ $size: '$sectionDetails' }, 0] },
                            then: {
                                _id: { $arrayElemAt: ['$sectionDetails._id', 0] },
                                sectionName: { $arrayElemAt: ['$sectionDetails.sectionName', 0] }
                            },
                            else: null
                        }
                    },
                    topic: {
                        $cond: {
                            if: { $gt: [{ $size: '$topicDetails' }, 0] },
                            then: {
                                _id: { $arrayElemAt: ['$topicDetails._id', 0] },
                                topicName: { $arrayElemAt: ['$topicDetails.topicName', 0] }
                            },
                            else: null
                        }
                    }
                }
            },
            {
                $sort: {
                    priority: 1,
                    createdAt: -1
                }
            }
        ];
        console.log('DEBUG: Aggregation pipeline created');
        const classes = yield CourseClass_1.default.aggregate(aggregationPipeline);
        console.log('DEBUG: Aggregation returned:', classes.length, 'classes');
        if (classes.length > 0) {
            console.log('DEBUG: First class structure:', {
                courseClassId: classes[0].courseClassId,
                classId: classes[0]._id,
                title: classes[0].title,
                priority: classes[0].priority,
                isActive: classes[0].isActive,
                topicName: (_a = classes[0].topic) === null || _a === void 0 ? void 0 : _a.topicName
            });
        } // Group classes by topic name
        const groupedClasses = classes.reduce((acc, classItem) => {
            var _a, _b;
            const topicName = ((_a = classItem.topic) === null || _a === void 0 ? void 0 : _a.topicName) || 'Uncategorized';
            if (!acc[topicName]) {
                acc[topicName] = {
                    topicName: topicName,
                    topicId: ((_b = classItem.topic) === null || _b === void 0 ? void 0 : _b._id) || null,
                    classes: []
                };
            }
            acc[topicName].classes.push(classItem);
            return acc;
        }, {});
        // Convert grouped object to array and sort by topic name
        const groupedClassesArray = Object.values(groupedClasses).sort((a, b) => a.topicName.localeCompare(b.topicName));
        console.log('DEBUG: Classes grouped by topic. Found', groupedClassesArray.length, 'topic groups');
        res.status(200).json({
            state: 200,
            msg: 'Classes retrieved and grouped by topic successfully',
            data: {
                course: {
                    id: course._id,
                    title: course.title,
                    isLive: course.isLive,
                    isRecorded: course.isRecorded,
                    isFree: course.isFree,
                    mainCategory: course.mainCategory,
                    category: course.category
                },
                classes: groupedClassesArray,
            }
        });
    }
    catch (error) {
        console.error('Error fetching classes for course:', error);
        res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
});
exports.getClassesForCourse = getClassesForCourse;
// @desc    Get courses for a class using static method
// @route   GET /api/classes/:classId/courses
// @access  Public
const getCoursesForClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { classId } = req.params;
        const { includeInactive = 'false' } = req.query;
        if (!mongoose_1.Types.ObjectId.isValid(classId)) {
            res.status(400).json({ state: 400, msg: 'Invalid class ID format.' });
            return;
        }
        // Check if class exists
        const classItem = yield Class_1.default.findById(classId);
        if (!classItem) {
            res.status(404).json({ state: 404, msg: 'Class not found.' });
            return;
        }
        // Use the static method from CourseClass model
        const courses = yield CourseClass_1.default.getCoursesForClass(new mongoose_1.Types.ObjectId(classId), includeInactive === 'true');
        res.status(200).json({
            state: 200,
            msg: 'Courses retrieved successfully',
            data: courses
        });
    }
    catch (error) {
        console.error('Error fetching courses for class:', error);
        res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
});
exports.getCoursesForClass = getCoursesForClass;
// @desc    Update class priority in course
// @route   PUT /api/courses/:courseId/classes/:classId/priority
// @access  Public
const updateClassPriority = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, classId } = req.params;
        // Validate request body
        const validationResult = updatePrioritySchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                msg: 'Validation failed',
                errors: validationResult.error.errors.map(err => ({
                    path: err.path.join('.'),
                    msg: err.message
                }))
            });
            return;
        }
        const { priority } = validationResult.data;
        if (!mongoose_1.Types.ObjectId.isValid(courseId) || !mongoose_1.Types.ObjectId.isValid(classId)) {
            res.status(400).json({ state: 400, msg: 'Invalid course or class ID format.' });
            return;
        }
        const courseClass = yield CourseClass_1.default.findOne({ course: courseId, class: classId });
        if (!courseClass) {
            res.status(404).json({ state: 404, msg: 'Class assignment not found.' });
            return;
        }
        courseClass.priority = priority;
        yield courseClass.save();
        // Return updated assignment with populated data
        const updatedAssignment = yield CourseClass_1.default.findById(courseClass._id)
            .populate('course', 'title')
            .populate('class', 'title description');
        res.status(200).json({
            state: 200,
            msg: 'Priority updated successfully',
            data: updatedAssignment
        });
    }
    catch (error) {
        console.error('Error updating class priority:', error);
        res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
});
exports.updateClassPriority = updateClassPriority;
// @desc    Reorder multiple classes in a course using static method
// @route   PUT /api/courses/:courseId/classes/reorder
// @access  Public
const reorderClasses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        // Validate request body
        const validationResult = reorderClassesSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                msg: 'Validation failed',
                errors: validationResult.error.errors.map(err => ({
                    path: err.path.join('.'),
                    msg: err.message
                }))
            });
            return;
        }
        const { classOrder } = validationResult.data;
        if (!mongoose_1.Types.ObjectId.isValid(courseId)) {
            res.status(400).json({ state: 400, msg: 'Invalid course ID format.' });
            return;
        }
        // Validate all class IDs
        for (const item of classOrder) {
            if (!mongoose_1.Types.ObjectId.isValid(item.classId)) {
                res.status(400).json({ state: 400, msg: `Invalid class ID format: ${item.classId}` });
                return;
            }
        }
        // Check if course exists
        const course = yield Course_1.default.findById(courseId);
        if (!course) {
            res.status(404).json({ state: 404, msg: 'Course not found.' });
            return;
        }
        // Convert classOrder to the format expected by the static method
        const classIdPriorityMap = classOrder.map(item => ({
            classId: new mongoose_1.Types.ObjectId(item.classId),
            priority: item.priority
        }));
        // Use the static method to reorder priorities with transaction safety
        yield CourseClass_1.default.reorderPriorities(new mongoose_1.Types.ObjectId(courseId), classIdPriorityMap);
        // Return updated classes
        const updatedClasses = yield CourseClass_1.default.getClassesForCourse(new mongoose_1.Types.ObjectId(courseId), { sortBy: 'priority' });
        res.status(200).json({
            state: 200,
            msg: 'Classes reordered successfully',
            data: updatedClasses
        });
    }
    catch (error) {
        console.error('Error reordering classes:', error);
        res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
});
exports.reorderClasses = reorderClasses;
// @desc    Remove class from course
// @route   DELETE /api/courses/:courseId/classes/:classId
// @access  Public
const removeClassFromCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, classId } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(courseId) || !mongoose_1.Types.ObjectId.isValid(classId)) {
            res.status(400).json({ state: 400, msg: 'Invalid course or class ID format.' });
            return;
        }
        const result = yield CourseClass_1.default.findOneAndDelete({ course: courseId, class: classId });
        if (!result) {
            res.status(404).json({ state: 404, msg: 'Class assignment not found.' });
            return;
        }
        res.status(200).json({
            state: 200,
            msg: 'Class removed from course successfully',
            data: {
                removedAssignment: {
                    course: result.course,
                    class: result.class,
                    priority: result.priority
                }
            }
        });
    }
    catch (error) {
        console.error('Error removing class from course:', error);
        res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
});
exports.removeClassFromCourse = removeClassFromCourse;
// @desc    Toggle class assignment status
// @route   PATCH /api/courses/:courseId/classes/:classId/toggle
// @access  Public
const toggleClassAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, classId } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(courseId) || !mongoose_1.Types.ObjectId.isValid(classId)) {
            res.status(400).json({ state: 400, msg: 'Invalid course or class ID format.' });
            return;
        }
        const courseClass = yield CourseClass_1.default.findOne({ course: courseId, class: classId });
        if (!courseClass) {
            res.status(404).json({ state: 404, msg: 'Class assignment not found.' });
            return;
        }
        courseClass.isActive = !courseClass.isActive;
        yield courseClass.save();
        res.status(200).json({
            state: 200,
            msg: `Class assignment ${courseClass.isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                _id: courseClass._id,
                course: courseClass.course,
                class: courseClass.class,
                isActive: courseClass.isActive,
                priority: courseClass.priority
            }
        });
    }
    catch (error) {
        console.error('Error toggling class assignment:', error);
        res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
});
exports.toggleClassAssignment = toggleClassAssignment;
// @desc    Get available classes for assignment to a course (excludes already assigned classes)
// @route   GET /api/courses/:courseId/available-classes
// @access  Public
const getAvailableClassesForCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        const { includeInactive = 'true', sortBy = 'title' } = req.query;
        if (!mongoose_1.Types.ObjectId.isValid(courseId)) {
            res.status(400).json({ state: 400, msg: 'Invalid course ID format.' });
            return;
        }
        // Check if course exists
        const course = yield Course_1.default.findById(courseId);
        if (!course) {
            res.status(404).json({ state: 404, msg: 'Course not found.' });
            return;
        }
        // Get all assigned class IDs for this course
        const assignedClasses = yield CourseClass_1.default.find({ course: courseId }).select('class');
        const assignedClassIds = assignedClasses.map(assignment => assignment.class);
        console.log('DEBUG: Found', assignedClassIds.length, 'assigned classes for course', courseId);
        // Build match conditions for classes
        const matchConditions = {
            _id: { $nin: assignedClassIds }, // Exclude already assigned classes
            status: 'active' // Only include active classes
        };
        // If includeInactive is false, we already filter by status: 'active'
        // If includeInactive is true, we can include inactive classes too
        if (includeInactive === 'true') {
            delete matchConditions.status; // Remove status filter to include all
        } // Build sort options
        const sortOptions = {};
        if (sortBy === 'title') {
            sortOptions.title = 1;
        }
        else if (sortBy === 'recent') {
            sortOptions.createdAt = -1;
        }
        else if (sortBy === 'priority') {
            sortOptions.priority = 1;
            sortOptions.createdAt = -1;
        }
        // Aggregation pipeline to get available classes with populated data
        const aggregationPipeline = [
            { $match: matchConditions },
            // Lookup mainCategory
            {
                $lookup: {
                    from: 'maincategories',
                    localField: 'mainCategory',
                    foreignField: '_id',
                    as: 'mainCategoryDetails'
                }
            },
            // Lookup category
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            // Lookup section
            {
                $lookup: {
                    from: 'sections',
                    localField: 'section',
                    foreignField: '_id',
                    as: 'sectionDetails'
                }
            },
            // Lookup topic
            {
                $lookup: {
                    from: 'topics',
                    localField: 'topic',
                    foreignField: '_id',
                    as: 'topicDetails'
                }
            },
            // Project final structure
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    teacherName: 1,
                    duration: 1,
                    startDate: 1,
                    endDate: 1,
                    isLive: 1,
                    isFree: 1,
                    isShort: 1,
                    isTopper: 1,
                    status: 1,
                    priority: 1,
                    image: 1,
                    link: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    mainCategory: {
                        $cond: {
                            if: { $gt: [{ $size: '$mainCategoryDetails' }, 0] },
                            then: {
                                _id: { $arrayElemAt: ['$mainCategoryDetails._id', 0] },
                                mainCategoryName: { $arrayElemAt: ['$mainCategoryDetails.mainCategoryName', 0] }
                            },
                            else: null
                        }
                    },
                    category: {
                        $cond: {
                            if: { $gt: [{ $size: '$categoryDetails' }, 0] },
                            then: {
                                _id: { $arrayElemAt: ['$categoryDetails._id', 0] },
                                categoryName: { $arrayElemAt: ['$categoryDetails.categoryName', 0] }
                            },
                            else: null
                        }
                    },
                    section: {
                        $cond: {
                            if: { $gt: [{ $size: '$sectionDetails' }, 0] },
                            then: {
                                _id: { $arrayElemAt: ['$sectionDetails._id', 0] },
                                sectionName: { $arrayElemAt: ['$sectionDetails.sectionName', 0] }
                            },
                            else: null
                        }
                    },
                    topic: {
                        $cond: {
                            if: { $gt: [{ $size: '$topicDetails' }, 0] },
                            then: {
                                _id: { $arrayElemAt: ['$topicDetails._id', 0] },
                                topicName: { $arrayElemAt: ['$topicDetails.topicName', 0] }
                            },
                            else: null
                        }
                    }
                }
            },
            { $sort: sortOptions }
        ];
        // Count total available classes
        const countPipeline = [
            { $match: matchConditions },
            { $count: 'total' }
        ];
        console.log('DEBUG: Executing aggregation for available classes');
        const [availableClasses, countResult] = yield Promise.all([
            Class_1.default.aggregate(aggregationPipeline),
            Class_1.default.aggregate(countPipeline)
        ]);
        const totalAvailable = countResult.length > 0 ? countResult[0].total : 0;
        console.log('DEBUG: Found', availableClasses.length, 'available classes out of', totalAvailable, 'total');
        res.status(200).json({
            state: 200,
            msg: 'Available classes retrieved successfully',
            data: {
                course: {
                    id: course._id,
                    title: course.title
                },
                availableClasses,
                summary: {
                    totalAssigned: assignedClassIds.length,
                    totalAvailable,
                    totalClasses: assignedClassIds.length + totalAvailable
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching available classes for course:', error);
        res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
});
exports.getAvailableClassesForCourse = getAvailableClassesForCourse;
