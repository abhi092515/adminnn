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
exports.getAvailablePdfsForCourse = exports.getAssignedPdfsForCourseV2 = exports.getAssignedPdfsForCourse = exports.togglePdfStatus = exports.removePdfFromCourse = exports.reorderPdfs = exports.updatePdfPriority = exports.getCoursesForPdf = exports.getPdfsForCourse = exports.assignPdfToCourse = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
const CoursePdf_1 = __importDefault(require("../models/CoursePdf"));
const Course_1 = __importDefault(require("../models/Course"));
const Pdf_1 = __importDefault(require("../models/Pdf"));
// Zod schemas for validation
const assignPdfToCourseSchema = zod_1.z.object({
    pdfId: zod_1.z.string().refine(val => mongoose_1.Types.ObjectId.isValid(val), {
        message: 'Invalid PDF ID format'
    }),
    priority: zod_1.z.number().min(1).int().optional()
});
const updatePdfPrioritySchema = zod_1.z.object({
    priority: zod_1.z.number().min(1).int()
});
const reorderPdfsSchema = zod_1.z.object({
    pdfOrder: zod_1.z.array(zod_1.z.object({
        pdfId: zod_1.z.string().refine(val => mongoose_1.Types.ObjectId.isValid(val), {
            message: 'Invalid PDF ID format'
        }),
        priority: zod_1.z.number().min(1).int()
    }))
});
// @desc    Assign PDF to course
// @route   POST /api/courses/:courseId/pdfs
// @access  Public
// export const assignPdfToCourse = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { courseId } = req.params;
//     // Validate course ID format
//     if (!Types.ObjectId.isValid(courseId)) {
//       res.status(400).json({ state: 400, msg: 'Invalid course ID format.' });
//       return;
//     }
//     // Validate request body
//     const validationResult = assignPdfToCourseSchema.safeParse(req.body);
//     if (!validationResult.success) {
//       res.status(400).json({
//         state: 400,
//         msg: 'Validation failed',
//         errors: validationResult.error.errors.map(err => ({
//           path: err.path.join('.'),
//           msg: err.message
//         }))
//       });
//       return;
//     }
//     const { pdfId, priority } = validationResult.data;
//     // Check if course and PDF exist
//     const [course, pdf] = await Promise.all([
//       Course.findById(courseId),
//       Pdf.findById(pdfId)
//     ]);
//     if (!course) {
//       res.status(404).json({ state: 404, msg: 'Course not found.' });
//       return;
//     }
//     if (!pdf) {
//       res.status(404).json({ state: 404, msg: 'PDF not found.' });
//       return;
//     }
//     // Check if assignment already exists
//     const existingAssignment = await CoursePdf.findOne({
//       course: courseId,
//       pdf: pdfId
//     });
//     if (existingAssignment) {
//       res.status(400).json({ state: 400, msg: 'PDF is already assigned to this course.' });
//       return;
//     }
//     // If no priority provided, set it as the next available priority
//     let finalPriority = priority;
//     if (!finalPriority) {
//       const lastAssignment = await CoursePdf.findOne({ course: courseId })
//         .sort({ priority: -1 })
//         .limit(1);
//       finalPriority = lastAssignment ? lastAssignment.priority + 1 : 1;
//     }
//     // Create assignment
//     const coursePdf = new CoursePdf({
//       course: courseId,
//       pdf: pdfId,
//       priority: finalPriority
//     });
//     await coursePdf.save();
//     // Return populated data
//     const populatedAssignment = await CoursePdf.findById(coursePdf._id)
//       .populate('course', 'title description')
//       .populate({
//         path: 'pdf',
//         populate: [
//           { path: 'mainCategory', select: '_id mainCategoryName' },
//           { path: 'category', select: '_id categoryName' },
//           { path: 'section', select: '_id sectionName' },
//           { path: 'topic', select: '_id topicName' }
//         ]
//       });
//     res.status(201).json({
//       state: 201,
//       msg: 'PDF assigned to course successfully',
//       data: populatedAssignment
//     });
//   } catch (error: any) {
//     console.error('Error assigning PDF to course:', error);
//     res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
//   }
// };
// export const assignPdfToCourse = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { courseId } = req.params;
//     if (!Types.ObjectId.isValid(courseId)) {
//     res.status(400).json({ state: 400, msg: 'Invalid course ID format.' })
//     return ;
//     }
//     const validationResult = assignPdfToCourseSchema.safeParse(req.body);
//     if (!validationResult.success) {
//  res.status(400).json({ state: 400, msg: 'Validation failed', errors: validationResult.error.errors })
//  return ;
//     }
//     const { pdfId } = validationResult.data;
//     // Perform the update. The { new: true } option returns the updated document.
//     const updatedCourse = await Course.findByIdAndUpdate(
//       courseId,
//       { $addToSet: { assignedPdfs: pdfId } }, // Atomically adds the PDF ID if it's not already there
//       { new: true }
//     );
//     if (!updatedCourse) {
//       res.status(404).json({ state: 404, msg: 'Course not found.' })
//       return ;
//     }
//     // ✅ FIX: We no longer call .populate() here, avoiding the error.
//     // The frontend will refetch the fully populated data separately.
//     res.status(200).json({
//       state: 200,
//       msg: 'PDF assigned successfully',
//       data: updatedCourse // Return the successfully updated (but unpopulated) course
//     });
//   } catch (error: any) {
//     console.error('Error assigning PDF to course:', error);
//     res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
//   }
// };
const assignPdfToCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        // Validate course ID format
        if (!mongoose_1.Types.ObjectId.isValid(courseId)) {
            res.status(400).json({ state: 400, msg: 'Invalid course ID format.' });
            return;
        }
        // Validate request body
        const validationResult = assignPdfToCourseSchema.safeParse(req.body);
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
        const { pdfId, priority } = validationResult.data;
        // Check if course and PDF exist
        const [course, pdf] = yield Promise.all([
            Course_1.default.findById(courseId),
            Pdf_1.default.findById(pdfId)
        ]);
        if (!course) {
            res.status(404).json({ state: 404, msg: 'Course not found.' });
            return;
        }
        if (!pdf) {
            res.status(404).json({ state: 404, msg: 'PDF not found.' });
            return;
        }
        // Check if assignment already exists
        const existingAssignment = yield CoursePdf_1.default.findOne({
            course: courseId,
            pdf: pdfId
        });
        if (existingAssignment) {
            res.status(400).json({ state: 400, msg: 'PDF is already assigned to this course.' });
            return;
        }
        // If no priority provided, set it as the next available priority
        let finalPriority = priority;
        if (!finalPriority) {
            const lastAssignment = yield CoursePdf_1.default.findOne({ course: courseId })
                .sort({ priority: -1 })
                .limit(1);
            finalPriority = lastAssignment ? lastAssignment.priority + 1 : 1;
        }
        // Create assignment
        const coursePdf = new CoursePdf_1.default({
            course: courseId,
            pdf: pdfId,
            priority: finalPriority
        });
        yield coursePdf.save();
        // Return populated data
        const populatedAssignment = yield CoursePdf_1.default.findById(coursePdf._id)
            .populate('course', 'title description')
            .populate({
            path: 'pdf',
            populate: [
                { path: 'mainCategory', select: '_id mainCategoryName' },
                { path: 'category', select: '_id categoryName' },
                { path: 'section', select: '_id sectionName' },
                { path: 'topic', select: '_id topicName' }
            ]
        });
        res.status(201).json({
            state: 201,
            msg: 'PDF assigned to course successfully',
            data: populatedAssignment
        });
    }
    catch (error) {
        console.error('Error assigning PDF to course:', error);
        res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
});
exports.assignPdfToCourse = assignPdfToCourse;
// @desc    Get PDFs for a course
// @route   GET /api/courses/:courseId/pdfs
// @access  Public
const getPdfsForCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        const { includeInactive = 'false', sortBy = 'priority', groupBy = 'none' // Parameter to control grouping
         } = req.query;
        if (!mongoose_1.Types.ObjectId.isValid(courseId)) {
            res.status(400).json({ state: 400, msg: 'Invalid course ID format.' });
            return;
        }
        // Check if course exists
        const course = yield Course_1.default.findById(courseId);
        if (!course) {
            res.status(404).json({ state: 404, msg: 'Course not found.' });
            return;
        } // If groupBy is 'topic', use aggregation pipeline similar to getClassesByCourse
        if (groupBy === 'topic') {
            const pipeline = [
                { $match: { _id: new mongoose_1.Types.ObjectId(courseId) } },
                {
                    $lookup: {
                        from: 'coursepdfs',
                        let: { courseId: '$_id' },
                        pipeline: [
                            {
                                $match: Object.assign({ $expr: { $eq: ['$course', '$$courseId'] } }, (includeInactive !== 'true' && { isActive: true }))
                            },
                            { $sort: { priority: 1, createdAt: -1 } },
                            {
                                $lookup: {
                                    from: 'pdfs',
                                    localField: 'pdf',
                                    foreignField: '_id',
                                    as: 'pdfData',
                                    pipeline: [
                                        {
                                            $lookup: {
                                                from: 'maincategories',
                                                localField: 'mainCategory',
                                                foreignField: '_id',
                                                as: 'mainCategoryInfo',
                                                pipeline: [{ $project: { _id: 0, id: '$_id', mainCategoryName: 1 } }]
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: 'categories',
                                                localField: 'category',
                                                foreignField: '_id',
                                                as: 'categoryInfo',
                                                pipeline: [{ $project: { _id: 0, id: '$_id', categoryName: 1 } }]
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: 'sections',
                                                localField: 'section',
                                                foreignField: '_id',
                                                as: 'sectionInfo',
                                                pipeline: [{ $project: { _id: 0, id: '$_id', sectionName: 1 } }]
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: 'topics',
                                                localField: 'topic',
                                                foreignField: '_id',
                                                as: 'topicInfo',
                                                pipeline: [{ $project: { _id: 0, id: '$_id', topicName: 1 } }]
                                            }
                                        },
                                        {
                                            $addFields: {
                                                mainCategory: { $arrayElemAt: ['$mainCategoryInfo', 0] },
                                                category: { $arrayElemAt: ['$categoryInfo', 0] },
                                                section: { $arrayElemAt: ['$sectionInfo', 0] },
                                                topic: { $arrayElemAt: ['$topicInfo', 0] }
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: 0,
                                                id: '$_id',
                                                title: 1,
                                                description: 1,
                                                pdfUrl: 1,
                                                uploadPdf: 1,
                                                mainCategory: 1,
                                                category: 1,
                                                section: 1,
                                                topic: 1,
                                                courseBanner: 1,
                                                createdAt: 1,
                                                updatedAt: 1,
                                                assignedPdfs: 1
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $addFields: {
                                    pdf: { $arrayElemAt: ['$pdfData', 0] }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    id: '$_id',
                                    priority: 1,
                                    isActive: 1,
                                    addedAt: 1,
                                    pdf: 1,
                                    createdAt: 1,
                                    updatedAt: 1
                                }
                            }
                        ],
                        as: 'pdfs'
                    }
                },
                {
                    $project: {
                        _id: 0,
                        id: '$_id',
                        title: 1,
                        pdfs: 1,
                        assignedPdfs: 1,
                        totalPdfs: { $size: '$pdfs' }
                    }
                }
            ];
            const result = yield Course_1.default.aggregate(pipeline);
            if (!result.length) {
                res.status(404).json({ state: 404, msg: 'Course not found', data: null });
                return;
            }
            const courseData = result[0];
            // Group PDFs by topics similar to how classes are grouped by topics
            const topicMap = {};
            console.log('Course Data:', courseData);
            courseData.pdfs.forEach((pdfItem) => {
                var _a, _b;
                const topicName = ((_b = (_a = pdfItem.pdf) === null || _a === void 0 ? void 0 : _a.topic) === null || _b === void 0 ? void 0 : _b.topicName) || 'No Topic';
                if (!topicMap[topicName]) {
                    topicMap[topicName] = [];
                }
                topicMap[topicName].push(pdfItem);
            });
            // Convert to array format with topicName and pdfs
            const topicsArray = Object.keys(topicMap).map(topicName => ({
                topicName: topicName,
                pdfs: topicMap[topicName]
            }));
            res.status(200).json({
                state: 200,
                msg: 'PDFs grouped by topics retrieved successfully',
                data: {
                    courseId: courseData.id,
                    courseTitle: courseData.title,
                    topics: topicsArray,
                    totalPdfs: courseData.totalPdfs,
                    assignedPdfs: courseData.assignedPdfs || []
                }
            });
            return;
        } // Original flat list logic without pagination
        const coursePdfs = yield CoursePdf_1.default.getPdfsForCourse(new mongoose_1.Types.ObjectId(courseId), {
            includeInactive: includeInactive === 'true',
            sortBy: sortBy
        });
        // Get the course with assignedPdfs field and populate PDF details
        const courseWithAssignedPdfs = yield Course_1.default.findById(courseId)
            .select('assignedPdfs title')
            .populate({
            path: 'assignedPdfs',
            model: 'Pdf',
            select: '_id title description uploadPdf image teacherName status isFree',
            populate: [
                { path: 'mainCategory', select: '_id mainCategoryName' },
                { path: 'category', select: '_id categoryName' },
                { path: 'section', select: '_id sectionName' },
                { path: 'topic', select: '_id topicName' }
            ]
        })
            .lean();
        // Transform the populated PDFs to include id instead of _id
        const transformedAssignedPdfs = ((courseWithAssignedPdfs === null || courseWithAssignedPdfs === void 0 ? void 0 : courseWithAssignedPdfs.assignedPdfs) || []).map((pdf) => ({
            id: pdf._id,
            title: pdf.title,
            description: pdf.description,
            uploadPdf: pdf.uploadPdf,
            image: pdf.image,
            teacherName: pdf.teacherName,
            status: pdf.status,
            isFree: pdf.isFree,
            mainCategory: pdf.mainCategory ? {
                id: pdf.mainCategory._id,
                mainCategoryName: pdf.mainCategory.mainCategoryName
            } : null,
            category: pdf.category ? {
                id: pdf.category._id,
                categoryName: pdf.category.categoryName
            } : null,
            section: pdf.section ? {
                id: pdf.section._id,
                sectionName: pdf.section.sectionName
            } : null,
            topic: pdf.topic ? {
                id: pdf.topic._id,
                topicName: pdf.topic.topicName
            } : null
        }));
        res.status(200).json({
            state: 200,
            msg: 'PDFs retrieved successfully',
            data: {
                pdfs: coursePdfs,
                totalPdfs: coursePdfs.length,
                assignedPdfs: transformedAssignedPdfs
            }
        });
    }
    catch (error) {
        console.error('Error fetching PDFs for course:', error);
        res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
});
exports.getPdfsForCourse = getPdfsForCourse;
// @desc    Get courses for a PDF
// @route   GET /api/pdfs/:pdfId/courses
// @access  Public
const getCoursesForPdf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pdfId } = req.params;
        const { includeInactive = 'false' } = req.query;
        if (!mongoose_1.Types.ObjectId.isValid(pdfId)) {
            res.status(400).json({ state: 400, msg: 'Invalid PDF ID format.' });
            return;
        }
        // Check if PDF exists
        const pdf = yield Pdf_1.default.findById(pdfId);
        if (!pdf) {
            res.status(404).json({ state: 404, msg: 'PDF not found.' });
            return;
        }
        const coursePdfs = yield CoursePdf_1.default.getCoursesForPdf(new mongoose_1.Types.ObjectId(pdfId), includeInactive === 'true');
        res.status(200).json({
            state: 200,
            msg: 'Courses retrieved successfully',
            data: coursePdfs
        });
    }
    catch (error) {
        console.error('Error fetching courses for PDF:', error);
        res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
});
exports.getCoursesForPdf = getCoursesForPdf;
// @desc    Update PDF priority in course
// @route   PUT /api/courses/:courseId/pdfs/:pdfId/priority
// @access  Public
const updatePdfPriority = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, pdfId } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(courseId) || !mongoose_1.Types.ObjectId.isValid(pdfId)) {
            res.status(400).json({ state: 400, msg: 'Invalid course or PDF ID format.' });
            return;
        }
        // Validate request body
        const validationResult = updatePdfPrioritySchema.safeParse(req.body);
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
        const coursePdf = yield CoursePdf_1.default.findOne({
            course: courseId,
            pdf: pdfId
        });
        if (!coursePdf) {
            res.status(404).json({ state: 404, msg: 'PDF assignment not found.' });
            return;
        }
        coursePdf.priority = priority;
        yield coursePdf.save();
        const updatedAssignment = yield CoursePdf_1.default.findById(coursePdf._id)
            .populate('course', 'title')
            .populate('pdf', 'title description');
        res.status(200).json({
            state: 200,
            msg: 'Priority updated successfully',
            data: updatedAssignment
        });
    }
    catch (error) {
        console.error('Error updating PDF priority:', error);
        res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
});
exports.updatePdfPriority = updatePdfPriority;
// @desc    Reorder PDFs in a course
// @route   PUT /api/courses/:courseId/pdfs/reorder
// @access  Public
const reorderPdfs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(courseId)) {
            res.status(400).json({ state: 400, msg: 'Invalid course ID format.' });
            return;
        }
        // Validate request body
        const validationResult = reorderPdfsSchema.safeParse(req.body);
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
        const { pdfOrder } = validationResult.data;
        // Convert string IDs to ObjectIds
        const pdfIdPriorityMap = pdfOrder.map(item => ({
            pdfId: new mongoose_1.Types.ObjectId(item.pdfId),
            priority: item.priority
        }));
        // Use the static method to reorder priorities
        yield CoursePdf_1.default.reorderPriorities(new mongoose_1.Types.ObjectId(courseId), pdfIdPriorityMap);
        res.status(200).json({
            state: 200,
            msg: 'PDFs reordered successfully'
        });
    }
    catch (error) {
        console.error('Error reordering PDFs:', error);
        res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
});
exports.reorderPdfs = reorderPdfs;
// @desc    Remove PDF from course
// @route   DELETE /api/courses/:courseId/pdfs/:pdfId
// @access  Public
const removePdfFromCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, pdfId } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(courseId) || !mongoose_1.Types.ObjectId.isValid(pdfId)) {
            res.status(400).json({ state: 400, msg: 'Invalid course or PDF ID format.' });
            return;
        }
        const result = yield CoursePdf_1.default.findOneAndDelete({
            course: courseId,
            pdf: pdfId
        });
        if (!result) {
            res.status(404).json({ state: 404, msg: 'PDF assignment not found.' });
            return;
        }
        res.status(200).json({
            state: 200,
            msg: 'PDF removed from course successfully'
        });
    }
    catch (error) {
        console.error('Error removing PDF from course:', error);
        res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
});
exports.removePdfFromCourse = removePdfFromCourse;
// @desc    Toggle PDF status in course
// @route   PATCH /api/courses/:courseId/pdfs/:pdfId/toggle-status
// @access  Public
const togglePdfStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, pdfId } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(courseId) || !mongoose_1.Types.ObjectId.isValid(pdfId)) {
            res.status(400).json({ state: 400, msg: 'Invalid course or PDF ID format.' });
            return;
        }
        const coursePdf = yield CoursePdf_1.default.findOne({
            course: courseId,
            pdf: pdfId
        });
        if (!coursePdf) {
            res.status(404).json({ state: 404, msg: 'PDF assignment not found.' });
            return;
        }
        coursePdf.isActive = !coursePdf.isActive;
        yield coursePdf.save();
        res.status(200).json({
            state: 200,
            msg: 'PDF status toggled successfully',
            data: {
                _id: coursePdf._id,
                isActive: coursePdf.isActive,
                updatedAt: coursePdf.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Error toggling PDF status:', error);
        res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
});
exports.togglePdfStatus = togglePdfStatus;
// @desc    Get assigned PDF URLs for a course (from assignedPdfs field)
// @route   GET /api/courses/:courseId/assigned-pdfs
// @access  Public
const getAssignedPdfsForCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(courseId)) {
            res.status(400).json({ state: 400, msg: 'Invalid course ID format.' });
            return;
        }
        // Use aggregation pipeline to get course with populated assigned PDFs
        const pipeline = [
            { $match: { _id: new mongoose_1.Types.ObjectId(courseId) } },
            {
                $lookup: {
                    from: 'pdfs',
                    localField: 'assignedPdfs',
                    foreignField: '_id',
                    as: 'assignedPdfsData',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'maincategories',
                                localField: 'mainCategory',
                                foreignField: '_id',
                                as: 'mainCategoryInfo',
                                pipeline: [{ $project: { _id: 0, id: '$_id', mainCategoryName: 1 } }]
                            }
                        },
                        {
                            $lookup: {
                                from: 'categories',
                                localField: 'category',
                                foreignField: '_id',
                                as: 'categoryInfo',
                                pipeline: [{ $project: { _id: 0, id: '$_id', categoryName: 1 } }]
                            }
                        },
                        {
                            $lookup: {
                                from: 'sections',
                                localField: 'section',
                                foreignField: '_id',
                                as: 'sectionInfo',
                                pipeline: [{ $project: { _id: 0, id: '$_id', sectionName: 1 } }]
                            }
                        },
                        {
                            $lookup: {
                                from: 'topics',
                                localField: 'topic',
                                foreignField: '_id',
                                as: 'topicInfo',
                                pipeline: [{ $project: { _id: 0, id: '$_id', topicName: 1 } }]
                            }
                        },
                        {
                            $addFields: {
                                mainCategory: { $arrayElemAt: ['$mainCategoryInfo', 0] },
                                category: { $arrayElemAt: ['$categoryInfo', 0] },
                                section: { $arrayElemAt: ['$sectionInfo', 0] },
                                topic: { $arrayElemAt: ['$topicInfo', 0] }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                id: '$_id',
                                title: 1,
                                description: 1,
                                uploadPdf: 1,
                                image: 1,
                                teacherName: 1,
                                status: 1,
                                isFree: 1,
                                mainCategory: 1,
                                category: 1,
                                section: 1,
                                topic: 1
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    _id: 0,
                    courseId: '$_id',
                    courseTitle: '$title',
                    assignedPdfs: '$assignedPdfsData',
                    totalAssignedPdfs: { $size: '$assignedPdfsData' }
                }
            }
        ];
        const result = yield Course_1.default.aggregate(pipeline);
        if (!result.length) {
            res.status(404).json({ state: 404, msg: 'Course not found.' });
            return;
        }
        const courseData = result[0]; // Group assigned PDFs by topics
        const topicMap = {};
        courseData.assignedPdfs.forEach((pdfData) => {
            var _a;
            const topicName = ((_a = pdfData.topic) === null || _a === void 0 ? void 0 : _a.topicName) || 'No Topic';
            if (!topicMap[topicName]) {
                topicMap[topicName] = [];
            }
            // Wrap each PDF in an object with pdf property
            topicMap[topicName].push({
                pdf: pdfData
            });
        });
        // Convert to array format with topicName and pdfs
        const topicsArray = Object.keys(topicMap).map(topicName => ({
            topicName: topicName,
            pdfs: topicMap[topicName]
        }));
        res.status(200).json({
            state: 200,
            msg: 'Assigned PDFs grouped by topics retrieved successfully',
            data: {
                courseId: courseData.courseId,
                courseTitle: courseData.courseTitle,
                topics: topicsArray,
                totalAssignedPdfs: courseData.totalAssignedPdfs
            }
        });
    }
    catch (error) {
        console.error('Error fetching assigned PDFs for course:', error);
        res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
});
exports.getAssignedPdfsForCourse = getAssignedPdfsForCourse;
const getAssignedPdfsForCourseV2 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        const { groupBy = 'none' } = req.query;
        if (!mongoose_1.Types.ObjectId.isValid(courseId)) {
            res.status(400).json({ state: 400, msg: 'Invalid course ID format.' });
            return;
        }
        const course = yield Course_1.default.findById(courseId);
        if (!course) {
            res.status(404).json({ state: 404, msg: 'Course not found.' });
            return;
        }
        const pipeline = [
            { $match: { course: new mongoose_1.Types.ObjectId(courseId) } },
            { $lookup: { from: 'pdfs', localField: 'pdf', foreignField: '_id', as: 'pdfDetails' } },
            { $unwind: '$pdfDetails' },
            { $lookup: { from: 'topics', localField: 'pdfDetails.topic', foreignField: '_id', as: 'topicDetails' } },
            // ... (your other lookups for category, etc., can remain here)
            {
                $project: {
                    _id: 0, // Exclude the default _id from CoursePdf
                    id: '$pdfDetails._id',
                    title: '$pdfDetails.title',
                    description: '$pdfDetails.description',
                    uploadPdf: '$pdfDetails.uploadPdf',
                    image: '$pdfDetails.image',
                    status: '$pdfDetails.status',
                    isFree: '$pdfDetails.isFree',
                    priority: '$priority',
                    topic: { $arrayElemAt: ['$topicDetails', 0] } // Project the topic object
                }
            },
            { $sort: { priority: 1 } }
        ];
        const pdfs = yield CoursePdf_1.default.aggregate(pipeline);
        if (groupBy === 'topic') {
            const topicMap = {};
            pdfs.forEach((pdfItem) => {
                var _a;
                // ✅ CORRECTED LOGIC: Access topic directly from pdfItem
                const topicName = ((_a = pdfItem.topic) === null || _a === void 0 ? void 0 : _a.topicName) || 'Uncategorized';
                if (!topicMap[topicName]) {
                    topicMap[topicName] = [];
                }
                topicMap[topicName].push(pdfItem);
            });
            const topicsArray = Object.keys(topicMap).map(topicName => ({
                topicName: topicName,
                pdfs: topicMap[topicName]
            }));
            res.status(200).json({
                state: 200,
                msg: 'PDFs grouped by topics retrieved successfully',
                data: {
                    courseId: course._id,
                    courseTitle: course.title,
                    topics: topicsArray,
                    totalPdfs: pdfs.length
                }
            });
        }
        else {
            // This is the response for when you are NOT grouping
            res.status(200).json({
                state: 200,
                msg: 'Assigned PDFs retrieved successfully',
                data: {
                    courseId: course._id,
                    courseTitle: course.title,
                    pdfs: pdfs, // Return the flat list of PDFs
                    totalPdfs: pdfs.length
                }
            });
        }
    }
    catch (error) {
        console.error('Error fetching assigned PDFs for course:', error);
        res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
});
exports.getAssignedPdfsForCourseV2 = getAssignedPdfsForCourseV2;
// @desc    Get unassigned PDF URLs for a course 
// @route   GET /api/courses/:courseId/available-pdfs
// @access  Public
const getAvailablePdfsForCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        console.log(courseId, 'courseId');
        const assignedPdfs = yield CoursePdf_1.default.find({ course: courseId }).select('pdf');
        const assignedPdfIds = assignedPdfs.map((pdf) => pdf.pdf);
        const matchConditions = {
            _id: { $nin: assignedPdfIds }
        };
        const aggregationPipeline = [
            {
                $match: matchConditions
            },
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
            {
                $project: {
                    // _id: 1,
                    id: '$_id',
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
        ];
        const countPipeline = [
            {
                $match: matchConditions
            },
            {
                $count: 'totalCount'
            }
        ];
        const [availablePdfs, countResult] = yield Promise.all([
            Pdf_1.default.aggregate(aggregationPipeline),
            Pdf_1.default.aggregate(countPipeline)
        ]);
        const totalAvailable = countResult.length > 0 ? countResult[0].total : 0;
        console.log('DEBUG: Found', availablePdfs.length, 'available classes out of', totalAvailable, 'total');
        res.status(200).json({
            state: 200,
            msg: 'Available classes retrieved successfully',
            data: {
                pdfs: availablePdfs,
            }
        });
    }
    catch (error) {
        console.error('Error fetching available PDFs for course:', error);
        res.status(500).json({ state: 500, msg: error.message || 'Server Error' });
    }
});
exports.getAvailablePdfsForCourse = getAvailablePdfsForCourse;
