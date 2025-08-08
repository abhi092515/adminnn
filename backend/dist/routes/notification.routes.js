"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const multerConfig_1 = __importDefault(require("../config/multerConfig")); // Adjust path to your file
const router = (0, express_1.Router)();
const upload = (0, multerConfig_1.default)('notifications');
// Create a new notification
router.post('/', upload.single('image'), // This middleware saves the file to disk
notification_controller_1.createNotification // The controller will handle the S3 upload
);
// Get all notifications
router.get('/', notification_controller_1.getAllNotifications);
// Get a single notification by ID
router.get('/:id', notification_controller_1.getNotificationById);
// Update a notification by ID
router.put('/:id', upload.single('image'), // 1. Add multer to handle optional new image
notification_controller_1.updateNotification // 2. The controller will now handle validation and updates
);
// Delete a notification by ID
router.delete('/:id', notification_controller_1.deleteNotification);
exports.default = router;
