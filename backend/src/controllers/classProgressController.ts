import { Request, Response } from 'express';
import { Types } from 'mongoose';
import ClassProgress from '../models/ClassProgress';
import { convertToDate, isValidDate } from '../utils/dateUtils';

export const getClassProgress = async (req: Request, res: Response): Promise<void> => {
    try {
        const progress = await ClassProgress.find();
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching class progress', error });
    }
};

export const createClassProgress = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, classId, courseId, userStartTime, userEndTime } = req.body;

        const startTime = convertToDate(userStartTime);
        const endTime = convertToDate(userEndTime);        // Validate that the dates are valid
        if (!isValidDate(startTime) || !isValidDate(endTime)) {
            res.status(400).json({
                message: 'Invalid date format. Please provide valid timestamps (10 or 13 digits) or ISO date strings.',
                examples: {
                    unix_seconds: 1733270400,
                    unix_milliseconds: 1733270400000,
                    iso_string: "2024-12-04T10:00:00.000Z"
                }
            });
            return;
        }

        // Validate courseId format
        if (!Types.ObjectId.isValid(courseId)) {
            res.status(400).json({
                message: 'Invalid courseId format. Must be a valid ObjectId.'
            });
            return;
        }

        const newProgress = new ClassProgress({
            userId,
            classId,
            courseId: new Types.ObjectId(courseId),
            userStartTime: startTime,
            userEndTime: endTime
        });

        const savedProgress = await newProgress.save();
        res.status(201).json(savedProgress);
    } catch (error) {
        res.status(400).json({ message: 'Error creating class progress', error });
    }
};
