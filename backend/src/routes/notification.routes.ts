import { Router } from 'express';
import {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
} from '../controllers/notification.controller';
// Corrected import statement below
import validate from '../middleware/validate';
import { createNotificationSchema, updateNotificationSchema } from '../schemas/notification.schema';
import configureMulter from '../config/multerConfig'; // Adjust path to your file

const router = Router();
const upload = configureMulter('notifications');

// Create a new notification
router.post(
  '/',
  upload.single('image'), // This middleware saves the file to disk
  createNotification      // The controller will handle the S3 upload
);


// Get all notifications
router.get('/', getAllNotifications);

// Get a single notification by ID
router.get('/:id', getNotificationById);

// Update a notification by ID
router.put(
  '/:id',
  upload.single('image'), // 1. Add multer to handle optional new image
  updateNotification      // 2. The controller will now handle validation and updates
);

// Delete a notification by ID
router.delete('/:id', deleteNotification);

export default router;