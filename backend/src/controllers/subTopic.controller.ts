import { Request, Response } from 'express';
import SubTopic from '../models/subTopic.model';

// Get all sub-topics
export const getAllSubTopics = async (req: Request, res: Response) => {
    try {
        const subTopics = await SubTopic.find({})
            .populate('topic', 'topicName') // Get the name of the parent topic
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: subTopics });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a single sub-topic by ID
export const getSubTopicById = async (req: Request, res: Response) => {
  try {
      const subTopic = await SubTopic.findById(req.params.id)
          // ✅ FIX: Updated populate to include both '_id' and 'topicName'
          .populate('topic', '_id topicName');
          
      if (!subTopic) {
          return res.status(404).json({ success: false, message: 'Sub-Topic not found' });
      }
      res.status(200).json({ success: true, data: subTopic });
  } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new sub-topic
export const createSubTopic = async (req: Request, res: Response) => {
    try {
        const newSubTopic = await SubTopic.create(req.body);
        res.status(201).json({ success: true, message: "Sub-Topic created", data: newSubTopic });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update a sub-topic
export const updateSubTopic = async (req: Request, res: Response) => {
    try {
        const updatedSubTopic = await SubTopic.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSubTopic) {
            return res.status(404).json({ success: false, message: 'Sub-Topic not found' });
        }
        res.status(200).json({ success: true, message: 'Sub-Topic updated', data: updatedSubTopic });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete a sub-topic
export const deleteSubTopic = async (req: Request, res: Response) => {
    try {
        const subTopic = await SubTopic.findByIdAndDelete(req.params.id);
        if (!subTopic) {
            return res.status(404).json({ success: false, message: 'Sub-Topic not found' });
        }
        res.status(200).json({ success: true, message: 'Sub-Topic deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};