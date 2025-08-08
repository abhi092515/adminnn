// src/controllers/topicController.ts
import { Request, Response } from 'express';
import Topic, { ITopic } from '../models/Topic';
import Section from '../models/Section'; // Import Section model for validation
import { Types } from 'mongoose';

// Import Zod schemas
import { z } from 'zod'; // Import z from zod for error handling
import { createTopicSchema, updateTopicSchema } from '../schemas/topicSchemas'; // Import the new schemas

// Helper function to check if a referenced ID is valid and exists
// This function helps keep your controllers clean
const validateReference = async (
  model: any,
  id: string | Types.ObjectId,
  modelName: string,
  res: Response
): Promise<boolean> => {
  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: `Invalid ${modelName} ID provided.` });
    return false;
  }
  const exists = await model.findById(id);
  if (!exists) {
    res.status(404).json({ message: `${modelName} not found.` });
    return false;
  }
  return true;
};

// @desc    Create a new topic
// @route   POST /api/topics
// @access  Public
export const createTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Zod validation
    const validationResult = createTopicSchema.safeParse(req.body);

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
    if (!(await validateReference(Section, section, 'Section', res))) return;

    // 3. Check for existing topic name (unique across all topics based on your original controller)
    const existingTopic = await Topic.findOne({ topicName });
    if (existingTopic) {
      res.status(400).json({ message: 'A topic with this name already exists.' });
      return;
    }

    const newTopic: ITopic = new Topic({
      topicName,
      status,
      section,
    });

    const createdTopic = await newTopic.save();
    // Populate the section field in the response, selecting ONLY the _id
    const populatedTopic = await Topic.findById(createdTopic._id).populate('section', '_id sectionName'); // Added sectionName for better response

    res.status(201).json(populatedTopic);
  } catch (error: any) {
    if (error.code === 11000) { // Duplicate key error from MongoDB unique index
      res.status(400).json({ message: 'Duplicate key error: Topic Name must be unique.' });
      return;
    }
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get all topics
// @route   GET /api/topics
// @access  Public
export const getTopics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sectionId } = req.query; // Handle potential filtering
    const filter = sectionId ? { section: sectionId as string } : {};

    const topics = await Topic.find(filter).populate('section', 'sectionName id');

    // ✅ FIX: Always wrap the response in a data object.
    res.status(200).json({ success: true, data: topics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Get a single topic by ID
// @route   GET /api/topics/:id
// @access  Public
export const getTopicById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Populate section data, selecting _id and sectionName
    const topic = await Topic.findById(req.params.id).populate('section', '_id sectionName');

    if (topic) {
      res.status(200).json(topic);
    } else {
      res.status(404).json({ message: 'Topic not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Update a topic
// @route   PUT /api/topics/:id
// @access  Public
export const updateTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Zod validation for update
    const validationResult = updateTopicSchema.safeParse(req.body);

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
    const topic: ITopic | null = await Topic.findById(req.params.id);

    if (topic) {
      // Check for duplicate topic name if it's being changed
      if (updates.topicName && updates.topicName !== topic.topicName) {
        const existingTopicWithNewName = await Topic.findOne({ topicName: updates.topicName });
        if (existingTopicWithNewName) {
          if (!(topic._id as Types.ObjectId).equals(existingTopicWithNewName._id as Types.ObjectId)) {
            res.status(400).json({ message: 'A topic with this name already exists.' });
            return;
          }
        }
      }

      // Check if new section ID is valid and exists if it's being updated
      if (updates.section && !(await validateReference(Section, updates.section, 'Section', res))) {
        return; // validateReference already sends the response
      }

      // Apply updates from validated data. Object.assign handles undefined fields from Zod.
      Object.assign(topic, updates);

      const updatedTopic = await topic.save();
      // Populate section data, selecting _id and sectionName
      const populatedTopic = await Topic.findById(updatedTopic._id).populate('section', '_id sectionName');

      res.status(200).json(populatedTopic);
    } else {
      res.status(404).json({ message: 'Topic not found' });
    }
  } catch (error: any) {
    if (error.code === 11000) { // Duplicate key error from MongoDB unique index
      res.status(400).json({ message: 'Duplicate key error: Topic Name must be unique.' });
      return;
    }
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
export const getAllTopics = async (req: Request, res: Response) => {
  try {
      const { sectionId } = req.query; // Get the sectionId from the URL query

      // Create a filter object. If a sectionId is provided, it will be used.
      const filter = sectionId ? { section: sectionId } : {};

      // Find topics using the filter
      const topics = await Topic.find(filter)
          .populate('section', 'sectionName'); // You can optionally populate the section

      // Make sure to wrap the response in a `data` property
      res.status(200).json({ success: true, data: topics });
  } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a topic
// @route   DELETE /api/topics/:id
// @access  Public
export const deleteTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (topic) {
      await Topic.deleteOne({ _id: topic._id });
      res.status(200).json({ message: 'Topic removed' });
    } else {
      res.status(404).json({ message: 'Topic not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};