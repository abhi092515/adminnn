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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEbook = exports.updateEbook = exports.getEbookById = exports.getAllEbooks = exports.createEbook = void 0;
const ebookModel_1 = __importDefault(require("../models/ebookModel")); // Use the Ebook model
const ebookSchemas_1 = require("../schemas/ebookSchemas"); // Use the Ebook schemas
const s3Upload_1 = require("../config/s3Upload");
const MainCategory_1 = __importDefault(require("../models/MainCategory"));
const Category_1 = __importDefault(require("../models/Category"));
// Helper function to handle a single file upload to S3
const handleS3Upload = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const uniqueFileName = `ebooks/${Date.now()}-${file.originalname}`; // Changed folder to 'ebooks'
    return yield (0, s3Upload_1.uploadFileToS3)(file.buffer, uniqueFileName, file.mimetype);
});
// --- CREATE E-BOOK ---
const createEbook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = ebookSchemas_1.createEbookSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ state: 400, msg: "Validation failed", errors: validationResult.error.errors });
            return;
        }
        const _a = validationResult.data, { mainCategory, category } = _a, ebookData = __rest(_a, ["mainCategory", "category"]);
        const mainCategoryExists = yield MainCategory_1.default.findById(mainCategory);
        if (!mainCategoryExists) {
            res.status(404).json({ state: 404, msg: "MainCategory not found." });
            return;
        }
        const categoryExists = yield Category_1.default.findById(category);
        if (!categoryExists) {
            res.status(404).json({ state: 404, msg: "Category not found." });
            return;
        }
        const newEbook = new ebookModel_1.default(Object.assign(Object.assign({}, ebookData), { mainCategory, category }));
        if (req.files) {
            const files = req.files;
            const uploadPromises = [];
            const processFile = (fieldName, ebookField) => {
                var _a;
                if ((_a = files[fieldName]) === null || _a === void 0 ? void 0 : _a[0]) {
                    uploadPromises.push(handleS3Upload(files[fieldName][0]).then(url => {
                        newEbook[ebookField] = url;
                    }));
                }
            };
            processFile('image1', 'image1');
            processFile('image2', 'image2');
            processFile('image3', 'image3');
            processFile('image4', 'image4');
            processFile('samplePdf', 'samplePdf');
            processFile('bookPdf', 'bookPdf'); // ✨ Handle the new bookPdf file
            yield Promise.all(uploadPromises);
        }
        const savedEbook = yield newEbook.save();
        res.status(201).json({
            state: 201,
            msg: "E-book created successfully",
            data: savedEbook
        });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: "Failed to create e-book.", error: error.message });
    }
});
exports.createEbook = createEbook;
// --- GET ALL E-BOOKS ---
const getAllEbooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ebooks = yield ebookModel_1.default.find({})
            .populate('mainCategory', 'mainCategoryName')
            .populate('category', 'categoryName');
        res.status(200).json({
            state: 200,
            msg: "E-books retrieved successfully",
            data: ebooks
        });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: error.message });
    }
});
exports.getAllEbooks = getAllEbooks;
// --- GET E-BOOK BY ID ---
const getEbookById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ebook = yield ebookModel_1.default.findById(req.params.id)
            .populate('mainCategory', 'mainCategoryName')
            .populate('category', 'categoryName');
        if (!ebook) {
            res.status(404).json({ state: 404, msg: 'E-book not found' });
            return;
        }
        res.status(200).json({
            state: 200,
            msg: "E-book retrieved successfully",
            data: ebook
        });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: error.message });
    }
});
exports.getEbookById = getEbookById;
// --- UPDATE E-BOOK ---
const updateEbook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ebook = yield ebookModel_1.default.findById(req.params.id);
        if (!ebook) {
            res.status(404).json({ state: 404, msg: 'E-book not found' });
            return;
        }
        const validationResult = ebookSchemas_1.updateEbookSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ state: 400, msg: "Validation failed", errors: validationResult.error.errors });
            return;
        }
        Object.assign(ebook, validationResult.data);
        if (req.files) {
            const files = req.files;
            const uploadPromises = [];
            const processFileUpdate = (fieldName, ebookField) => {
                var _a;
                if ((_a = files[fieldName]) === null || _a === void 0 ? void 0 : _a[0]) {
                    uploadPromises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                        const oldKey = (0, s3Upload_1.extractKeyFromS3Url)(ebook[ebookField]);
                        if (oldKey)
                            yield (0, s3Upload_1.deleteFileFromS3)(oldKey);
                        const newUrl = yield handleS3Upload(files[fieldName][0]);
                        ebook[ebookField] = newUrl;
                    }))());
                }
            };
            processFileUpdate('image1', 'image1');
            processFileUpdate('image2', 'image2');
            processFileUpdate('image3', 'image3');
            processFileUpdate('image4', 'image4');
            processFileUpdate('samplePdf', 'samplePdf');
            processFileUpdate('bookPdf', 'bookPdf'); // ✨ Handle updating the bookPdf file
            yield Promise.all(uploadPromises);
        }
        const updatedEbook = yield ebook.save();
        res.status(200).json({
            state: 200,
            msg: "E-book updated successfully",
            data: updatedEbook
        });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: "Failed to update e-book.", error: error.message });
    }
});
exports.updateEbook = updateEbook;
// --- DELETE E-BOOK ---
const deleteEbook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ebook = yield ebookModel_1.default.findById(req.params.id);
        if (!ebook) {
            res.status(404).json({ state: 404, msg: 'E-book not found' });
            return;
        }
        const deletionPromises = [];
        const fileFields = ['image1', 'image2', 'image3', 'image4', 'samplePdf', 'bookPdf']; // ✨ Add bookPdf to deletion list
        fileFields.forEach(field => {
            const url = ebook[field];
            if (url) {
                const key = (0, s3Upload_1.extractKeyFromS3Url)(url);
                if (key)
                    deletionPromises.push((0, s3Upload_1.deleteFileFromS3)(key));
            }
        });
        yield Promise.all(deletionPromises);
        yield ebookModel_1.default.deleteOne({ _id: ebook._id });
        res.status(200).json({
            state: 200,
            msg: 'E-book and associated files removed successfully'
        });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: "Failed to delete e-book.", error: error.message });
    }
});
exports.deleteEbook = deleteEbook;
