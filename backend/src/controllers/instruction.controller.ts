import { Request, Response } from 'express';
import Instruction from '../models/instruction.model';
import Series from '../models/series.model'; // You must have a Series model
import { any } from 'zod';

// @desc    Get all instructions, with search by seriesName
// @route   GET /api/instructions
export const getAllInstructions = async (req: Request, res: Response) => {
    try {
        const { seriesName } = req.query;
        const filter: any = {};

        // If a series name search term is provided...
        if (seriesName && typeof seriesName === 'string') {
            // 1. Find all series that match the name
            const matchingSeries = await Series.find({ 
                name: { $regex: seriesName, $options: 'i' } 
            }).select('_id');
            
            // 2. Get an array of just their IDs
            const seriesIds = matchingSeries.map(s => s._id);

            // 3. Filter instructions where the 'series' field is in our array of IDs
            filter.series = { $in: seriesIds };
        }

        const instructions = await Instruction.find(filter)
            .populate('series', 'name') // Populate the series to get its name
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, data: instructions });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get a single instruction by ID
// @route   GET /api/instructions/:id
export const getInstructionById = async (req: Request, res: Response) => {
    try {
        const instruction = await Instruction.findById(req.params.id).populate('series', 'name');
        if (!instruction) {
            return res.status(404).json({ success: false, message: 'Instruction not found' });
        }
        res.status(200).json({ success: true, data: instruction });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a new instruction
// @route   POST /api/instructions
export const createInstruction = async (req: Request, res: Response) => {
    try {
        const newInstruction = await Instruction.create(req.body);
        res.status(201).json({ success: true, message: 'Instruction created', data: newInstruction });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update an instruction
// @route   PUT /api/instructions/:id
export const updateInstruction = async (req: Request, res: Response) => {
    try {
        const instruction = await Instruction.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!instruction) {
            return res.status(404).json({ success: false, message: 'Instruction not found' });
        }
        res.status(200).json({ success: true, message: 'Instruction updated', data: instruction });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete an instruction
// @route   DELETE /api/instructions/:id
export const deleteInstruction = async (req: Request, res: Response) => {
    try {
        const instruction = await Instruction.findByIdAndDelete(req.params.id);
        if (!instruction) {
            return res.status(404).json({ success: false, message: 'Instruction not found' });
        }
        res.status(200).json({ success: true, message: 'Instruction deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};