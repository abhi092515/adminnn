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
exports.deleteMainCategory = exports.updateMainCategory = exports.getMainCategoryById = exports.getMainCategories = exports.createMainCategory = void 0;
const MainCategory_1 = __importDefault(require("../models/MainCategory"));
const mainCategorySchemas_1 = require("../schemas/mainCategorySchemas");
// S3 upload and delete imports from the consolidated file
const s3Upload_1 = require("../config/s3Upload");
const s3Upload_2 = require("../config/s3Upload");
const fs_1 = __importDefault(require("fs")); // For file system operations (deleting local files)
const multer_1 = __importDefault(require("multer")); // Import Multer to catch Multer errors
// @desc    Create a new main category
// @route   POST /api/main-categories
// @access  Public
const createMainCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Store the path to the locally saved file by Multer for cleanup in finally block
    let localFilePath;
    try {
        // 1. Zod validation for text fields in req.body
        const validationResult = mainCategorySchemas_1.createMainCategorySchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                msg: 'Validation failed',
                errors: validationResult.error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                })),
                data: null // Changed from [] to null for consistency with other controllers
            });
            return;
        }
        const validatedData = validationResult.data;
        // 2. Check for existing main category name
        const existingCategory = yield MainCategory_1.default.findOne({ mainCategoryName: validatedData.mainCategoryName });
        if (existingCategory) {
            res.status(400).json({
                state: 400,
                msg: 'Main Category Name already exists.',
                data: null // Changed from [] to null
            });
            return;
        }
        let s3ImageUrl; // Variable to store the S3 URL
        // 3. Handle file upload if a file was provided by Multer
        if (req.file) {
            localFilePath = req.file.path; // Store the local file path for cleanup
            try {
                const fileBuffer = fs_1.default.readFileSync(localFilePath); // Read the file into a buffer
                const { originalname, mimetype } = req.file;
                // Generate a unique filename for S3, nested under 'main-categories/' folder
                // Replace spaces with underscores for cleaner S3 keys
                const fileNameForS3 = `main-categories/${Date.now()}-${originalname.replace(/\s/g, '_')}`;
                s3ImageUrl = yield (0, s3Upload_1.uploadFileToS3)(fileBuffer, fileNameForS3, mimetype);
                // console.log(`Main Category image uploaded to S3: ${s3ImageUrl}`); // Keep for debugging if needed
            }
            catch (uploadError) {
                console.error('Error uploading main category image to S3:', uploadError);
                res.status(500).json({
                    state: 500,
                    msg: 'Failed to upload main category image.',
                    data: null // Changed from [] to null
                });
                return; // Stop execution if S3 upload fails
            }
        }
        // 4. Create new main category instance, assigning the S3 URL to the 'mainCategoryImage' field
        const newCategory = new MainCategory_1.default(Object.assign(Object.assign({}, validatedData), { mainCategoryImage: s3ImageUrl }));
        const createdCategory = yield newCategory.save();
        // Mongoose's toJSON/toObject transform will convert _id to id
        res.status(200).json({
            state: 200,
            msg: 'Main Category created successfully',
            data: createdCategory // This will now have 'id' instead of '_id' due to schema transform
        });
    }
    catch (error) {
        console.error('Error creating main category:', error); // Log the full error
        if (error instanceof multer_1.default.MulterError) {
            // Consistent error message and status code with categoryController
            res.status(400).json({
                state: 400,
                msg: `File upload error: ${error.message}`,
                data: null
            });
            return;
        }
        if (error.code === 11000) {
            res.status(400).json({
                state: 400,
                msg: 'Duplicate key error: Main Category Name already exists.', // More specific message
                data: null // Changed from [] to null
            });
            return;
        }
        res.status(500).json({
            state: 500,
            msg: error.message || 'Server Error',
            data: null // Changed from [] to null
        });
    }
    finally {
        // IMPORTANT: Clean up the locally saved file by Multer regardless of success or failure
        if (localFilePath && fs_1.default.existsSync(localFilePath)) {
            fs_1.default.unlink(localFilePath, (err) => {
                if (err)
                    console.error('Error deleting local main category image file:', err);
            });
        }
    }
});
exports.createMainCategory = createMainCategory;
// @desc    Get all main categories
// @route   GET /api/main-categories
// @access  Public
const getMainCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // The .toJSON() transform on the model will apply to each document in the array
        const categories = yield MainCategory_1.default.find({});
        if (categories.length > 0) {
            res.status(200).json({
                state: 200,
                msg: 'success',
                data: categories,
            });
        }
        else {
            // Consistent response status and data type with categoryController
            res.status(200).json({
                state: 200,
                msg: 'No data found',
                data: [],
            });
        }
    }
    catch (error) {
        console.error('Error fetching main categories:', error);
        res.status(500).json({
            state: 500,
            msg: error.message || 'Server Error',
            data: [],
        });
    }
});
exports.getMainCategories = getMainCategories;
// @desc    Get a single main category by ID
// @route   GET /api/main-categories/:id
// @access  Public
const getMainCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield MainCategory_1.default.findById(req.params.id);
        if (category) {
            res.status(200).json({
                state: 200,
                msg: 'success',
                data: category
            });
        }
        else {
            // Consistent response status and data type with categoryController
            res.status(404).json({
                state: 404,
                msg: 'Main Category not found',
                data: null,
            });
        }
    }
    catch (error) {
        console.error('Error fetching main category by ID:', error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            res.status(400).json({
                state: 400,
                msg: 'Invalid Main Category ID format.',
                data: null
            });
        }
        else {
            res.status(500).json({
                state: 500,
                msg: error.message || 'Server Error',
                data: null // Changed from [] to null
            });
        }
    }
});
exports.getMainCategoryById = getMainCategoryById;
// @desc    Update a main category
// @route   PUT /api/main-categories/:id
// @access  Public
const updateMainCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let oldImageUrl; // To store the old image URL for potential deletion
    let localFilePath; // To store the path to the locally saved file for cleanup
    try {
        const validationResult = mainCategorySchemas_1.updateMainCategorySchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                msg: 'Validation failed',
                errors: validationResult.error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                })),
                data: null // Changed from [] to null
            });
            return;
        }
        const updates = validationResult.data;
        const category = yield MainCategory_1.default.findById(req.params.id);
        if (!category) {
            // Consistent response status and data type with categoryController
            res.status(404).json({
                state: 404,
                msg: 'Main Category not found',
                data: null
            });
            return;
        }
        // Store the old image URL before potential update
        oldImageUrl = category.mainCategoryImage;
        // Check for duplicate mainCategoryName if it's being changed
        if (updates.mainCategoryName !== undefined && updates.mainCategoryName !== category.mainCategoryName) { // Check for undefined to prevent unnecessary findOne
            const existingCategoryWithNewName = yield MainCategory_1.default.findOne({ mainCategoryName: updates.mainCategoryName });
            if (existingCategoryWithNewName) {
                const currentCategoryId = category._id;
                const foundCategoryId = existingCategoryWithNewName._id;
                if (!currentCategoryId.equals(foundCategoryId)) {
                    res.status(400).json({
                        state: 400,
                        msg: 'Duplicate key error: Main Category Name already exists.', // More specific message
                        data: null // Changed from [] to null
                    });
                    return;
                }
            }
        }
        // Handle file upload if a NEW file was provided by Multer
        if (req.file) {
            localFilePath = req.file.path; // Store local file path for cleanup
            try {
                const fileBuffer = fs_1.default.readFileSync(localFilePath);
                const { originalname, mimetype } = req.file;
                const fileNameForS3 = `main-categories/${Date.now()}-${originalname.replace(/\s/g, '_')}`;
                const s3ImageUrl = yield (0, s3Upload_1.uploadFileToS3)(fileBuffer, fileNameForS3, mimetype);
                // console.log(`New main category image uploaded to S3: ${s3ImageUrl}`);
                category.mainCategoryImage = s3ImageUrl; // Update the image URL in the document
                // Delete the old image from S3 if it exists and a new one was uploaded
                if (oldImageUrl) {
                    try {
                        const keyToDelete = (0, s3Upload_2.extractKeyFromS3Url)(oldImageUrl);
                        if (keyToDelete) {
                            yield (0, s3Upload_2.deleteFileFromS3)(keyToDelete);
                            // console.log(`Old S3 image deleted: ${keyToDelete}`);
                        }
                    }
                    catch (deleteError) {
                        console.warn('Warning: Could not delete old S3 image during update:', deleteError);
                        // Don't block the update if old image deletion fails
                    }
                }
            }
            catch (uploadError) {
                console.error('Error uploading new main category image to S3:', uploadError);
                res.status(500).json({
                    state: 500,
                    msg: 'Failed to upload new main category image.',
                    data: null // Changed from [] to null
                });
                return;
            }
        }
        else if ('mainCategoryImage' in updates && (updates.mainCategoryImage === null || updates.mainCategoryImage === '')) {
            // If `mainCategoryImage` is explicitly set to `null` or empty string in the body
            // AND no new file is uploaded, it means the user wants to clear the image.
            category.mainCategoryImage = undefined; // Set to undefined to remove the field from MongoDB
            // Delete the old image from S3 if it exists and is being cleared
            if (oldImageUrl) {
                try {
                    const keyToDelete = (0, s3Upload_2.extractKeyFromS3Url)(oldImageUrl);
                    if (keyToDelete) {
                        yield (0, s3Upload_2.deleteFileFromS3)(keyToDelete);
                        // console.log(`S3 image cleared and deleted: ${keyToDelete}`);
                    }
                }
                catch (deleteError) {
                    console.warn('Warning: Could not delete old S3 image upon clear:', deleteError);
                }
            }
        }
        // Apply other updates from the validated data.
        // Exclude 'mainCategoryImage' from Object.assign if it was handled separately above.
        const updatesToApply = Object.assign({}, updates);
        if (req.file || ('mainCategoryImage' in updates && (updates.mainCategoryImage === null || updates.mainCategoryImage === ''))) {
            delete updatesToApply.mainCategoryImage;
        }
        Object.assign(category, updatesToApply);
        const updatedCategory = yield category.save();
        res.status(200).json({
            state: 200,
            msg: 'Main Category updated successfully',
            data: updatedCategory
        });
    }
    catch (error) {
        console.error('Error updating main category:', error);
        if (error instanceof multer_1.default.MulterError) {
            // Consistent error message and status code with categoryController
            res.status(400).json({
                state: 400,
                msg: `File upload error: ${error.message}`,
                data: null
            });
            return;
        }
        if (error.code === 11000) {
            res.status(400).json({
                state: 400,
                msg: 'Duplicate key error: Main Category Name already exists.',
                data: null // Changed from [] to null
            });
            return;
        }
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            res.status(400).json({
                state: 400,
                msg: 'Invalid Main Category ID format.',
                data: null // Changed from [] to null
            });
        }
        else {
            res.status(500).json({
                state: 500,
                msg: error.message || 'Server Error',
                data: null // Changed from [] to null
            });
        }
    }
    finally {
        // IMPORTANT: Clean up the locally saved file by Multer regardless of success or failure
        if (localFilePath && fs_1.default.existsSync(localFilePath)) {
            fs_1.default.unlink(localFilePath, (err) => {
                if (err)
                    console.error('Error deleting local main category image file:', err);
            });
        }
    }
});
exports.updateMainCategory = updateMainCategory;
// @desc    Delete a main category
// @route   DELETE /api/main-categories/:id
// @access  Public
const deleteMainCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield MainCategory_1.default.findById(req.params.id);
        if (category) {
            // If an image exists for this main category, delete it from S3
            if (category.mainCategoryImage) {
                try {
                    const keyToDelete = (0, s3Upload_2.extractKeyFromS3Url)(category.mainCategoryImage);
                    if (keyToDelete) { // Ensure a valid key was extracted
                        yield (0, s3Upload_2.deleteFileFromS3)(keyToDelete);
                        // console.log(`S3 image deleted during main category deletion: ${keyToDelete}`);
                    }
                }
                catch (deleteError) {
                    console.warn('Warning: Could not delete S3 image during main category deletion:', deleteError);
                    // Continue with main category deletion even if S3 delete fails
                }
            }
            yield MainCategory_1.default.deleteOne({ _id: category._id });
            res.status(200).json({
                state: 200,
                msg: 'Main Category removed successfully',
                data: null // Changed from [] to null
            });
        }
        else {
            // Consistent response status and data type with categoryController
            res.status(404).json({
                state: 404,
                msg: 'Main Category not found',
                data: null
            });
        }
    }
    catch (error) {
        console.error('Error deleting main category:', error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            res.status(400).json({
                state: 400,
                msg: 'Invalid Main Category ID format.',
                data: null
            });
        }
        else {
            res.status(500).json({
                state: 500,
                msg: error.message || 'Server Error',
                data: null // Changed from [] to null
            });
        }
    }
});
exports.deleteMainCategory = deleteMainCategory;
