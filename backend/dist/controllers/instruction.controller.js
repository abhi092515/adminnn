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
exports.deleteInstruction = exports.updateInstruction = exports.createInstruction = exports.getInstructionById = exports.getAllInstructions = void 0;
const instruction_model_1 = __importDefault(require("../models/instruction.model"));
const series_model_1 = __importDefault(require("../models/series.model")); // You must have a Series model
// @desc    Get all instructions, with search by seriesName
// @route   GET /api/instructions
const getAllInstructions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { seriesName } = req.query;
        const filter = {};
        // If a series name search term is provided...
        if (seriesName && typeof seriesName === 'string') {
            // 1. Find all series that match the name
            const matchingSeries = yield series_model_1.default.find({
                name: { $regex: seriesName, $options: 'i' }
            }).select('_id');
            // 2. Get an array of just their IDs
            const seriesIds = matchingSeries.map(s => s._id);
            // 3. Filter instructions where the 'series' field is in our array of IDs
            filter.series = { $in: seriesIds };
        }
        const instructions = yield instruction_model_1.default.find(filter)
            .populate('series', 'name') // Populate the series to get its name
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: instructions });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getAllInstructions = getAllInstructions;
// @desc    Get a single instruction by ID
// @route   GET /api/instructions/:id
const getInstructionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const instruction = yield instruction_model_1.default.findById(req.params.id).populate('series', 'name');
        if (!instruction) {
            return res.status(404).json({ success: false, message: 'Instruction not found' });
        }
        res.status(200).json({ success: true, data: instruction });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getInstructionById = getInstructionById;
// @desc    Create a new instruction
// @route   POST /api/instructions
const createInstruction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newInstruction = yield instruction_model_1.default.create(req.body);
        res.status(201).json({ success: true, message: 'Instruction created', data: newInstruction });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.createInstruction = createInstruction;
// @desc    Update an instruction
// @route   PUT /api/instructions/:id
const updateInstruction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const instruction = yield instruction_model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!instruction) {
            return res.status(404).json({ success: false, message: 'Instruction not found' });
        }
        res.status(200).json({ success: true, message: 'Instruction updated', data: instruction });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.updateInstruction = updateInstruction;
// @desc    Delete an instruction
// @route   DELETE /api/instructions/:id
const deleteInstruction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const instruction = yield instruction_model_1.default.findByIdAndDelete(req.params.id);
        if (!instruction) {
            return res.status(404).json({ success: false, message: 'Instruction not found' });
        }
        res.status(200).json({ success: true, message: 'Instruction deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.deleteInstruction = deleteInstruction;
