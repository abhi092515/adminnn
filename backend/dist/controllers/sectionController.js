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
exports.deleteSection = exports.updateSection = exports.getSectionById = exports.getSections = exports.createSection = void 0;
const Section_1 = __importDefault(require("../models/Section"));
const sectionSchemas_1 = require("../schemas/sectionSchemas");
// @desc    Create a new section
// @route   POST /api/sections
// @access  Public
const createSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Zod validation
        const validationResult = sectionSchemas_1.createSectionSchema.safeParse(req.body);
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
        const { sectionName, status } = validationResult.data;
        // Explicit check for existing section name
        const existingSection = yield Section_1.default.findOne({ sectionName });
        if (existingSection) {
            res.status(400).json({
                state: 400,
                msg: 'A section with this name already exists.',
                data: null
            });
            return;
        }
        const newSection = new Section_1.default({
            sectionName,
            status,
        });
        const createdSection = yield newSection.save();
        res.status(200).json({
            state: 200,
            msg: 'Section created successfully',
            data: createdSection
        });
    }
    catch (error) {
        if (error.code === 11000) { // Duplicate key error from MongoDB unique index
            res.status(400).json({
                state: 400,
                msg: 'Duplicate key error: Section Name must be unique.',
                data: null
            });
            return;
        }
        console.error('Error creating section:', error); // Log the error for debugging
        res.status(500).json({
            state: 500,
            msg: error.message || 'Server Error',
            data: null
        });
    }
});
exports.createSection = createSection;
// @desc    Get all sections
// @route   GET /api/sections
// @access  Public
const getSections = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sections = yield Section_1.default.find({});
        if (sections.length > 0) {
            res.status(200).json({
                state: 200,
                msg: 'success',
                data: sections
            });
        }
        else {
            // Consistent with your request: 201 for "no data found"
            res.status(201).json({
                state: 201,
                msg: 'No sections found',
                data: []
            });
        }
    }
    catch (error) {
        console.error('Error fetching sections:', error);
        res.status(500).json({
            state: 500,
            msg: error.message || 'Server Error',
            data: []
        });
    }
});
exports.getSections = getSections;
// @desc    Get a single section by ID
// @route   GET /api/sections/:id
// @access  Public
const getSectionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const section = yield Section_1.default.findById(req.params.id);
        if (section) {
            res.status(200).json({
                state: 200,
                msg: 'success',
                data: section
            });
        }
        else {
            // Consistent with your request: 201 for "not found"
            res.status(201).json({
                state: 201,
                msg: 'Section not found',
                data: null
            });
        }
    }
    catch (error) {
        console.error('Error fetching section by ID:', error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            res.status(400).json({
                state: 400,
                msg: 'Invalid Section ID format.',
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
exports.getSectionById = getSectionById;
// @desc    Update a section
// @route   PUT /api/sections/:id
// @access  Public
const updateSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Zod validation for update
        const validationResult = sectionSchemas_1.updateSectionSchema.safeParse(req.body);
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
        const section = yield Section_1.default.findById(req.params.id);
        if (section) {
            // Check for duplicate section name if it's being changed
            if (updates.sectionName && updates.sectionName !== section.sectionName) {
                const existingSectionWithNewName = yield Section_1.default.findOne({ sectionName: updates.sectionName });
                if (existingSectionWithNewName) {
                    const currentSectionId = section._id;
                    const foundSectionId = existingSectionWithNewName._id;
                    if (!currentSectionId.equals(foundSectionId)) {
                        res.status(400).json({
                            state: 400,
                            msg: 'A section with this name already exists.',
                            data: null
                        });
                        return;
                    }
                }
            }
            // Apply updates
            Object.assign(section, updates);
            const updatedSection = yield section.save();
            res.status(200).json({
                state: 200,
                msg: 'Section updated successfully',
                data: updatedSection
            });
        }
        else {
            // Consistent with your request: 201 for "not found"
            res.status(201).json({
                state: 201,
                msg: 'Section not found',
                data: null
            });
        }
    }
    catch (error) {
        if (error.code === 11000) { // Duplicate key error from MongoDB unique index
            res.status(400).json({
                state: 400,
                msg: 'Duplicate key error: Section Name must be unique.',
                data: null
            });
            return;
        }
        console.error('Error updating section:', error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            res.status(400).json({
                state: 400,
                msg: 'Invalid Section ID format.',
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
exports.updateSection = updateSection;
// @desc    Delete a section
// @route   DELETE /api/sections/:id
// @access  Public
const deleteSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const section = yield Section_1.default.findById(req.params.id);
        if (section) {
            yield Section_1.default.deleteOne({ _id: section._id });
            res.status(200).json({
                state: 200,
                msg: 'Section removed successfully',
                data: null
            });
        }
        else {
            // Consistent with your request: 201 for "not found"
            res.status(201).json({
                state: 201,
                msg: 'Section not found',
                data: null
            });
        }
    }
    catch (error) {
        console.error('Error deleting section:', error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            res.status(400).json({
                state: 400,
                msg: 'Invalid Section ID format.',
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
exports.deleteSection = deleteSection;
