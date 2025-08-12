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
exports.deleteSubTopic = exports.updateSubTopic = exports.createSubTopic = exports.getSubTopicById = exports.getAllSubTopics = void 0;
const subTopic_model_1 = __importDefault(require("../models/subTopic.model"));
// Get all sub-topics
const getAllSubTopics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subTopics = yield subTopic_model_1.default.find({})
            .populate('topic', 'topicName') // Get the name of the parent topic
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: subTopics });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getAllSubTopics = getAllSubTopics;
// Get a single sub-topic by ID
const getSubTopicById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subTopic = yield subTopic_model_1.default.findById(req.params.id)
            // ✅ FIX: Updated populate to include both '_id' and 'topicName'
            .populate('topic', '_id topicName');
        if (!subTopic) {
            return res.status(404).json({ success: false, message: 'Sub-Topic not found' });
        }
        res.status(200).json({ success: true, data: subTopic });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getSubTopicById = getSubTopicById;
// Create a new sub-topic
const createSubTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newSubTopic = yield subTopic_model_1.default.create(req.body);
        res.status(201).json({ success: true, message: "Sub-Topic created", data: newSubTopic });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.createSubTopic = createSubTopic;
// Update a sub-topic
const updateSubTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedSubTopic = yield subTopic_model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSubTopic) {
            return res.status(404).json({ success: false, message: 'Sub-Topic not found' });
        }
        res.status(200).json({ success: true, message: 'Sub-Topic updated', data: updatedSubTopic });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.updateSubTopic = updateSubTopic;
// Delete a sub-topic
const deleteSubTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subTopic = yield subTopic_model_1.default.findByIdAndDelete(req.params.id);
        if (!subTopic) {
            return res.status(404).json({ success: false, message: 'Sub-Topic not found' });
        }
        res.status(200).json({ success: true, message: 'Sub-Topic deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.deleteSubTopic = deleteSubTopic;
