"use strict";
// import { Request, Response } from 'express';
// import Book from '../models/books';
// import { createBookSchema, updateBookSchema } from '../schemas/booksSchemas';
// import { uploadFileToS3, deleteFileFromS3, extractKeyFromS3Url } from '../config/s3Upload';
// import MainCategory from '../models/MainCategory';
// import Category from '../models/Category';
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
exports.deleteBook = exports.updateBook = exports.getBookById = exports.getAllBooks = exports.createBook = void 0;
const books_1 = __importDefault(require("../models/books"));
const booksSchemas_1 = require("../schemas/booksSchemas");
const s3Upload_1 = require("../config/s3Upload");
const MainCategory_1 = __importDefault(require("../models/MainCategory"));
const Category_1 = __importDefault(require("../models/Category"));
const handleS3Upload = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const uniqueFileName = `books/${Date.now()}-${file.originalname}`;
    return yield (0, s3Upload_1.uploadFileToS3)(file.buffer, uniqueFileName, file.mimetype);
});
// --- CREATE BOOK ---
const createBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('--- CREATE BOOK REQUEST RECEIVED ---');
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.files);
    try {
        const validationResult = booksSchemas_1.createBookSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ state: 400, msg: "Validation failed", errors: validationResult.error.errors });
            return;
        }
        const _a = validationResult.data, { mainCategory, category } = _a, bookData = __rest(_a, ["mainCategory", "category"]);
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
        const newBook = new books_1.default(Object.assign(Object.assign({}, bookData), { mainCategory, category }));
        if (req.files) {
            const files = req.files;
            const uploadPromises = [];
            const processFile = (fieldName) => {
                var _a;
                if ((_a = files[fieldName]) === null || _a === void 0 ? void 0 : _a[0]) {
                    uploadPromises.push(handleS3Upload(files[fieldName][0]).then(url => {
                        newBook[fieldName] = url;
                    }));
                }
            };
            processFile('image1');
            processFile('image2');
            processFile('image3');
            processFile('image4');
            processFile('samplePdf');
            yield Promise.all(uploadPromises);
        }
        const savedBook = yield newBook.save();
        res.status(201).json({
            state: 201,
            msg: "Book created successfully",
            data: savedBook
        });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: "Failed to create book.", error: error.message });
    }
});
exports.createBook = createBook;
// --- GET ALL BOOKS ---
const getAllBooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const books = yield books_1.default.find({})
            .populate('mainCategory', 'mainCategoryName')
            .populate('category', 'categoryName');
        res.status(200).json({
            state: 200,
            msg: "Books retrieved successfully",
            data: books
        });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: error.message });
    }
});
exports.getAllBooks = getAllBooks;
// --- GET BOOK BY ID ---
const getBookById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const book = yield books_1.default.findById(req.params.id)
            .populate('mainCategory', 'mainCategoryName')
            .populate('category', 'categoryName');
        if (!book) {
            res.status(404).json({ state: 404, msg: 'Book not found' });
            return;
        }
        res.status(200).json({
            state: 200,
            msg: "Book retrieved successfully",
            data: book
        });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: error.message });
    }
});
exports.getBookById = getBookById;
// --- UPDATE BOOK ---
const updateBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const book = yield books_1.default.findById(req.params.id);
        if (!book) {
            res.status(404).json({ state: 404, msg: 'Book not found' });
            return;
        }
        const validationResult = booksSchemas_1.updateBookSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ state: 400, msg: "Validation failed", errors: validationResult.error.errors });
            return;
        }
        Object.assign(book, validationResult.data);
        if (req.files) {
            const files = req.files;
            const uploadPromises = [];
            const processFileUpdate = (fieldName) => {
                var _a;
                if ((_a = files[fieldName]) === null || _a === void 0 ? void 0 : _a[0]) {
                    uploadPromises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                        const oldKey = (0, s3Upload_1.extractKeyFromS3Url)(book[fieldName]);
                        if (oldKey)
                            yield (0, s3Upload_1.deleteFileFromS3)(oldKey);
                        const newUrl = yield handleS3Upload(files[fieldName][0]);
                        book[fieldName] = newUrl;
                    }))());
                }
            };
            processFileUpdate('image1');
            processFileUpdate('image2');
            processFileUpdate('image3');
            processFileUpdate('image4');
            processFileUpdate('samplePdf');
            yield Promise.all(uploadPromises);
        }
        const updatedBook = yield book.save();
        res.status(200).json({
            state: 200,
            msg: "Book updated successfully",
            data: updatedBook
        });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: "Failed to update book.", error: error.message });
    }
});
exports.updateBook = updateBook;
// --- DELETE BOOK ---
const deleteBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const book = yield books_1.default.findById(req.params.id);
        if (!book) {
            res.status(404).json({ state: 404, msg: 'Book not found' });
            return;
        }
        const deletionPromises = [];
        const fileFields = ['image1', 'image2', 'image3', 'image4', 'samplePdf'];
        fileFields.forEach(field => {
            const url = book[field];
            if (url) {
                const key = (0, s3Upload_1.extractKeyFromS3Url)(url);
                if (key)
                    deletionPromises.push((0, s3Upload_1.deleteFileFromS3)(key));
            }
        });
        yield Promise.all(deletionPromises);
        yield books_1.default.deleteOne({ _id: book._id });
        res.status(200).json({
            state: 200,
            msg: 'Book removed successfully'
        });
    }
    catch (error) {
        res.status(500).json({ state: 500, msg: "Failed to delete book.", error: error.message });
    }
});
exports.deleteBook = deleteBook;
