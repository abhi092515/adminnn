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
exports.deleteTopic = exports.updateTopic = exports.getTopicById = exports.getTopics = exports.createTopic = void 0;
const Topic_1 = __importDefault(require("../models/Topic"));
const Section_1 = __importDefault(require("../models/Section")); // Import Section model for validation
const mongoose_1 = require("mongoose");
const topicSchemas_1 = require("../schemas/topicSchemas"); // Import the new schemas
// Helper function to check if a referenced ID is valid and exists
// This function helps keep your controllers clean
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
// @desc    Create a new topic
// @route   POST /api/topics
// @access  Public
const createTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Zod validation
        const validationResult = topicSchemas_1.createTopicSchema.safeParse(req.body);
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
        const { topicName, status, section } = validationResult.data; // Use validated data
        // 2. Validate existence of linked Section using the helper
        if (!(yield validateReference(Section_1.default, section, 'Section', res)))
            return;
        // 3. Check for existing topic name (unique across all topics based on your original controller)
        const existingTopic = yield Topic_1.default.findOne({ topicName });
        if (existingTopic) {
            res.status(400).json({ message: 'A topic with this name already exists.' });
            return;
        }
        const newTopic = new Topic_1.default({
            topicName,
            status,
            section,
        });
        const createdTopic = yield newTopic.save();
        // Populate the section field in the response, selecting ONLY the _id
        const populatedTopic = yield Topic_1.default.findById(createdTopic._id).populate('section', '_id sectionName'); // Added sectionName for better response
        res.status(201).json(populatedTopic);
    }
    catch (error) {
        if (error.code === 11000) { // Duplicate key error from MongoDB unique index
            res.status(400).json({ message: 'Duplicate key error: Topic Name must be unique.' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.createTopic = createTopic;
// @desc    Get all topics
// @route   GET /api/topics
// @access  Public
const getTopics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Populate section data, selecting _id and sectionName for more context
        const topics = yield Topic_1.default.find({}).populate('section', '_id sectionName');
        if (topics.length > 0) {
            // If data is found, send 200 OK with the topics
            res.status(200).json(topics);
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
exports.getTopics = getTopics;
// @desc    Get a single topic by ID
// @route   GET /api/topics/:id
// @access  Public
const getTopicById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Populate section data, selecting _id and sectionName
        const topic = yield Topic_1.default.findById(req.params.id).populate('section', '_id sectionName');
        if (topic) {
            res.status(200).json(topic);
        }
        else {
            res.status(404).json({ message: 'Topic not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.getTopicById = getTopicById;
// @desc    Update a topic
// @route   PUT /api/topics/:id
// @access  Public
const updateTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Zod validation for update
        const validationResult = topicSchemas_1.updateTopicSchema.safeParse(req.body);
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
        const updates = validationResult.data; // Use validated data
        // Explicitly type topic to help TypeScript
        const topic = yield Topic_1.default.findById(req.params.id);
        if (topic) {
            // Check for duplicate topic name if it's being changed
            if (updates.topicName && updates.topicName !== topic.topicName) {
                const existingTopicWithNewName = yield Topic_1.default.findOne({ topicName: updates.topicName });
                if (existingTopicWithNewName) {
                    if (!topic._id.equals(existingTopicWithNewName._id)) {
                        res.status(400).json({ message: 'A topic with this name already exists.' });
                        return;
                    }
                }
            }
            // Check if new section ID is valid and exists if it's being updated
            if (updates.section && !(yield validateReference(Section_1.default, updates.section, 'Section', res))) {
                return; // validateReference already sends the response
            }
            // Apply updates from validated data. Object.assign handles undefined fields from Zod.
            Object.assign(topic, updates);
            const updatedTopic = yield topic.save();
            // Populate section data, selecting _id and sectionName
            const populatedTopic = yield Topic_1.default.findById(updatedTopic._id).populate('section', '_id sectionName');
            res.status(200).json(populatedTopic);
        }
        else {
            res.status(404).json({ message: 'Topic not found' });
        }
    }
    catch (error) {
        if (error.code === 11000) { // Duplicate key error from MongoDB unique index
            res.status(400).json({ message: 'Duplicate key error: Topic Name must be unique.' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.updateTopic = updateTopic;
// @desc    Delete a topic
// @route   DELETE /api/topics/:id
// @access  Public
const deleteTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const topic = yield Topic_1.default.findById(req.params.id);
        if (topic) {
            yield Topic_1.default.deleteOne({ _id: topic._id });
            res.status(200).json({ message: 'Topic removed' });
        }
        else {
            res.status(404).json({ message: 'Topic not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.deleteTopic = deleteTopic;
