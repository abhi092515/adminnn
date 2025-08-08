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
exports.deletePdf = exports.updatePdf = exports.getPdfById = exports.getPdfs = exports.createPdf = void 0;
const mongoose_1 = require("mongoose"); // Ensure Document is imported from mongoose
const Pdf_1 = __importDefault(require("../models/Pdf"));
const MainCategory_1 = __importDefault(require("../models/MainCategory"));
const Category_1 = __importDefault(require("../models/Category"));
const Section_1 = __importDefault(require("../models/Section"));
const Topic_1 = __importDefault(require("../models/Topic"));
const promises_1 = __importDefault(require("fs/promises"));
const s3Upload_1 = require("../config/s3Upload");
const pdfSchemas_1 = require("../schemas/pdfSchemas"); // Import the new schemas
// Helper function to check if a referenced ID is valid and exists
const validateReference = (model, id, modelName, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: `Invalid ${modelName} ID provided.` });
        return false;
    }
    const exists = yield model.findById(id);
    if (!exists) {
        res.status(404).json({ message: `${modelName} not found.` });
        return false;
    }
    return true;
});
// @desc    Create a new PDF
// @route   POST /api/pdfs
// @access  Public
// export const createPdf = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // 1. Zod validation
//     const validationResult = createPdfSchema.safeParse(req.body);
//     if (!validationResult.success) {
//       res.status(400).json({
//         message: 'Validation failed',
//         errors: validationResult.error.errors.map(err => ({
//           path: err.path.join('.'),
//           message: err.message
//         }))
//       });
//       return;
//     }
//     const validatedData = validationResult.data; // Use validated data
//     // 2. Validate relationships
//     if (!(await validateReference(MainCategory, validatedData.mainCategory, 'Main Category', res))) return;
//     if (!(await validateReference(Category, validatedData.category, 'Category', res))) return;
//     if (!(await validateReference(Section, validatedData.section, 'Section', res))) return;
//     if (!(await validateReference(Topic, validatedData.topic, 'Topic', res))) return;
//     // 3. Check for existing PDF title (assuming title should be unique)
//     const existingPdf = await Pdf.findOne({ title: validatedData.title });
//     if (existingPdf) {
//       res.status(400).json({ message: 'A PDF with this title already exists.' });
//       return;
//     }
//     const newPdf: IPdf = new Pdf(validatedData); // Create PDF directly from validated data
//     const createdPdf = await newPdf.save();
//     // Populate all referenced fields for the response, selecting _id and their respective name/title fields
//     const populatedPdf = await Pdf.findById(createdPdf._id)
//       .populate('mainCategory', '_id mainCategoryName')
//       .populate('category', '_id categoryName')
//       .populate('section', '_id sectionName')
//       .populate('topic', '_id topicName');
//     res.status(201).json(populatedPdf);
//   } catch (error: any) {
//     if (error.code === 11000) { // Duplicate key error from MongoDB unique index
//       res.status(400).json({ message: 'Duplicate key error: PDF Title must be unique.' });
//       return;
//     }
//     res.status(500).json({ message: error.message || 'Server Error' });
//   }
// };
// In src/controllers/pdfController.ts
const createPdf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        // ✅ 1. Check for the required file in req.files BEFORE doing anything else
        const files = req.files;
        if (!files || !((_a = files.uploadPdf) === null || _a === void 0 ? void 0 : _a[0])) {
            res.status(400).json({ message: 'Validation failed', errors: [{ path: ['uploadPdf'], message: 'A PDF file is required.' }] });
            return;
        }
        // 2. Zod validation for text fields
        const validationResult = pdfSchemas_1.createPdfSchema.safeParse(req.body);
        if (!validationResult.success) {
            // If validation fails, clean up any uploaded files
            yield promises_1.default.unlink(files.uploadPdf[0].path);
            if ((_b = files.image) === null || _b === void 0 ? void 0 : _b[0]) {
                yield promises_1.default.unlink(files.image[0].path);
            }
            res.status(400).json({ message: 'Validation failed', errors: validationResult.error.errors });
            return;
        }
        const validatedData = validationResult.data;
        // 3. Handle file uploads to S3
        let imageUrl = undefined;
        // Upload required PDF
        const pdfFile = files.uploadPdf[0];
        const pdfBuffer = yield promises_1.default.readFile(pdfFile.path);
        const pdfKey = `pdfs/files/${Date.now()}-${pdfFile.originalname.replace(/\s+/g, '_')}`;
        const pdfUrl = yield (0, s3Upload_1.uploadFileToS3)(pdfBuffer, pdfKey, pdfFile.mimetype);
        yield promises_1.default.unlink(pdfFile.path); // Clean up temp file
        // Upload optional image
        if ((_c = files.image) === null || _c === void 0 ? void 0 : _c[0]) {
            const imageFile = files.image[0];
            const imageBuffer = yield promises_1.default.readFile(imageFile.path);
            const imageKey = `pdfs/images/${Date.now()}-${imageFile.originalname.replace(/\s+/g, '_')}`;
            imageUrl = yield (0, s3Upload_1.uploadFileToS3)(imageBuffer, imageKey, imageFile.mimetype);
            yield promises_1.default.unlink(imageFile.path);
        }
        // 4. Combine text data and file URLs and save to database
        const newPdf = new Pdf_1.default(Object.assign(Object.assign({}, validatedData), { image: imageUrl, uploadPdf: pdfUrl }));
        let createdPdf = yield newPdf.save();
        // ✅ 5. More efficient population
        createdPdf = yield createdPdf.populate([
            { path: 'mainCategory', select: '_id mainCategoryName' },
            { path: 'category', select: ' _id categoryName' },
            { path: 'section', select: '_id sectionName' },
            { path: 'topic', select: '_id topicName' }
        ]);
        res.status(201).json(createdPdf);
    }
    catch (error) {
        // Error handling with file cleanup
        if (req.files) {
            const files = req.files;
            for (const field in files) {
                if ((_e = (_d = files[field]) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.path) {
                    yield promises_1.default.unlink(files[field][0].path).catch(err => console.error("Cleanup failed:", err));
                }
            }
        }
        console.error('Error creating PDF:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.createPdf = createPdf;
// @desc    Get all PDFs (no change needed here for Zod)
// @route   GET /api/pdfs
// @access  Public
const getPdfs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pdfs = yield Pdf_1.default.find({})
            .populate('mainCategory', '_id mainCategoryName')
            .populate('category', '_id categoryName')
            .populate('section', '_id sectionName')
            .populate('topic', '_id topicName');
        if (pdfs.length > 0) {
            // If data is found, send 200 OK with the PDFs
            res.status(200).json(pdfs);
        }
        else {
            // If no data is found, send 201 Created with an empty array.
            // As discussed for GET requests on collections with no results,
            // 200 OK with an empty array is the more standard and recommended practice.
            res.status(201).json([]);
        }
    }
    catch (error) {
        // If an error occurs during the database query, send 500 Internal Server Error
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.getPdfs = getPdfs;
// @desc    Get a single PDF by ID (no change needed here for Zod)
// @route   GET /api/pdfs/:id
// @access  Public
const getPdfById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pdfItem = yield Pdf_1.default.findById(req.params.id)
            .populate('mainCategory', '_id mainCategoryName')
            .populate('category', '_id categoryName')
            .populate('section', '_id sectionName')
            .populate('topic', '_id topicName');
        if (pdfItem) {
            // If the PDF is found, send 200 OK
            res.status(200).json(pdfItem);
        }
        else {
            // If the PDF is NOT found, send 404 Not Found.
            // This is the correct HTTP status code for a specific resource not found by ID.
            res.status(404).json({ message: 'PDF not found' });
        }
    }
    catch (error) {
        // If there's a server error (e.g., database connection issue, invalid ID format)
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.getPdfById = getPdfById;
// @desc    Update a PDF
// @route   PUT /api/pdfs/:id
// @access  Public
const updatePdf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Zod validation for update
        const validationResult = pdfSchemas_1.updatePdfSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                message: 'Validation failed',
                errors: validationResult.error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            });
            return;
        }
        const updates = validationResult.data; // Use validated data for updates
        // Explicitly type pdfItem to help TypeScript
        const pdfItem = yield Pdf_1.default.findById(req.params.id);
        if (pdfItem) {
            // Validate relationships if they are being updated
            if (updates.mainCategory && !(yield validateReference(MainCategory_1.default, updates.mainCategory, 'Main Category', res)))
                return;
            if (updates.category && !(yield validateReference(Category_1.default, updates.category, 'Category', res)))
                return;
            if (updates.section && !(yield validateReference(Section_1.default, updates.section, 'Section', res)))
                return;
            if (updates.topic && !(yield validateReference(Topic_1.default, updates.topic, 'Topic', res)))
                return;
            // Check for duplicate title if it's being changed
            if (updates.title && updates.title !== pdfItem.title) {
                const existingPdfWithNewTitle = yield Pdf_1.default.findOne({ title: updates.title });
                if (existingPdfWithNewTitle) {
                    if (!pdfItem._id.equals(existingPdfWithNewTitle._id)) {
                        res.status(400).json({ message: 'A PDF with this title already exists.' });
                        return;
                    }
                }
            }
            // Apply updates from validated data. Object.assign handles undefined fields from Zod's .partial()
            Object.assign(pdfItem, updates);
            const updatedPdf = yield pdfItem.save();
            const populatedPdf = yield Pdf_1.default.findById(updatedPdf._id)
                .populate('mainCategory', '_id mainCategoryName')
                .populate('category', '_id categoryName')
                .populate('section', '_id sectionName')
                .populate('topic', '_id topicName');
            res.status(200).json(populatedPdf);
        }
        else {
            res.status(404).json({ message: 'PDF not found' });
        }
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Duplicate key error: PDF Title must be unique.' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.updatePdf = updatePdf;
// @desc    Delete a PDF (no change needed here for Zod)
// @route   DELETE /api/pdfs/:id
// @access  Public
const deletePdf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pdfItem = yield Pdf_1.default.findById(req.params.id);
        if (pdfItem) {
            yield Pdf_1.default.deleteOne({ _id: pdfItem._id });
            res.status(200).json({ message: 'PDF removed' });
        }
        else {
            res.status(404).json({ message: 'PDF not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.deletePdf = deletePdf;
