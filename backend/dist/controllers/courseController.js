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
exports.postFilteredCourses = exports.unassignClassesFromCourses = exports.assignClassesToCourses = exports.getCourseWithUserProgress = exports.getClassesByCourse = exports.searchCourses = exports.getCourseById2 = exports.updateCourseStatus = exports.getCourseData = exports.deleteCourse = exports.getCourseById = exports.getCourses = exports.updateCourse = exports.createCourse = void 0;
const mongoose_1 = require("mongoose");
const Course_1 = __importDefault(require("../models/Course"));
const promises_1 = __importDefault(require("fs/promises"));
const Class_1 = __importDefault(require("../models/Class"));
const courseSchemas_1 = require("../schemas/courseSchemas");
const s3Upload_1 = require("../config/s3Upload");
// Helper function to check if a referenced ID is valid and exists
const validateReference = (model, id, modelName, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id)
        return true;
    const idString = typeof id === 'string' ? id : id.toString();
    if (!mongoose_1.Types.ObjectId.isValid(idString)) {
        res.status(400).json({ state: 400, message: `Invalid ${modelName} ID format provided.`, data: null });
        return false;
    }
    const exists = yield model.findById(idString);
    if (!exists) {
        res.status(404).json({ state: 404, message: `${modelName} not found.`, data: null });
        return false;
    }
    return true;
});
// @desc    Create a new course
// @route   POST /api/courses
// @access  Public
// export const createCourse = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // ✅ START: ADD THIS CODE BLOCK TO PARSE FORM DATA
//     const parsedBody = { ...req.body };
//     // Manually parse string values from multipart/form-data into correct types
// // ✅ START: DATA PARSING BLOCK
// if (parsedBody.priority) {
//   parsedBody.priority = parseInt(parsedBody.priority, 10);
// }
// if (parsedBody.isLive) {
//   parsedBody.isLive = parsedBody.isLive === 'true';
// }
// if (parsedBody.isFree) {
//   parsedBody.isFree = parsedBody.isFree === 'true';
// }
// if (parsedBody.description && typeof parsedBody.description === 'string') {
//   try { parsedBody.description = JSON.parse(parsedBody.description); } catch (e) { /* ignore */ }
// }
// if (parsedBody.courseInfo && typeof parsedBody.courseInfo === 'string') {
//   try { parsedBody.courseInfo = JSON.parse(parsedBody.courseInfo); } catch (e) { /* ignore */ }
// }
// if (parsedBody.courseHighlights && typeof parsedBody.courseHighlights === 'string') {
//   try { parsedBody.courseHighlights = JSON.parse(parsedBody.courseHighlights); } catch (e) { /* ignore */ }
// }
// // ... add any other fields that need parsing (e.g., isRecorded)
// // ✅ END: DATA PARSING BLOCK
//     // ✅ END: ADDED CODE BLOCK
//     // Now, validate the parsed body instead of req.body
//     const validationResult = createCourseSchema.safeParse(parsedBody);
//     if (!validationResult.success) {
//       res.status(400).json({
//         state: 400,
//         message: 'Validation failed for course data',
//         data: validationResult.error.errors.map(err => ({
//           path: err.path.join('.'),
//           message: err.message
//         }))
//       });
//       return;
//     }
//     const courseDataFromRequest = validationResult.data;
//     let bannerS3Url: string | null = null;
//     if (req.file) {
//       const file = req.file as Express.Multer.File;
//       const safeOriginalName = file.originalname.replace(/\s+/g, '_');
//       const s3Key = `courses/banners/${Date.now()}-${safeOriginalName}`;
//       try {
//         bannerS3Url = await uploadFileToS3(file.buffer, s3Key, file.mimetype);
//         console.log(`New banner uploaded to S3 for new course: ${bannerS3Url}`);
//       } catch (uploadError) {
//         console.error('Error uploading new banner to S3 during course creation:', uploadError);
//         res.status(500).json({
//           state: 500,
//           message: 'Failed to upload banner image. Course not created.',
//           data: null
//         });
//         return;
//       }
//     }
//     if (!(await validateReference(MainCategory, courseDataFromRequest.mainCategory, 'Main Category', res))) return;
//     if (!(await validateReference(Category, courseDataFromRequest.category, 'Category', res))) return;
//     const existingCourse = await Course.findOne({ title: courseDataFromRequest.title });
//     if (existingCourse) {
//       res.status(400).json({
//         state: 400,
//         message: 'A course with this title already exists.',
//         data: null
//       });
//       return;
//     }
//     const newCourseDataObject: Partial<ICourse> = {
//       mainCategory: new Types.ObjectId(courseDataFromRequest.mainCategory),
//       category: new Types.ObjectId(courseDataFromRequest.category),
//       banner: bannerS3Url,
//       status: courseDataFromRequest.status || 'active',
//       priority: courseDataFromRequest.priority || 0,
//       isLive: courseDataFromRequest.isLive || false,
//       isRecorded: courseDataFromRequest.isRecorded || false,
//       isFree: courseDataFromRequest.isFree || false,
//       liveClassesCount: courseDataFromRequest.liveClassesCount || 0,
//       recordedClassesCount: courseDataFromRequest.recordedClassesCount || 0,
//       courseInfo: courseDataFromRequest.courseInfo || [],
//       demoVideos: courseDataFromRequest.demoVideos as IDemoVideo[] || [],
//       courseHighlights: courseDataFromRequest.courseHighlights || [],
//       faq: courseDataFromRequest.faq as IFAQItem[] || [],
//       facultyDetails: courseDataFromRequest.facultyDetails as IFacultyDetails | undefined,
//       title: courseDataFromRequest.title,
//       assignHeader: courseDataFromRequest.assignHeader,
//       description: courseDataFromRequest.description, batchInfoPdfUrl: courseDataFromRequest.batchInfoPdfUrl,
//     };
//     const newCourseDoc = new Course(newCourseDataObject);
//     const createdCourse = await newCourseDoc.save();
//     const populatedCourse = await Course.findById(createdCourse.id)
//       .populate('mainCategory', 'id mainCategoryName')
//       .populate('category', 'id categoryName');
//     res.status(201).json({
//       state: 201,
//       message: 'Course created successfully',
//       data: populatedCourse
//     });
//   } catch (error: any) {
//     console.error('Error creating course:', error);
//     if (error instanceof multer.MulterError) {
//       res.status(400).json({ state: 400, message: `File upload error: ${error.message}`, data: null });
//       return;
//     } else if (error.message === 'Only image files are allowed!') {
//       res.status(400).json({ state: 400, message: error.message, data: null });
//       return;
//     }
//     res.status(500).json({
//       state: 500,
//       message: error.message || 'Server Error while creating course',
//       data: null
//     });
//   }
// }; 
// export const createCourse = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const validationResult = createCourseSchema.safeParse(req.body);
//     if (!validationResult.success) {
//       res.status(400).json({
//         state: 400,
//         message: 'Validation failed for course data',
//         data: validationResult.error.errors,
//       });
//       return;
//     }
//     const courseDataFromRequest = validationResult.data;
//     let bannerS3Url: string | null = null;
//     // Handle file upload to S3
//     if (req.file) {
//       const file = req.file;
//       const safeOriginalName = file.originalname.replace(/\s+/g, '_');
//       const s3Key = `courses/banners/${Date.now()}-${safeOriginalName}`;
//       try {
//         // ✅ 2. Read the file from the path provided by diskStorage
//         const fileBuffer = await fs.readFile(file.path);
//         // 3. Upload the buffer to S3 (this line is now the same, but uses the new buffer)
//         bannerS3Url = await uploadFileToS3(fileBuffer, s3Key, file.mimetype);
//         // ✅ 4. Clean up and delete the temporary file from the local server disk
//         await fs.unlink(file.path);
//       } catch (uploadError) {
//         console.error('Error processing file for course creation:', uploadError);
//         // Ensure temp file is deleted even if S3 upload fails
//         if (req.file?.path) await fs.unlink(req.file.path).catch(err => console.error("Failed to cleanup temp file:", err));
//         res.status(500).json({
//           state: 500,
//           message: 'Failed to upload banner image. Course not created.',
//           data: null,
//         });
//         return;
//       }
//     }
//     // ...The rest of your function remains exactly the same...
//     if (!(await validateReference(MainCategory, courseDataFromRequest.mainCategory, 'Main Category', res))) return;
//     if (!(await validateReference(Category, courseDataFromRequest.category, 'Category', res))) return;
//     const existingCourse = await Course.findOne({ title: courseDataFromRequest.title });
//     if (existingCourse) {
//       res.status(400).json({
//         state: 400,
//         message: 'A course with this title already exists.',
//         data: null
//       });
//       return;
//     }
//     const newCourseDoc = new Course({ ...courseDataFromRequest, banner: bannerS3Url });
//     const createdCourse = await newCourseDoc.save();
//     const populatedCourse = await Course.findById(createdCourse.id)
//       .populate('mainCategory', 'id mainCategoryName')
//       .populate('category', 'id categoryName');
//     res.status(201).json({
//       state: 201,
//       message: 'Course created successfully',
//       data: populatedCourse,
//     });
//   } catch (error: any) {
//     console.error('Error creating course:', error);
//     res.status(500).json({
//       state: 500,
//       message: error.message || 'Server Error while creating course',
//       data: null,
//     });
//   }
// }; 
const createCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const validationResult = courseSchemas_1.createCourseSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                message: 'Validation failed for course data',
                data: validationResult.error.errors,
            });
            return;
        }
        const courseDataFromRequest = validationResult.data;
        let bannerS3Url = null;
        if (req.file) {
            const file = req.file;
            const s3Key = `courses/banners/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
            try {
                // ✅ 2. Read the file from the disk path provided by multer
                const fileBuffer = yield promises_1.default.readFile(file.path);
                // 3. Upload the buffer to S3
                bannerS3Url = yield (0, s3Upload_1.uploadFileToS3)(fileBuffer, s3Key, file.mimetype);
                // ✅ 4. Delete the temporary file from your local server
                yield promises_1.default.unlink(file.path);
            }
            catch (uploadError) {
                console.error('Error processing file for course creation:', uploadError);
                // Cleanup temp file if it exists and S3 upload fails
                if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path)
                    yield promises_1.default.unlink(req.file.path).catch(err => console.error("Failed to cleanup temp file:", err));
                res.status(500).json({
                    state: 500,
                    message: 'Failed to upload banner image.',
                    data: null,
                });
                return;
            }
        }
        // ...The rest of your function remains the same...
        const newCourseDoc = new Course_1.default(Object.assign(Object.assign({}, courseDataFromRequest), { banner: bannerS3Url }));
        yield newCourseDoc.save();
        res.status(201).json({
            state: 201,
            message: 'Course created successfully',
            data: newCourseDoc,
        });
    }
    catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error while creating course',
            data: null,
        });
    }
});
exports.createCourse = createCourse;
// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Public
// src/controllers/courseController.ts
// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Public
// export const updateCourse = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const idValidationResult = getCourseByIdBodySchema.safeParse(req.params);
//     if (!idValidationResult.success) {
//       res.status(400).json({
//         state: 400,
//         message: 'Invalid Course ID format in URL.',
//         data: idValidationResult.error.errors,
//       });
//       return;
//     }
//     const courseId = idValidationResult.data.id;
//     // ✅ START: ADD THIS CODE BLOCK TO PARSE FORM DATA
//     const parsedBody = { ...req.body };
//     if (parsedBody.priority) {
//       parsedBody.priority = parseInt(parsedBody.priority, 10);
//     }
//     if (parsedBody.isLive) {
//       parsedBody.isLive = parsedBody.isLive === 'true';
//     }
//     if (parsedBody.isRecorded) {
//         parsedBody.isRecorded = parsedBody.isRecorded === 'true';
//     }
//     if (parsedBody.isFree) {
//       parsedBody.isFree = parsedBody.isFree === 'true';
//     }
//     if (parsedBody.liveClassesCount) {
//         parsedBody.liveClassesCount = parseInt(parsedBody.liveClassesCount, 10);
//     }
//     if (parsedBody.recordedClassesCount) {
//         parsedBody.recordedClassesCount = parseInt(parsedBody.recordedClassesCount, 10);
//     }
//     if (parsedBody.courseInfo && typeof parsedBody.courseInfo === 'string') {
//         try { parsedBody.courseInfo = JSON.parse(parsedBody.courseInfo); } catch (e) { /* ignore */ }
//     }
//     if (parsedBody.courseHighlights && typeof parsedBody.courseHighlights === 'string') {
//         try { parsedBody.courseHighlights = JSON.parse(parsedBody.courseHighlights); } catch (e) { /* ignore */ }
//     }
//     // ✅ END: ADDED CODE BLOCK
//     // Now, validate the parsed body instead of req.body
//     const bodyValidationResult = updateCourseSchema.safeParse(parsedBody);
//     if (!bodyValidationResult.success) {
//       res.status(400).json({
//         state: 400,
//         message: 'Validation failed for update data',
//         data: bodyValidationResult.error.errors.map(err => ({
//           path: err.path.join('.'),
//           message: err.message
//         })),
//       });
//       return;
//     }
//     const updatesFromBody = bodyValidationResult.data;
//     const courseItem = await Course.findById(courseId);
//     if (!courseItem) {
//       res.status(404).json({ state: 404, message: 'Course not found', data: null });
//       return;
//     }
//     // ... The rest of your updateCourse function remains exactly the same
//     // (The part that handles the banner S3 upload, etc.)
//     const currentBannerUrl = courseItem.banner;
//     let newBannerS3Url: string | null | undefined = undefined;
//     if (req.file) {
//       const file = req.file as Express.Multer.File;
//       const safeOriginalName = file.originalname.replace(/\s+/g, '_');
//       const s3Key = `courses/banners/${Date.now()}-${safeOriginalName}`;
//       try {
//         newBannerS3Url = await uploadFileToS3(file.buffer, s3Key, file.mimetype);
//         console.log(`New banner uploaded to S3: ${newBannerS3Url}`);
//         if (currentBannerUrl && currentBannerUrl !== newBannerS3Url) {
//           const oldKey = extractKeyFromS3Url(currentBannerUrl);
//           if (oldKey) {
//             console.log(`Attempting to delete old S3 banner with key: ${oldKey}`);
//             await deleteFileFromS3(oldKey);
//           }
//         }
//       } catch (uploadError) {
//         console.error('Error uploading new banner to S3 during update:', uploadError);
//         res.status(500).json({
//           state: 500,
//           message: 'Failed to upload new banner image. Other updates were not applied.',
//           data: null
//         });
//         return;
//       }
//     } else if (updatesFromBody.hasOwnProperty('banner')) {
//       const bannerValueFromBody = updatesFromBody.banner;
//       if (bannerValueFromBody === null) {
//         if (currentBannerUrl) {
//           const oldKey = extractKeyFromS3Url(currentBannerUrl);
//           if (oldKey) {
//             console.log(`Attempting to delete S3 banner (explicitly set to null) with key: ${oldKey}`);
//             await deleteFileFromS3(oldKey).catch(e => console.error("Error deleting S3 banner on null update:", e));
//           }
//         }
//         newBannerS3Url = null;
//       } else if (typeof bannerValueFromBody === 'string' && bannerValueFromBody !== currentBannerUrl) {
//         if (currentBannerUrl) {
//           const oldKey = extractKeyFromS3Url(currentBannerUrl);
//           if (oldKey) {
//             console.log(`Attempting to delete old S3 banner (replaced by new URL) with key: ${oldKey}`);
//             await deleteFileFromS3(oldKey).catch(e => console.error("Error deleting old S3 banner on URL update:", e));
//           }
//         }
//         newBannerS3Url = bannerValueFromBody;
//       }
//     }
//     const finalUpdates: Partial<ICourse> = { ...updatesFromBody } as Partial<ICourse>;
//     if (updatesFromBody.mainCategory && typeof updatesFromBody.mainCategory === 'string') {
//       if (!(await validateReference(MainCategory, updatesFromBody.mainCategory, 'Main Category', res))) return;
//       finalUpdates.mainCategory = new Types.ObjectId(updatesFromBody.mainCategory);
//     } else if (updatesFromBody.mainCategory === null || updatesFromBody.mainCategory === undefined) {
//       delete finalUpdates.mainCategory;
//     }
//     if (updatesFromBody.category && typeof updatesFromBody.category === 'string') {
//       if (!(await validateReference(Category, updatesFromBody.category, 'Category', res))) return;
//       finalUpdates.category = new Types.ObjectId(updatesFromBody.category);
//     } else if (updatesFromBody.category === null || updatesFromBody.category === undefined) {
//       delete finalUpdates.category;
//     }
//     if (newBannerS3Url !== undefined) {
//       finalUpdates.banner = newBannerS3Url;
//     } else if (!updatesFromBody.hasOwnProperty('banner')) {
//       delete finalUpdates.banner;
//     }
//     if (finalUpdates.title && finalUpdates.title !== courseItem.title) {
//       const existingCourseWithNewTitle = await Course.findOne({ title: finalUpdates.title });
//       if (existingCourseWithNewTitle && !(courseItem.id as Types.ObjectId).equals(existingCourseWithNewTitle.id as Types.ObjectId)) {
//         res.status(400).json({
//           state: 400,
//           message: 'A course with this title already exists.',
//           data: null,
//         });
//         return;
//       }
//     }
//     Object.assign(courseItem, finalUpdates);
//     const updatedCourseDoc = await courseItem.save();
//     const populatedCourse = await Course.findById(updatedCourseDoc.id)
//       .populate('mainCategory', 'id mainCategoryName')
//       .populate('category', 'id categoryName');
//     res.status(200).json({
//       state: 200,
//       message: 'Course updated successfully',
//       data: populatedCourse
//     });
//   } catch (error: any) {
//     console.error('Error updating course:', error);
//     if (error instanceof multer.MulterError) {
//       res.status(400).json({ state: 400, message: `File upload error: ${error.message}`, data: null });
//       return;
//     } else if (error.message === 'Only image files are allowed!') {
//       res.status(400).json({ state: 400, message: error.message, data: null });
//       return;
//     }
//     res.status(500).json({
//       state: 500,
//       message: error.message || 'Server Error while updating course',
//       data: null
//     });
//   }
// };
// In src/controllers/courseController.ts
// export const updateCourse = async (req: Request, res: Response): Promise<void> => {
//   // console.log("--- UPDATE COURSE REQUEST RECEIVED ---");
//   try {
//     // ✨ DEBUG: Log the file object right at the start. This is the most important log.
//     // console.log("1. Checking req.file:", req.file);
//     // ... (keep the ID validation and body parsing exactly as is)
//     const idValidationResult = getCourseByIdBodySchema.safeParse(req.params);
//     if (!idValidationResult.success) {
//        res.status(400).json({ message: 'Invalid Course ID' });
//        return
//     }
//     const courseId = idValidationResult.data.id;
//     const parsedBody = { ...req.body };
//     // ... (all your parsing logic for isLive, courseInfo, etc.)
//     const bodyValidationResult = updateCourseSchema.safeParse(parsedBody);
//     if (!bodyValidationResult.success) {
//      res.status(400).json({
//             message: 'Validation failed',
//             data: bodyValidationResult.error.errors,
//         });
//         return
//     }
//     const courseItem = await Course.findById(courseId);
//     if (!courseItem) {
//    res.status(404).json({ message: 'Course not found' });
//    return 
//     }
//     const updates = bodyValidationResult.data;
//     if (req.file) {
//       // ✨ DEBUG: Confirm we entered the file processing block
//       // console.log("2. ✅ req.file exists. Entering file processing block.");
//       const file = req.file as Express.Multer.File;
//       const s3Key = `courses/banners/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
//       const newBannerS3Url = await uploadFileToS3(file.buffer, s3Key, file.mimetype);
//       // ✨ DEBUG: Confirm the S3 upload returned a URL
//       // console.log("3. S3 Upload successful. New URL:", newBannerS3Url);
//       if (courseItem.banner) {
//         const oldKey = extractKeyFromS3Url(courseItem.banner);
//         if (oldKey) { await deleteFileFromS3(oldKey).catch(e => console.error("Failed to delete old banner:", e)); }
//       }
//       (updates as any).banner = newBannerS3Url;
//     } else {
//         // ✨ DEBUG: Confirm the file was NOT found
//         // console.log("2. ❌ req.file does NOT exist. Skipping file processing.");
//     }
//     // ... (keep your category and title validation logic)
//     // ✨ DEBUG: Log the final object just before it's saved
//     // console.log("4. Final updates object being saved:", updates);
//     Object.assign(courseItem, updates);
//     const updatedCourseDoc = await courseItem.save();
//     const populatedCourse = await Course.findById(updatedCourseDoc.id)
//       .populate('mainCategory', 'id mainCategoryName')
//       .populate('category', 'id categoryName');
//     // console.log("5. ✅ Course updated successfully in database.");
//     res.status(200).json({
//       state: 200,
//       message: 'Course updated successfully',
//       data: populatedCourse,
//     });
//   } catch (error: any) {
//     // console.error('--- 🚨 AN ERROR OCCURRED ---', error);
//     res.status(500).json({
//       message: error.message || 'Server Error while updating course',
//     });
//   }
// }; 
// export const updateCourse = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const idValidationResult = getCourseByIdBodySchema.safeParse(req.params);
//     if (!idValidationResult.success) {
//       res.status(400).json({ message: 'Invalid Course ID format in URL.' });
//       return;
//     }
//     const courseId = idValidationResult.data.id;
//     const bodyValidationResult = updateCourseSchema.safeParse(req.body);
//     if (!bodyValidationResult.success) {
//       res.status(400).json({ message: 'Validation failed for update data', data: bodyValidationResult.error.errors });
//       return;
//     }
//     const updatesFromBody = bodyValidationResult.data;
//     const courseToUpdate = await Course.findById(courseId);
//     if (!courseToUpdate) {
//       res.status(404).json({ message: 'Course not found' });
//       return;
//     }
//     // Handle new file upload: upload new, delete old
//     if (req.file) {
//       const file = req.file;
//       const s3Key = `courses/banners/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
//       try {
//         // ✅ Read file from disk, upload to S3, and delete temporary file
//         const fileBuffer = await fs.readFile(file.path);
//         const newBannerUrl = await uploadFileToS3(fileBuffer, s3Key, file.mimetype);
//         await fs.unlink(file.path);
//         // If an old banner exists, delete it from S3
//         if (courseToUpdate.banner) {
//           const oldKey = extractKeyFromS3Url(courseToUpdate.banner);
//           if (oldKey) {
//             await deleteFileFromS3(oldKey).catch(e => console.error("Failed to delete old banner:", e));
//           }
//         }
//         updatesFromBody.banner = newBannerUrl; // Set the new banner URL for the update
//       } catch (uploadError) {
//         console.error('Error uploading new banner to S3 during update:', uploadError);
//         if (req.file?.path) await fs.unlink(req.file.path).catch(err => console.error("Failed to cleanup temp file:", err));
//         res.status(500).json({ message: 'Failed to upload new banner.' });
//         return;
//       }
//     }
//     Object.assign(courseToUpdate, updatesFromBody);
//     const updatedCourseDoc = await courseToUpdate.save();
//     const populatedCourse = await Course.findById(updatedCourseDoc.id)
//       .populate('mainCategory', 'id mainCategoryName')
//       .populate('category', 'id categoryName');
//     res.status(200).json({
//       state: 200,
//       message: 'Course updated successfully',
//       data: populatedCourse
//     });
//   } catch (error: any) {
//     console.error('Error updating course:', error);
//     res.status(500).json({
//       message: error.message || 'Server Error while updating course'
//     });
//   }
// };
const updateCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const updatesFromBody = courseSchemas_1.updateCourseSchema.parse(req.body);
        const courseToUpdate = yield Course_1.default.findById(id);
        if (!courseToUpdate) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }
        if (req.file) {
            const file = req.file;
            const s3Key = `courses/banners/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
            try {
                // ✅ Read file from disk, upload to S3, and delete temporary file
                const fileBuffer = yield promises_1.default.readFile(file.path);
                const newBannerUrl = yield (0, s3Upload_1.uploadFileToS3)(fileBuffer, s3Key, file.mimetype);
                yield promises_1.default.unlink(file.path);
                // If an old banner exists, delete it from S3
                if (courseToUpdate.banner) {
                    const oldKey = (0, s3Upload_1.extractKeyFromS3Url)(courseToUpdate.banner);
                    if (oldKey) {
                        yield (0, s3Upload_1.deleteFileFromS3)(oldKey).catch(e => console.error("Failed to delete old banner:", e));
                    }
                }
                updatesFromBody.banner = newBannerUrl;
            }
            catch (uploadError) {
                console.error('Error uploading new banner during update:', uploadError);
                if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path)
                    yield promises_1.default.unlink(req.file.path).catch(err => console.error("Failed to cleanup temp file:", err));
                res.status(500).json({ message: 'Failed to upload new banner.' });
                return;
            }
        }
        Object.assign(courseToUpdate, updatesFromBody);
        yield courseToUpdate.save();
        res.status(200).json({
            state: 200,
            message: 'Course updated successfully',
            data: courseToUpdate,
        });
    }
    catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            message: error.message || 'Server Error while updating course'
        });
    }
});
exports.updateCourse = updateCourse;
// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coursesAggregation = yield Course_1.default.aggregate([
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
                $lookup: { from: 'orders', localField: '_id', foreignField: 'course', as: 'orders' }
            },
            {
                $addFields: {
                    mainCategoryData: { $arrayElemAt: ['$mainCategoryInfo', 0] },
                    categoryData: { $arrayElemAt: ['$categoryInfo', 0] },
                    studentCount: { $size: '$orders' }
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    status: 1, priority: 1, isLive: 1, isRecorded: 1, isFree: 1, banner: 1,
                    title: 1, assignHeader: 1, description: 1,
                    mainCategory: '$mainCategoryData',
                    category: '$categoryData',
                    liveClassesCount: 1, recordedClassesCount: 1, courseInfo: 1,
                    demoVideos: {
                        $map: {
                            input: '$demoVideos',
                            as: 'dv',
                            in: {
                                _id: 0,
                                id: '$$dv._id',
                                title: '$$dv.title',
                                image: '$$dv.image',
                                url: '$$dv.url'
                            }
                        }
                    },
                    batchInfoPdfUrl: 1,
                    facultyDetails: {
                        $cond: {
                            if: '$facultyDetails',
                            then: {
                                _id: 0, id: '$facultyDetails._id',
                                name: '$facultyDetails.name',
                                designation: '$facultyDetails.designation',
                                bio: '$facultyDetails.bio',
                                imageUrl: '$facultyDetails.imageUrl',
                                socialLinks: '$facultyDetails.socialLinks',
                                videoUrl: '$facultyDetails.videoUrl',
                                experience: '$facultyDetails.experience',
                                reach: '$facultyDetails.reach',
                                description: '$facultyDetails.description'
                            },
                            else: null
                        }
                    },
                    courseHighlights: 1,
                    faq: {
                        $map: {
                            input: '$faq',
                            as: 'f',
                            in: {
                                _id: 0, id: '$$f._id',
                                question: '$$f.question',
                                answer: '$$f.answer'
                            }
                        }
                    },
                    createdAt: 1, updatedAt: 1,
                    studentCount: 1
                    // By not listing mainCategoryInfo, categoryInfo, orders, they are excluded
                }
            }
        ]);
        res.status(200).json({
            state: 200,
            message: coursesAggregation.length > 0 ? 'Courses retrieved successfully' : 'No data found',
            data: coursesAggregation,
        });
    }
    catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: [],
        });
    }
});
exports.getCourses = getCourses;
// @desc    Get a single course by ID
// @route   GET /api/courses/:id
// @access  Public
// export const getCourseById = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const validationResult = getCourseByIdBodySchema.safeParse(req.params);
//     if (!validationResult.success) {
//       res.status(400).json({
//         state: 400,
//         message: 'Invalid Course ID format.',
//         data: validationResult.error.errors.map(err => ({ path: err.path.join('.'), message: err.message })),
//       });
//       return;
//     }
//     const { id: courseIdParam } = validationResult.data;
//     const courseResultAggregation = await Course.aggregate([
//       { $match: { _id: new Types.ObjectId(courseIdParam) } },
//       {
//         $lookup: {
//           from: 'maincategories', localField: 'mainCategory', foreignField: '_id', as: 'mainCategoryInfo',
//           pipeline: [{ $project: { _id: 0, id: '$_id', mainCategoryName: 1 } }]
//         }
//       },
//       {
//         $lookup: {
//           from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo',
//           pipeline: [{ $project: { _id: 0, id: '$_id', categoryName: 1 } }]
//         }
//       },
//       { $lookup: { from: 'orders', localField: '_id', foreignField: 'course', as: 'orders' } },
//       {
//         $addFields: {
//           mainCategoryData: { $arrayElemAt: ['$mainCategoryInfo', 0] },
//           categoryData: { $arrayElemAt: ['$categoryInfo', 0] },
//           studentCount: { $size: '$orders' }
//         }
//       },
//       {
//         $project: {
//           _id: 0, id: '$_id',
//           status: 1, priority: 1, isLive: 1, isRecorded: 1, isFree: 1, banner: 1,
//           title: 1, assignHeader: 1, description: 1,
//           mainCategory: '$mainCategoryData',
//           category: '$categoryData',
//           liveClassesCount: 1, recordedClassesCount: 1, courseInfo: 1,
//           demoVideos: {
//             $map: {
//               input: '$demoVideos', as: 'dv',
//               in: { _id: 0, id: '$$dv._id', title: '$$dv.title', url: '$$dv.url', image: '$$dv.image' }
//             }
//           },
//           batchInfoPdfUrl: 1,
//           facultyDetails: {
//             $cond: {
//               if: '$facultyDetails',
//               then: {
//                 _id: 0, id: '$facultyDetails._id', name: '$facultyDetails.name', designation: '$facultyDetails.designation', bio: '$facultyDetails.bio',
//                 imageUrl: '$facultyDetails.imageUrl', socialLinks: '$facultyDetails.socialLinks', videoUrl: '$facultyDetails.videoUrl',
//                 experience: '$facultyDetails.experience', reach: '$facultyDetails.reach', description: '$facultyDetails.description'
//               }, else: null
//             }
//           },
//           courseHighlights: 1,
//           faq: {
//             $map: {
//               input: '$faq', as: 'f',
//               in: { _id: 0, id: '$$f._id', question: '$$f.question', answer: '$$f.answer' }
//             }
//           },
//           createdAt: 1, updatedAt: 1,
//           studentCount: 1
//           // By not listing mainCategoryInfo, categoryInfo, orders, they are excluded
//         }
//       }
//     ]);
//     const courseItem = courseResultAggregation[0];
//     if (courseItem) {
//       res.status(200).json({
//         state: 200,
//         message: 'Course retrieved successfully',
//         data: courseItem,
//       });
//     } else {
//       res.status(404).json({ state: 404, message: 'Course not found', data: null });
//     }
//   } catch (error: any) {
//     console.error('Error fetching course by ID:', error);
//     res.status(500).json({ state: 500, message: error.message || 'Server Error', data: null });
//   }
// };
// export const getCourseById = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const validationResult = getCourseByIdBodySchema.safeParse(req.params);
//     if (!validationResult.success) {
//       res.status(400).json({
//         state: 400,
//         message: 'Invalid Course ID format.',
//         data: validationResult.error.errors.map(err => ({ path: err.path.join('.'), message: err.message })),
//       });
//       return;
//     }
//     const { id: courseIdParam } = validationResult.data;
//     const courseResultAggregation = await Course.aggregate([
//       { $match: { _id: new Types.ObjectId(courseIdParam) } },
//       // --- ADD THIS LOOKUP STAGE FOR CLASSES ---
//       {
//         $lookup: {
//           from: 'classes', // The actual collection name for your Class model
//           localField: 'classes',
//           foreignField: '_id',
//           as: 'classDetails'
//         }
//       },
//       // --- END OF ADDED STAGE ---
//       {
//         $lookup: {
//           from: 'maincategories', localField: 'mainCategory', foreignField: '_id', as: 'mainCategoryInfo',
//           pipeline: [{ $project: { _id: 0, id: '$_id', mainCategoryName: 1 } }]
//         }
//       },
//       {
//         $lookup: {
//           from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo',
//           pipeline: [{ $project: { _id: 0, id: '$_id', categoryName: 1 } }]
//         }
//       },
//       { $lookup: { from: 'orders', localField: '_id', foreignField: 'course', as: 'orders' } },
//       {
//         $addFields: {
//           mainCategoryData: { $arrayElemAt: ['$mainCategoryInfo', 0] },
//           categoryData: { $arrayElemAt: ['$categoryInfo', 0] },
//           studentCount: { $size: '$orders' }
//         }
//       },
//       {
//         $project: {
//           _id: 0, id: '$_id',
//           status: 1, priority: 1, isLive: 1, isRecorded: 1, isFree: 1, banner: 1,
//           title: 1, assignHeader: 1, description: 1,
//           mainCategory: '$mainCategoryData',
//           category: '$categoryData',
//           // --- ADD classes: '$classDetails' TO INCLUDE IT IN THE FINAL OUTPUT ---
//           classes: '$classDetails',
//           // --- END OF ADDED FIELD ---
//           liveClassesCount: 1, recordedClassesCount: 1, courseInfo: 1,
//           demoVideos: {
//             $map: {
//               input: '$demoVideos', as: 'dv',
//               in: { _id: 0, id: '$$dv._id', title: '$$dv.title', url: '$$dv.url', image: '$$dv.image' }
//             }
//           },
//           batchInfoPdfUrl: 1,
//           facultyDetails: {
//             $cond: {
//               if: '$facultyDetails',
//               then: {
//                 _id: 0, id: '$facultyDetails._id', name: '$facultyDetails.name', designation: '$facultyDetails.designation', bio: '$facultyDetails.bio',
//                 imageUrl: '$facultyDetails.imageUrl', socialLinks: '$facultyDetails.socialLinks', videoUrl: '$facultyDetails.videoUrl',
//                 experience: '$facultyDetails.experience', reach: '$facultyDetails.reach', description: '$facultyDetails.description'
//               }, else: null
//             }
//           },
//           courseHighlights: 1,
//           faq: {
//             $map: {
//               input: '$faq', as: 'f',
//               in: { _id: 0, id: '$$f._id', question: '$$f.question', answer: '$$f.answer' }
//             }
//           },
//           createdAt: 1, updatedAt: 1,
//           studentCount: 1
//         }
//       }
//     ]);
//     const courseItem = courseResultAggregation[0];
//     if (courseItem) {
//       res.status(200).json({
//         state: 200,
//         message: 'Course retrieved successfully',
//         data: courseItem,
//       });
//     } else {
//       res.status(404).json({ state: 404, message: 'Course not found', data: null });
//     }
//   } catch (error: any) {
//     console.error('Error fetching course by ID:', error);
//     res.status(500).json({ state: 500, message: error.message || 'Server Error', data: null });
//   }
// };
const getCourseById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = courseSchemas_1.getCourseByIdBodySchema.safeParse(req.params);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                message: 'Invalid Course ID format.',
                data: validationResult.error.errors.map(err => ({ path: err.path.join('.'), message: err.message })),
            });
            return;
        }
        const { id: courseIdParam } = validationResult.data;
        const courseResultAggregation = yield Course_1.default.aggregate([
            { $match: { _id: new mongoose_1.Types.ObjectId(courseIdParam) } },
            // Lookup for classes (this part is correct)
            {
                $lookup: {
                    from: 'classes',
                    localField: 'classes',
                    foreignField: '_id',
                    as: 'classDetails'
                }
            },
            // ✅ 1. ADD THIS LOOKUP STAGE FOR PDFs
            {
                $lookup: {
                    from: 'pdfs', // The collection name for your Pdf model
                    localField: 'assignedPdfs',
                    foreignField: '_id',
                    as: 'assignedPdfsDetails'
                }
            },
            // Your existing lookups for categories and orders
            {
                $lookup: {
                    from: 'maincategories', localField: 'mainCategory', foreignField: '_id', as: 'mainCategoryInfo',
                    pipeline: [{ $project: { _id: 0, id: '$_id', mainCategoryName: 1 } }]
                }
            },
            {
                $lookup: {
                    from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo',
                    pipeline: [{ $project: { _id: 0, id: '$_id', categoryName: 1 } }]
                }
            },
            { $lookup: { from: 'orders', localField: '_id', foreignField: 'course', as: 'orders' } },
            {
                $addFields: {
                    mainCategoryData: { $arrayElemAt: ['$mainCategoryInfo', 0] },
                    categoryData: { $arrayElemAt: ['$categoryInfo', 0] },
                    studentCount: { $size: '$orders' }
                }
            },
            {
                $project: {
                    _id: 0, id: '$_id',
                    status: 1, priority: 1, isLive: 1, isRecorded: 1, isFree: 1, banner: 1,
                    title: 1, assignHeader: 1, description: 1,
                    mainCategory: '$mainCategoryData',
                    category: '$categoryData',
                    classes: '$classDetails',
                    // ✅ 2. ADD assignedPdfs TO THE FINAL OUTPUT
                    assignedPdfs: '$assignedPdfsDetails',
                    liveClassesCount: 1, recordedClassesCount: 1, courseInfo: 1,
                    demoVideos: {
                        $map: {
                            input: '$demoVideos', as: 'dv',
                            in: { _id: 0, id: '$$dv._id', title: '$$dv.title', url: '$$dv.url', image: '$$dv.image' }
                        }
                    },
                    batchInfoPdfUrl: 1,
                    facultyDetails: {
                        $cond: {
                            if: '$facultyDetails',
                            then: {
                                _id: 0, id: '$facultyDetails._id', name: '$facultyDetails.name', designation: '$facultyDetails.designation', bio: '$facultyDetails.bio',
                                imageUrl: '$facultyDetails.imageUrl', socialLinks: '$facultyDetails.socialLinks', videoUrl: '$facultyDetails.videoUrl',
                                experience: '$facultyDetails.experience', reach: '$facultyDetails.reach', description: '$facultyDetails.description'
                            }, else: null
                        }
                    },
                    courseHighlights: 1,
                    faq: {
                        $map: {
                            input: '$faq', as: 'f',
                            in: { _id: 0, id: '$$f._id', question: '$$f.question', answer: '$$f.answer' }
                        }
                    },
                    createdAt: 1, updatedAt: 1,
                    studentCount: 1
                }
            }
        ]);
        const courseItem = courseResultAggregation[0];
        if (courseItem) {
            res.status(200).json({
                state: 200,
                message: 'Course retrieved successfully',
                data: courseItem,
            });
        }
        else {
            res.status(404).json({ state: 404, message: 'Course not found', data: null });
        }
    }
    catch (error) {
        console.error('Error fetching course by ID:', error);
        res.status(500).json({ state: 500, message: error.message || 'Server Error', data: null });
    }
});
exports.getCourseById = getCourseById;
// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Public
const deleteCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = courseSchemas_1.getCourseByIdBodySchema.safeParse(req.params);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                message: 'Invalid Course ID format.',
                data: validationResult.error.errors,
            });
            return;
        }
        const { id } = validationResult.data;
        const courseItem = yield Course_1.default.findById(id);
        if (courseItem) {
            if (courseItem.banner) {
                const s3Key = (0, s3Upload_1.extractKeyFromS3Url)(courseItem.banner);
                if (s3Key) {
                    try {
                        console.log(`Deleting banner from S3 for course ${id}: key ${s3Key}`);
                        yield (0, s3Upload_1.deleteFileFromS3)(s3Key);
                    }
                    catch (s3Error) {
                        console.error(`Failed to delete banner from S3 for course ${id}:`, s3Error);
                    }
                }
            }
            yield Course_1.default.deleteOne({ _id: courseItem._id });
            res.status(200).json({ state: 200, message: 'Course removed successfully', data: null });
        }
        else {
            res.status(404).json({ state: 404, message: 'Course not found', data: null });
        }
    }
    catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ state: 500, message: error.message || 'Server Error', data: null });
    }
});
exports.deleteCourse = deleteCourse;
// @desc    Get selective course data (e.g., for public listing)
// @route   GET /api/courses/data
// @access  Public
const getCourseData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield Course_1.default.aggregate([
            { $match: { status: 'active' } },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    title: 1,
                    banner: 1,
                    description: 1,
                    liveClassesCount: 1,
                    recordedClassesCount: 1,
                    courseInfo: 1,
                    batchInfoPdfUrl: 1,
                    facultyDetails: {
                        $cond: {
                            if: '$facultyDetails',
                            then: {
                                _id: 0,
                                id: '$facultyDetails._id',
                                name: '$facultyDetails.name',
                                designation: '$facultyDetails.designation',
                                bio: '$facultyDetails.bio',
                                imageUrl: '$facultyDetails.imageUrl',
                                socialLinks: '$facultyDetails.socialLinks',
                                videoUrl: '$facultyDetails.videoUrl',
                                experience: '$facultyDetails.experience',
                                reach: '$facultyDetails.reach',
                                description: '$facultyDetails.description'
                            },
                            else: null
                        }
                    },
                    courseHighlights: 1,
                    faq: {
                        $map: {
                            input: '$faq',
                            as: 'f',
                            in: {
                                _id: 0,
                                id: '$$f._id',
                                question: '$$f.question',
                                answer: '$$f.answer'
                            }
                        }
                    },
                    isRecorded: 1,
                    isFree: 1,
                    price: 1
                }
            }
        ]);
        console.log(courses);
        res.status(200).json({
            state: 200,
            message: 'Active course data retrieved successfully',
            data: courses,
        });
    }
    catch (error) {
        console.error('Error fetching course data:', error);
        res.status(500).json({ state: 500, message: error.message || 'Server Error', data: [] });
    }
});
exports.getCourseData = getCourseData;
// @desc    Update course status
// @route   PATCH /api/courses/:id/status
// @access  Public
const updateCourseStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = courseSchemas_1.getCourseByIdBodySchema.safeParse(req.params);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                message: 'Invalid Course ID format.',
                data: validationResult.error.errors,
            });
            return;
        }
        const courseId = validationResult.data.id;
        const courseToUpdate = yield Course_1.default.findById(courseId);
        if (!courseToUpdate) {
            res.status(404).json({ state: 404, message: 'Course not found.', data: null });
            return;
        }
        courseToUpdate.status = courseToUpdate.status === 'active' ? 'inactive' : 'active';
        const updatedCourse = yield courseToUpdate.save();
        res.status(200).json({
            state: 200,
            message: 'Course status toggled successfully',
            data: updatedCourse,
        });
    }
    catch (error) {
        console.error('Error toggling course status:', error);
        res.status(500).json({ state: 500, message: error.message || 'Server Error', data: null });
    }
});
exports.updateCourseStatus = updateCourseStatus;
// @desc    Get a single course by ID (alternative, from body)
// @route   POST /api/courses/getbyid
// @access  Public
const getCourseById2 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const validationResult = getCourseByIdBodySchema.safeParse(req.body);
        // Check if body exists and has id
        if (!req.body) {
            res.status(400).json({
                state: 400,
                message: 'Request body is missing',
                data: null
            });
            return;
        }
        if (!req.body.id) {
            res.status(400).json({
                state: 400,
                message: 'ID is missing from request body',
                data: { receivedBody: req.body }
            });
            return;
        }
        const { id } = req.body;
        console.log('Extracted ID:', id);
        // Validate ObjectId format
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                state: 400,
                message: 'Invalid ObjectId format',
                data: { providedId: id }
            });
            return;
        }
        console.log('About to query database with aggregation pipeline');
        // Use aggregation pipeline similar to getCourseById
        const courseResultAggregation = yield Course_1.default.aggregate([
            { $match: { _id: new mongoose_1.Types.ObjectId(id) } },
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
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'course',
                    as: 'orders'
                }
            },
            {
                $addFields: {
                    mainCategoryData: { $arrayElemAt: ['$mainCategoryInfo', 0] },
                    categoryData: { $arrayElemAt: ['$categoryInfo', 0] },
                    studentCount: { $size: '$orders' }
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    status: 1,
                    priority: 1,
                    isLive: 1,
                    isRecorded: 1,
                    isFree: 1,
                    banner: 1,
                    title: 1,
                    assignHeader: 1,
                    description: 1,
                    mainCategory: '$mainCategoryData',
                    category: '$categoryData',
                    liveClassesCount: 1,
                    recordedClassesCount: 1,
                    courseInfo: 1,
                    demoVideos: {
                        $map: {
                            input: '$demoVideos',
                            as: 'dv',
                            in: {
                                id: '$$dv._id',
                                title: '$$dv.title',
                                image: '$$dv.image',
                                url: '$$dv.url'
                            }
                        }
                    },
                    batchInfoPdfUrl: 1,
                    facultyDetails: {
                        $cond: {
                            if: '$facultyDetails',
                            then: {
                                _id: 0,
                                id: '$facultyDetails._id',
                                name: '$facultyDetails.name',
                                designation: '$facultyDetails.designation',
                                bio: '$facultyDetails.bio',
                                imageUrl: '$facultyDetails.imageUrl',
                                socialLinks: '$facultyDetails.socialLinks',
                                videoUrl: '$facultyDetails.videoUrl',
                                experience: '$facultyDetails.experience',
                                reach: '$facultyDetails.reach',
                                description: '$facultyDetails.description'
                            },
                            else: null
                        }
                    },
                    courseHighlights: 1,
                    faq: {
                        $map: {
                            input: '$faq',
                            as: 'f',
                            in: {
                                _id: 0,
                                id: '$$f._id',
                                question: '$$f.question',
                                answer: '$$f.answer'
                            }
                        }
                    },
                    createdAt: 1,
                    updatedAt: 1,
                    studentCount: 1
                }
            }
        ]);
        console.log('Aggregation query completed, found:', courseResultAggregation.length, 'course(s)');
        const courseItem = courseResultAggregation[0];
        if (courseItem) {
            res.status(200).json({
                state: 200,
                message: 'Course retrieved successfully (from body ID)',
                data: courseItem
            });
        }
        else {
            res.status(404).json({
                state: 404,
                message: 'Course not found (from body ID)',
                data: null
            });
        }
    }
    catch (error) {
        console.error('Error fetching course by ID (method 2):', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: null
        });
    }
});
exports.getCourseById2 = getCourseById2;
// @desc    Search courses with pagination
// @route   GET /api/courses/search
// @access  Public
const searchCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = courseSchemas_1.courseSearchSchema.safeParse(req.query);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                message: 'Invalid search parameters',
                data: validationResult.error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))
            });
            return;
        }
        const { search, page = 1, limit = 10 } = validationResult.data;
        const matchQuery = {};
        if (search && search.trim()) {
            matchQuery.title = { $regex: search.trim(), $options: 'i' };
        }
        const basePipeline = [
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'maincategories', localField: 'mainCategory', foreignField: '_id', as: 'mainCategoryInfo',
                    pipeline: [{ $project: { _id: 0, id: '$_id', mainCategoryName: 1 } }]
                }
            },
            {
                $lookup: {
                    from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo',
                    pipeline: [{ $project: { _id: 0, id: '$_id', categoryName: 1 } }]
                }
            },
            {
                $addFields: {
                    mainCategoryData: { $arrayElemAt: ['$mainCategoryInfo', 0] },
                    categoryData: { $arrayElemAt: ['$categoryInfo', 0] }
                }
            },
            {
                $project: {
                    _id: 0, id: '$_id', status: 1, priority: 1, isLive: 1, isRecorded: 1, isFree: 1, banner: 1,
                    title: 1, assignHeader: 1, description: 1,
                    mainCategory: '$mainCategoryData',
                    category: '$categoryData',
                    liveClassesCount: 1, recordedClassesCount: 1, courseInfo: 1,
                    demoVideos: { $map: { input: '$demoVideos', as: 'dv', in: { _id: 0, id: '$$dv._id', title: '$$dv.title', url: '$$dv.url', image: '$$dv.image' } } },
                    batchInfoPdfUrl: 1,
                    facultyDetails: { $cond: { if: '$facultyDetails', then: { _id: 0, id: '$facultyDetails._id', name: '$facultyDetails.name', designation: '$facultyDetails.designation', bio: '$facultyDetails.bio', imageUrl: '$facultyDetails.imageUrl', socialLinks: '$facultyDetails.socialLinks', videoUrl: '$facultyDetails.videoUrl', experience: '$facultyDetails.experience', reach: '$facultyDetails.reach', description: '$facultyDetails.description' }, else: null } },
                    courseHighlights: 1,
                    faq: { $map: { input: '$faq', as: 'f', in: { _id: 0, id: '$$f._id', question: '$$f.question', answer: '$$f.answer' } } },
                    createdAt: 1, updatedAt: 1
                    // By not listing mainCategoryInfo, categoryInfo, they are excluded
                }
            }
        ];
        const coursesPipeline = [
            ...basePipeline,
            { $sort: { title: 1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ];
        const countPipeline = [...basePipeline, { $count: 'total' }];
        const [courses, countResult] = yield Promise.all([
            Course_1.default.aggregate(coursesPipeline),
            Course_1.default.aggregate(countPipeline)
        ]);
        const totalCourses = countResult.length > 0 ? countResult[0].total : 0;
        const totalPages = limit > 0 ? Math.ceil(totalCourses / limit) : (totalCourses > 0 ? 1 : 0);
        res.status(200).json({
            state: 200,
            message: search ? 'Search completed successfully' : 'Courses retrieved successfully',
            data: {
                courses,
                pagination: { totalCourses, currentPage: page, totalPages, limit },
                searchQuery: search || ''
            }
        });
    }
    catch (error) {
        console.error('Error searching courses:', error);
        res.status(500).json({ state: 500, message: error.message || 'Server Error', data: null });
    }
});
exports.searchCourses = searchCourses;
// @desc    Get classes for a specific course
// @route   GET /api/courses/:courseId/classes
// @access  Public
const getClassesByCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        const { populate = 'basic' } = req.query;
        if (!mongoose_1.Types.ObjectId.isValid(courseId)) {
            res.status(400).json({ state: 400, message: 'Invalid course ID format', data: null });
            return;
        }
        const pipeline = [
            { $match: { _id: new mongoose_1.Types.ObjectId(courseId) } },
            {
                $lookup: {
                    from: 'classes',
                    let: { mainCat: '$mainCategory', cat: '$category' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$mainCategory', '$$mainCat'] }, { $eq: ['$category', '$$cat'] }] } } },
                        { $sort: { title: 1 } },
                        ...(populate === 'full' ? [
                            { $lookup: { from: 'teachers', localField: 'teacherName', foreignField: '_id', as: 'teacherNameInfo', pipeline: [{ $project: { _id: 0, id: '$_id', firstName: 1, lastName: 1, email: 1 } }] } },
                            { $lookup: { from: 'sections', localField: 'section', foreignField: '_id', as: 'sectionInfo', pipeline: [{ $project: { _id: 0, id: '$_id', sectionName: 1 } }] } },
                            { $lookup: { from: 'topics', localField: 'topic', foreignField: '_id', as: 'topicInfo', pipeline: [{ $project: { _id: 0, id: '$_id', topicName: 1 } }] } },
                            {
                                $addFields: {
                                    teacherName: { $arrayElemAt: ['$teacherNameInfo', 0] },
                                    section: { $arrayElemAt: ['$sectionInfo', 0] },
                                    topic: { $arrayElemAt: ['$topicInfo', 0] }
                                }
                            },
                        ] : []),
                        {
                            $project: Object.assign({ _id: 0, id: '$_id', title: 1, description: 1, duration: 1, status: 1, createdAt: 1, isFree: 1, link: 1, image: 1 }, (populate === 'full' && { teacherName: 1, section: 1, topic: 1 })
                            // By not listing teacherNameInfo, sectionInfo, topicInfo, they are excluded
                            )
                        }
                    ],
                    as: 'classes'
                }
            },
            { $lookup: { from: 'maincategories', localField: 'mainCategory', foreignField: '_id', as: 'mainCategoryInfo', pipeline: [{ $project: { _id: 0, id: '$_id', mainCategoryName: 1 } }] } },
            { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo', pipeline: [{ $project: { _id: 0, id: '$_id', categoryName: 1 } }] } },
            {
                $project: {
                    _id: 0, id: '$_id', title: 1, isLive: 1, isRecorded: 1, isFree: 1,
                    mainCategory: { $arrayElemAt: ['$mainCategoryInfo', 0] },
                    category: { $arrayElemAt: ['$categoryInfo', 0] },
                    classes: 1,
                    totalClasses: { $size: '$classes' }
                    // By not listing mainCategoryInfo, categoryInfo, they are excluded
                }
            }
        ];
        const result = yield Course_1.default.aggregate(pipeline);
        if (!result.length) {
            res.status(404).json({ state: 404, message: 'Course not found', data: null });
            return;
        }
        const courseData = result[0];
        // Group classes by sections and format as requested
        const topicMap = {};
        courseData.classes.forEach((classItem) => {
            var _a;
            const topicName = ((_a = classItem.topic) === null || _a === void 0 ? void 0 : _a.topicName) || 'No Topic';
            if (!topicMap[topicName]) {
                topicMap[topicName] = [];
            }
            topicMap[topicName].push(classItem);
        });
        // Convert to array format with topicName and classes
        const classesArray = Object.keys(topicMap).map(topicName => ({
            topicName: topicName,
            classes: topicMap[topicName]
        }));
        res.status(200).json({
            state: 200,
            message: 'Classes retrieved successfully',
            data: {
                course: {
                    id: courseData.id, title: courseData.title, isLive: courseData.isLive,
                    isRecorded: courseData.isRecorded, isFree: courseData.isFree,
                    mainCategory: courseData.mainCategory, category: courseData.category
                },
                classes: classesArray,
                totalClasses: courseData.totalClasses
            }
        });
    }
    catch (error) {
        console.error('Error fetching classes for course:', error);
        res.status(500).json({ state: 500, message: error.message || 'Server Error', data: null });
    }
});
exports.getClassesByCourse = getClassesByCourse;
// @desc    Get course with user progress
// @route   POST /api/courses/progress
// @access  Authenticated (User ID required)
const getCourseWithUserProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, userId } = req.body;
        if (!courseId || !userId) {
            res.status(400).json({ state: 400, message: 'Both courseId and userId are required', data: null });
            return;
        }
        if (!mongoose_1.Types.ObjectId.isValid(courseId) || !mongoose_1.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ state: 400, message: 'Invalid Course ID or User ID format', data: null });
            return;
        }
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        const result = yield Course_1.default.aggregate([
            { $match: { _id: new mongoose_1.Types.ObjectId(courseId) } },
            {
                $lookup: {
                    from: 'classes',
                    let: { courseMainCategory: '$mainCategory', courseCategory: '$category' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$mainCategory', '$$courseMainCategory'] }, { $eq: ['$category', '$$courseCategory'] }, { $eq: ['$status', 'active'] }] } } },
                        { $sort: { priority: 1, createdAt: 1 } },
                        {
                            $lookup: {
                                from: 'sections',
                                localField: 'section',
                                foreignField: '_id',
                                as: 'sectionInfo',
                                pipeline: [{ $project: { _id: 0, id: '$_id', sectionName: 1 } }]
                            }
                        }, {
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
                                section: { $arrayElemAt: ['$sectionInfo', 0] },
                                topic: { $arrayElemAt: ['$topicInfo', 0] }
                            }
                        },
                        {
                            $lookup: {
                                from: 'classprogresses',
                                let: { classId: '$_id' },
                                pipeline: [
                                    { $match: { $expr: { $and: [{ $eq: ['$classid', '$$classId'] }, { $eq: ['$userid', userObjectId] }] } } },
                                    { $project: { _id: 0, id: '$_id', user_start_time: 1, user_end_time: 1, createdAt: 1, updatedAt: 1 } }
                                ],
                                as: 'userProgressInfo' // Renamed to avoid confusion with 'progress' field
                            }
                        },
                        {
                            $addFields: {
                                progress: {
                                    $cond: {
                                        if: { $gt: [{ $size: '$userProgressInfo' }, 0] },
                                        then: {
                                            $let: {
                                                vars: { prog: { $arrayElemAt: ['$userProgressInfo', 0] } },
                                                in: {
                                                    id: '$$prog.id',
                                                    user_start_time: '$$prog.user_start_time', user_end_time: '$$prog.user_end_time',
                                                    duration_minutes: { $cond: { if: { $and: [{ $ne: ['$$prog.user_end_time', null] }, { $ne: ['$$prog.user_start_time', null] }] }, then: { $round: [{ $divide: [{ $abs: { $subtract: [{ $toDate: '$$prog.user_end_time' }, { $toDate: '$$prog.user_start_time' }] } }, 60000] }, 2] }, else: null } },
                                                    completed: true,
                                                    createdAt: '$$prog.createdAt', updatedAt: '$$prog.updatedAt'
                                                }
                                            }
                                        },
                                        else: { completed: false, user_start_time: null, user_end_time: null, duration_minutes: null }
                                    }
                                }
                            }
                        },
                        { $project: { _id: 0, id: '$_id', title: 1, description: 1, teacherName: 1, isLive: 1, isFree: 1, image: 1, link: 1, priority: 1, section: 1, topic: 1, progress: 1, createdAt: 1 /* userProgressInfo, sectionInfo, topicInfo are not projected */ } }
                    ],
                    as: 'classes'
                }
            },
            {
                $addFields: {
                    totalClasses: { $size: '$classes' },
                    completedClasses: { $size: { $filter: { input: '$classes', cond: { $eq: ['$$this.progress.completed', true] } } } }
                }
            },
            {
                $addFields: {
                    progressPercentage: { $cond: { if: { $gt: ['$totalClasses', 0] }, then: { $round: [{ $multiply: [{ $divide: ['$completedClasses', '$totalClasses'] }, 100] }, 2] }, else: 0 } },
                    remainingClasses: { $subtract: ['$totalClasses', '$completedClasses'] }
                }
            },
            { $project: { _id: 0, id: '$_id', title: 1, isLive: 1, isRecorded: 1, isFree: 1, classes: 1, totalClasses: 1, completedClasses: 1, progressPercentage: 1, remainingClasses: 1 } }
        ]);
        if (!result || result.length === 0) {
            res.status(404).json({ state: 404, message: 'Course not found', data: null });
            return;
        }
        const courseData = result[0];
        res.status(200).json({
            state: 200,
            message: 'Course classes with user progress retrieved successfully',
            data: {
                courseId: courseData.id,
                courseTitle: courseData.title, isLive: courseData.isLive,
                isRecorded: courseData.isRecorded, isFree: courseData.isFree, userId: userId,
                classes: courseData.classes || [],
                summary: {
                    totalClasses: courseData.totalClasses || 0,
                    completedClasses: courseData.completedClasses || 0,
                    progressPercentage: courseData.progressPercentage || 0,
                    remainingClasses: courseData.remainingClasses || 0
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching course classes with user progress:', error);
        res.status(500).json({ state: 500, message: error.message || 'Server Error', data: null });
    }
});
exports.getCourseWithUserProgress = getCourseWithUserProgress;
const assignClassesToCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = courseSchemas_1.assignClassesSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ state: 400, message: 'Validation failed', data: validationResult.error.errors });
            return;
        }
        const { courseIds, classIds } = validationResult.data;
        // Verify that all provided courses and classes exist
        const coursesFound = yield Course_1.default.countDocuments({ '_id': { $in: courseIds } });
        if (coursesFound !== courseIds.length) {
            res.status(404).json({ state: 404, message: 'One or more courses not found.', data: null });
            return;
        }
        const classesFound = yield Class_1.default.countDocuments({ '_id': { $in: classIds } });
        if (classesFound !== classIds.length) {
            res.status(404).json({ state: 404, message: 'One or more classes not found.', data: null });
            return;
        }
        // Use $addToSet to add class IDs to the 'classes' array of each course, preventing duplicates.
        yield Course_1.default.updateMany({ '_id': { $in: courseIds } }, { $addToSet: { classes: { $each: classIds } } });
        // Fetch and return the updated courses with populated class details for confirmation
        const updatedCourses = yield Course_1.default.find({ '_id': { $in: courseIds } }).populate('classes').exec();
        res.status(200).json({
            state: 200,
            message: `${classIds.length} class(es) successfully assigned to ${courseIds.length} course(s).`,
            data: updatedCourses
        });
    }
    catch (error) {
        console.error('Error assigning classes to courses:', error);
        res.status(500).json({ state: 500, message: error.message || 'Server Error', data: null });
    }
});
exports.assignClassesToCourses = assignClassesToCourses;
// @desc    Unassign multiple classes from multiple courses
// @route   POST /api/courses/unassign-classes
// @access  Public
const unassignClassesFromCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = courseSchemas_1.unassignClassesSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ state: 400, message: 'Validation failed', data: validationResult.error.errors });
            return;
        }
        const { courseIds, classIds } = validationResult.data;
        const coursesFound = yield Course_1.default.countDocuments({ '_id': { $in: courseIds } });
        if (coursesFound !== courseIds.length) {
            res.status(404).json({ state: 404, message: 'One or more courses not found.', data: null });
            return;
        }
        // Use the $pull operator to remove the specified class IDs from the 'classes' array
        yield Course_1.default.updateMany({ '_id': { $in: courseIds } }, { $pull: { classes: { $in: classIds } } });
        const updatedCourses = yield Course_1.default.find({ '_id': { $in: courseIds } }).populate('classes').exec();
        res.status(200).json({
            state: 200,
            message: `${classIds.length} class(es) successfully unassigned from ${courseIds.length} course(s).`,
            data: updatedCourses
        });
    }
    catch (error) {
        console.error('Error unassigning classes from courses:', error);
        res.status(500).json({ state: 500, message: error.message || 'Server Error', data: null });
    }
});
exports.unassignClassesFromCourses = unassignClassesFromCourses;
// @desc    Get filtered courses (from POST body)
// @route   POST /api/courses/filter
// @access  Public
const postFilteredCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = courseSchemas_1.courseFilterBodySchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                message: 'Invalid filter parameters in request body',
                data: validationResult.error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))
            });
            return;
        }
        const { isLive, isRecorded, isFree } = validationResult.data;
        const query = {};
        if (isLive !== undefined)
            query.isLive = isLive;
        if (isRecorded !== undefined)
            query.isRecorded = isRecorded;
        if (isFree !== undefined)
            query.isFree = isFree;
        const basePipeline = [
            { $match: query },
            { $lookup: { from: 'maincategories', localField: 'mainCategory', foreignField: '_id', as: 'mainCategoryInfo', pipeline: [{ $project: { _id: 0, id: '$_id', mainCategoryName: 1 } }] } },
            { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo', pipeline: [{ $project: { _id: 0, id: '$_id', categoryName: 1 } }] } },
            { $lookup: { from: 'orders', localField: '_id', foreignField: 'course', as: 'orders' } },
            { $addFields: { mainCategoryData: { $arrayElemAt: ['$mainCategoryInfo', 0] }, categoryData: { $arrayElemAt: ['$categoryInfo', 0] }, studentCount: { $size: '$orders' } } },
            {
                $project: {
                    _id: 0, id: '$_id', status: 1, priority: 1, isLive: 1, isRecorded: 1, isFree: 1, banner: 1,
                    title: 1, assignHeader: 1, description: 1,
                    mainCategory: '$mainCategoryData',
                    category: '$categoryData',
                    liveClassesCount: 1, recordedClassesCount: 1, courseInfo: 1,
                    demoVideos: { $map: { input: '$demoVideos', as: 'dv', in: { id: '$$dv._id', title: '$$dv.title', url: '$$dv.url', image: '$$dv.image' } } },
                    batchInfoPdfUrl: 1,
                    facultyDetails: { $cond: { if: '$facultyDetails', then: { _id: 0, id: '$facultyDetails._id', name: '$facultyDetails.name', designation: '$facultyDetails.designation', bio: '$facultyDetails.bio', imageUrl: '$facultyDetails.imageUrl', socialLinks: '$facultyDetails.socialLinks', videoUrl: '$facultyDetails.videoUrl', experience: '$facultyDetails.experience', reach: '$facultyDetails.reach', description: '$facultyDetails.description' }, else: null } },
                    courseHighlights: 1,
                    faq: { $map: { input: '$faq', as: 'f', in: { _id: 0, id: '$$f._id', question: '$$f.question', answer: '$$f.answer' } } },
                    createdAt: 1, updatedAt: 1, studentCount: 1
                    // By not listing mainCategoryInfo, categoryInfo, orders, they are excluded
                }
            }
        ];
        const coursesPipeline = [...basePipeline, { $sort: { title: 1 } }];
        const countPipeline = [...basePipeline, { $count: 'total' }];
        const [courses, countResult] = yield Promise.all([
            Course_1.default.aggregate(coursesPipeline),
            Course_1.default.aggregate(countPipeline)
        ]);
        const totalCourses = countResult.length > 0 ? countResult[0].total : 0;
        res.status(200).json({
            state: 200,
            message: 'Courses filtered successfully',
            data: { courses }
        });
    }
    catch (error) {
        console.error('Error filtering courses via POST body:', error);
        res.status(500).json({ state: 500, message: error.message || 'Server Error', data: null });
    }
});
exports.postFilteredCourses = postFilteredCourses;
