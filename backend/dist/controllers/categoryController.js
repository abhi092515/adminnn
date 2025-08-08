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
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getCategories = exports.createCategory = void 0;
const mongoose_1 = require("mongoose");
const Category_1 = __importDefault(require("../models/Category"));
const MainCategory_1 = __importDefault(require("../models/MainCategory"));
const categorySchemas_1 = require("../schemas/categorySchemas");
const s3Upload_1 = require("../config/s3Upload");
const s3Upload_2 = require("../config/s3Upload");
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
// Helper function to check if a referenced ID is valid and exists
const validateReference = (model, id, modelName, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        res.status(400).json({
            state: 400,
            msg: `Invalid ${modelName} ID format.`,
            data: null
        });
        return false;
    }
    const exists = yield model.findById(id);
    if (!exists) {
        res.status(201).json({
            state: 201,
            msg: `${modelName} not found.`,
            data: null
        });
        return false;
    }
    return true;
});
// @desc    Create a new Category
// @route   POST /api/categories
// @access  Public
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Store the path to the locally saved file by Multer for cleanup in finally block
    let localFilePath;
    try {
        // 1. Validate request body with Zod
        // Note: req.body will contain text fields, req.file will contain file details
        const validationResult = categorySchemas_1.createCategorySchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                msg: 'Validation failed',
                errors: validationResult.error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                })),
                data: null
            });
            return;
        }
        const validatedData = validationResult.data;
        // 2. Validate existence of linked MainCategory
        if (!(yield validateReference(MainCategory_1.default, validatedData.mainCategory, 'Main Category', res))) {
            return;
        }
        // Check if a category with this name already exists under this mainCategory
        const existingCategory = yield Category_1.default.findOne({
            categoryName: validatedData.categoryName,
            mainCategory: validatedData.mainCategory
        });
        if (existingCategory) {
            res.status(400).json({
                state: 400,
                msg: 'Category with this name already exists under this Main Category.',
                data: null
            });
            return;
        }
        let s3ImageUrl;
        // 3. Handle file upload if a file was provided by Multer
        if (req.file) {
            localFilePath = req.file.path; // Store the local file path for cleanup
            try {
                const fileBuffer = fs_1.default.readFileSync(localFilePath); // Read the file into a buffer
                const { originalname, mimetype } = req.file;
                // Generate a unique filename for S3, nested under 'categories/' folder
                // Replace spaces with underscores for cleaner S3 keys
                const fileNameForS3 = `categories/${Date.now()}-${originalname.replace(/\s/g, '_')}`;
                s3ImageUrl = yield (0, s3Upload_1.uploadFileToS3)(fileBuffer, fileNameForS3, mimetype);
            }
            catch (uploadError) {
                console.error('Error uploading category image to S3:', uploadError);
                res.status(500).json({
                    state: 500,
                    msg: 'Failed to upload category image.',
                    data: null
                });
                return; // Stop execution if S3 upload fails
            }
        }
        const newCategory = new Category_1.default(Object.assign(Object.assign({}, validatedData), { categoryImage: s3ImageUrl }));
        const createdCategory = yield newCategory.save();
        // Populate the mainCategory for the response
        const populatedCategory = yield Category_1.default.findById(createdCategory._id).populate('mainCategory', '_id mainCategoryName');
        res.status(200).json({
            state: 200,
            msg: 'Category created successfully',
            data: populatedCategory
        });
    }
    catch (error) {
        console.error('Error creating category:', error);
        if (error instanceof multer_1.default.MulterError) {
            // Multer errors (e.g., file size limit, file type filter if implemented)
            res.status(400).json({
                state: 400,
                msg: `File upload error: ${error.message}`,
                data: null
            });
            return;
        }
        if (error.code === 11000) { // MongoDB duplicate key error
            res.status(400).json({
                state: 400,
                msg: 'Duplicate key error: Category name must be unique within its Main Category.',
                data: null
            });
            return;
        }
        // Generic server error
        res.status(500).json({
            state: 500,
            msg: error.message || 'Server Error',
            data: null
        });
    }
    finally {
        // IMPORTANT: Clean up the locally saved file by Multer regardless of success or failure
        if (localFilePath && fs_1.default.existsSync(localFilePath)) {
            fs_1.default.unlink(localFilePath, (err) => {
                if (err)
                    console.error('Error deleting local category image file:', err);
            });
        }
    }
});
exports.createCategory = createCategory;
// @desc    Get all Categories
// @route   GET /api/categories
// @access  Public
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield Category_1.default.find({}).populate('mainCategory', '_id mainCategoryName');
        if (categories.length > 0) {
            res.status(200).json({
                state: 200,
                msg: 'success',
                data: categories,
            });
        }
        else {
            res.status(201).json({
                state: 201,
                msg: 'No categories found',
                data: [],
            });
        }
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            state: 500,
            msg: error.message || 'Server Error',
            data: [],
        });
    }
});
exports.getCategories = getCategories;
// @desc    Get a single Category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield Category_1.default.findById(req.params.id).populate('mainCategory', '_id mainCategoryName');
        if (category) {
            res.status(200).json({
                state: 200,
                msg: 'success',
                data: category,
            });
        }
        else {
            res.status(201).json({
                state: 201,
                msg: 'Category not found',
                data: null,
            });
        }
    }
    catch (error) {
        console.error('Error fetching category by ID:', error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            res.status(400).json({
                state: 400,
                msg: 'Invalid Category ID format.',
                data: null
            });
        }
        else {
            res.status(500).json({
                state: 500,
                msg: error.message || 'Server Error',
                data: null,
            });
        }
    }
});
exports.getCategoryById = getCategoryById;
// @desc    Update a Category
// @route   PUT /api/categories/:id
// @access  Public
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let oldImageUrl; // To store the old image URL for potential S3 deletion
    let localFilePath; // To store the path to the locally saved file for cleanup
    try {
        // 1. Validate request body with Zod
        const validationResult = categorySchemas_1.updateCategorySchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                msg: 'Validation failed',
                errors: validationResult.error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                })),
                data: null
            });
            return;
        }
        const updates = validationResult.data;
        const category = yield Category_1.default.findById(req.params.id);
        if (category) {
            // Store the old image URL before potential update or deletion
            oldImageUrl = category.categoryImage;
            // Validate existence of new MainCategory if it's being updated
            if (updates.mainCategory && !(yield validateReference(MainCategory_1.default, updates.mainCategory, 'Main Category', res))) {
                return;
            }
            // Check for duplicate name under the current or new mainCategory
            if (updates.categoryName !== undefined || updates.mainCategory !== undefined) {
                const targetMainCategory = updates.mainCategory || category.mainCategory;
                const targetCategoryName = updates.categoryName || category.categoryName;
                const existingCategoryWithNewDetails = yield Category_1.default.findOne({
                    categoryName: targetCategoryName,
                    mainCategory: targetMainCategory
                });
                if (existingCategoryWithNewDetails) {
                    const existingId = existingCategoryWithNewDetails._id;
                    const currentId = category._id;
                    if (!existingId.equals(currentId)) {
                        res.status(400).json({
                            state: 400,
                            msg: 'Category with this name already exists under the specified Main Category.',
                            data: null
                        });
                        return;
                    }
                }
            }
            let s3ImageUrl = category.categoryImage; // Default to current image URL
            // Handle file upload if a new file was provided by Multer
            if (req.file) {
                localFilePath = req.file.path; // Store local file path for cleanup
                try {
                    const fileBuffer = fs_1.default.readFileSync(localFilePath);
                    const { originalname, mimetype } = req.file;
                    const fileNameForS3 = `categories/${Date.now()}-${originalname.replace(/\s/g, '_')}`;
                    s3ImageUrl = yield (0, s3Upload_1.uploadFileToS3)(fileBuffer, fileNameForS3, mimetype);
                    // If a new image was uploaded and there was an old image, delete the old one from S3
                    if (oldImageUrl) {
                        try {
                            const keyToDelete = (0, s3Upload_2.extractKeyFromS3Url)(oldImageUrl);
                            if (keyToDelete) {
                                yield (0, s3Upload_2.deleteFileFromS3)(keyToDelete);
                            }
                        }
                        catch (deleteError) {
                            console.warn('Warning: Could not delete old S3 image upon new upload:', deleteError);
                            // Don't block the update if old image deletion fails
                        }
                    }
                }
                catch (uploadError) {
                    console.error('Error uploading new category image to S3:', uploadError);
                    res.status(500).json({
                        state: 500,
                        msg: 'Failed to upload new category image.',
                        data: null
                    });
                    return;
                }
                category.categoryImage = s3ImageUrl; // Update the image URL in the document
            }
            else if ('categoryImage' in updates && (updates.categoryImage === null || updates.categoryImage === '')) {
                // If `categoryImage` is explicitly set to `null` or empty string in the body
                // AND no new file is uploaded, it means the user wants to clear the image.
                category.categoryImage = undefined; // Set to undefined to remove the field or null based on your schema
                // If the image is being cleared, delete the old one from S3.
                if (oldImageUrl) {
                    try {
                        const keyToDelete = (0, s3Upload_2.extractKeyFromS3Url)(oldImageUrl);
                        if (keyToDelete) {
                            yield (0, s3Upload_2.deleteFileFromS3)(keyToDelete);
                        }
                    }
                    catch (deleteError) {
                        console.warn('Warning: Could not delete old S3 image upon clear:', deleteError);
                    }
                }
            }
            // If req.file is not present and updates.categoryImage is not null/empty string,
            // it means the image field was not touched by this request, or its value
            // is an existing URL that should be preserved. Object.assign handles this for other fields,
            // and category.categoryImage retains its value from `let s3ImageUrl = category.categoryImage;`.
            // Apply other updates from the validated data (excluding categoryImage if already handled)
            const updatesToApply = Object.assign({}, updates);
            // Delete categoryImage from updatesToApply if it was handled by file upload/clear logic
            // This prevents overwriting the S3 URL with a potentially incorrect value from req.body
            if (req.file || ('categoryImage' in updates && (updates.categoryImage === null || updates.categoryImage === ''))) {
                delete updatesToApply.categoryImage;
            }
            Object.assign(category, updatesToApply);
            const updatedCategory = yield category.save();
            // Populate the mainCategory for the response
            const populatedCategory = yield Category_1.default.findById(updatedCategory._id).populate('mainCategory', '_id mainCategoryName');
            res.status(200).json({
                state: 200,
                msg: 'Category updated successfully',
                data: populatedCategory
            });
        }
        else {
            res.status(201).json({
                state: 201,
                msg: 'Category not found.',
                data: null
            });
        }
    }
    catch (error) {
        console.error('Error updating category:', error);
        if (error instanceof multer_1.default.MulterError) {
            res.status(400).json({
                state: 400,
                msg: `File upload error: ${error.message}`,
                data: null
            });
            return;
        }
        if (error.code === 11000) { // MongoDB duplicate key error
            res.status(400).json({
                state: 400,
                msg: 'Duplicate key error.', // Consider making this message more specific
                data: null
            });
            return;
        }
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            res.status(400).json({
                state: 400,
                msg: 'Invalid Category ID format.',
                data: null
            });
        }
        else {
            res.status(500).json({
                state: 500,
                msg: error.message || 'Server Error',
                data: null
            });
        }
    }
    finally {
        // IMPORTANT: Clean up the locally saved file by Multer regardless of success or failure
        if (localFilePath && fs_1.default.existsSync(localFilePath)) {
            fs_1.default.unlink(localFilePath, (err) => {
                if (err)
                    console.error('Error deleting local category image file:', err);
            });
        }
    }
});
exports.updateCategory = updateCategory;
// @desc    Delete a Category
// @route   DELETE /api/categories/:id
// @access  Public
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield Category_1.default.findById(req.params.id);
        if (category) {
            if (category.categoryImage) {
                try {
                    const keyToDelete = (0, s3Upload_2.extractKeyFromS3Url)(category.categoryImage);
                    if (keyToDelete) {
                        yield (0, s3Upload_2.deleteFileFromS3)(keyToDelete);
                    }
                }
                catch (deleteError) {
                    console.warn('Warning: Could not delete S3 image during category deletion:', deleteError);
                }
            }
            yield Category_1.default.deleteOne({ _id: category._id });
            res.status(200).json({
                state: 200,
                msg: 'Category removed successfully',
                data: null
            });
        }
        else {
            res.status(201).json({
                state: 201,
                msg: 'Category not found.',
                data: null
            });
        }
    }
    catch (error) {
        console.error('Error deleting category:', error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            res.status(400).json({
                state: 400,
                msg: 'Invalid Category ID format.',
                data: null
            });
        }
        else {
            res.status(500).json({
                state: 500,
                msg: error.message || 'Server Error',
                data: null
            });
        }
    }
});
exports.deleteCategory = deleteCategory;
