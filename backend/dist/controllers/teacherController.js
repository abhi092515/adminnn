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
exports.deleteTeacher = exports.updateTeacher = exports.getTeacherById = exports.getTeachers = exports.createTeacher = void 0;
const mongoose_1 = require("mongoose");
const teacher_1 = __importDefault(require("../models/teacher")); // Import the Teacher model
// Import Zod schemas
const teacherSchemas_1 = require("../schemas/teacherSchemas");
// Helper function to check if a referenced ID is valid and exists (not strictly needed for Teacher's own CRUD, but good to keep if it were to reference other models)
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
// @desc    Create a new Teacher
// @route   POST /api/teachers
// @access  Public
const createTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Zod validation
        const validationResult = teacherSchemas_1.createTeacherSchema.safeParse(req.body);
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
        const validatedData = validationResult.data;
        // Check for existing Teacher name (assuming name should be unique)
        const existingTeacher = yield teacher_1.default.findOne({ name: validatedData.name });
        if (existingTeacher) {
            res.status(400).json({ message: 'A teacher with this name already exists.' });
            return;
        }
        const newTeacher = new teacher_1.default(validatedData);
        const createdTeacher = yield newTeacher.save();
        res.status(201).json(createdTeacher);
    }
    catch (error) {
        if (error.code === 11000) { // Duplicate key error from MongoDB unique index
            res.status(400).json({ message: 'Duplicate key error: Teacher Name must be unique.' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.createTeacher = createTeacher;
// @desc    Get all Teachers
// @route   GET /api/teachers
// @access  Public
const getTeachers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teachers = yield teacher_1.default.find({});
        if (teachers.length > 0) {
            // If data is found, send 200 OK with the teachers
            res.status(200).json(teachers);
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
exports.getTeachers = getTeachers;
// @desc    Get a single Teacher by ID
// @route   GET /api/teachers/:id
// @access  Public
const getTeacherById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teacherItem = yield teacher_1.default.findById(req.params.id);
        if (teacherItem) {
            res.status(200).json(teacherItem);
        }
        else {
            res.status(404).json({ message: 'Teacher not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.getTeacherById = getTeacherById;
// @desc    Update a Teacher
// @route   PUT /api/teachers/:id
// @access  Public
const updateTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Zod validation for update
        const validationResult = teacherSchemas_1.updateTeacherSchema.safeParse(req.body);
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
        const updates = validationResult.data;
        const teacherItem = yield teacher_1.default.findById(req.params.id);
        if (teacherItem) {
            // Check for duplicate name if it's being changed
            if (updates.name && updates.name !== teacherItem.name) {
                const existingTeacherWithNewName = yield teacher_1.default.findOne({ name: updates.name });
                if (existingTeacherWithNewName) {
                    if (!teacherItem._id.equals(existingTeacherWithNewName._id)) {
                        res.status(400).json({ message: 'A teacher with this name already exists.' });
                        return;
                    }
                }
            }
            // Apply updates from validated data
            Object.assign(teacherItem, updates);
            const updatedTeacher = yield teacherItem.save();
            res.status(200).json(updatedTeacher);
        }
        else {
            res.status(404).json({ message: 'Teacher not found' });
        }
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Duplicate key error: Teacher Name must be unique.' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.updateTeacher = updateTeacher;
// @desc    Delete a Teacher
// @route   DELETE /api/teachers/:id
// @access  Public
const deleteTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teacherItem = yield teacher_1.default.findById(req.params.id);
        if (teacherItem) {
            yield teacher_1.default.deleteOne({ _id: teacherItem._id });
            res.status(200).json({ message: 'Teacher removed' });
        }
        else {
            res.status(404).json({ message: 'Teacher not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.deleteTeacher = deleteTeacher;
