import { Request, Response } from 'express';
import Notification from '../models/notification.model';
import { uploadFileToS3, deleteFileFromS3, extractKeyFromS3Url } from '../config/s3Upload'; // Adjust path
import fs from 'fs';

// Helper function to handle async controller logic and errors
const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>) => {
  return (req: Request, res: Response) => {
    fn(req, res).catch(error => {
      console.error(error);
      // Ensure local file is deleted on error
      if (req.file?.path) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: 'An internal server error occurred', error });
    });
  };
};

export const createNotification = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const localFilePath = req.file?.path;
  if (!req.file || !localFilePath) {
    res.status(400).json({ message: 'Image file is required' });
    return;
  }

  // 1. Read file and upload to S3
  const fileBuffer = fs.readFileSync(localFilePath);
  const fileName = `notifications/${Date.now()}-${req.file.originalname}`;
  const s3Url = await uploadFileToS3(fileBuffer, fileName, req.file.mimetype);
  fs.unlinkSync(localFilePath); // Clean up local file immediately

  // 2. Create notification with S3 URL
  const notificationData = {
    ...req.body,
    image: s3Url,
    scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : undefined,
  };
  const notification = await Notification.create(notificationData);

  res.status(201).json(notification);
});

export const updateNotification = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const localFilePath = req.file?.path;
  const updateData = { ...req.body };

  if (req.file && localFilePath) {
    const oldNotification = await Notification.findById(id);
    if (oldNotification?.image) {
      const oldS3Key = extractKeyFromS3Url(oldNotification.image);
      if (oldS3Key) await deleteFileFromS3(oldS3Key);
    }
    
    const fileBuffer = fs.readFileSync(localFilePath);
    const fileName = `notifications/${Date.now()}-${req.file.originalname}`;
    updateData.image = await uploadFileToS3(fileBuffer, fileName, req.file.mimetype);
    fs.unlinkSync(localFilePath);
  }

  const updatedNotification = await Notification.findByIdAndUpdate(id, updateData, { new: true });

  if (!updatedNotification) {
    res.status(404).json({ message: "Notification not found" });
    return;
  }
  res.status(200).json(updatedNotification);
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    res.status(404).json({ message: 'Notification not found' });
    return;
  }

  const s3Key = extractKeyFromS3Url(notification.image);
  if (s3Key) await deleteFileFromS3(s3Key);

  await Notification.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

export const getAllNotifications = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const notifications = await Notification.find();
  res.status(200).json(notifications);
});

export const getNotificationById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    res.status(404).json({ message: 'Notification not found' });
    return;
  }
  res.status(200).json(notification);
});