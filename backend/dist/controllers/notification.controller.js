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
exports.getNotificationById = exports.getAllNotifications = exports.deleteNotification = exports.updateNotification = exports.createNotification = void 0;
const notification_model_1 = __importDefault(require("../models/notification.model"));
const s3Upload_1 = require("../config/s3Upload"); // Adjust path
const fs_1 = __importDefault(require("fs"));
// Helper function to handle async controller logic and errors
const asyncHandler = (fn) => {
    return (req, res) => {
        fn(req, res).catch(error => {
            var _a;
            console.error(error);
            // Ensure local file is deleted on error
            if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
                fs_1.default.unlinkSync(req.file.path);
            }
            res.status(500).json({ message: 'An internal server error occurred', error });
        });
    };
};
exports.createNotification = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const localFilePath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    if (!req.file || !localFilePath) {
        res.status(400).json({ message: 'Image file is required' });
        return;
    }
    // 1. Read file and upload to S3
    const fileBuffer = fs_1.default.readFileSync(localFilePath);
    const fileName = `notifications/${Date.now()}-${req.file.originalname}`;
    const s3Url = yield (0, s3Upload_1.uploadFileToS3)(fileBuffer, fileName, req.file.mimetype);
    fs_1.default.unlinkSync(localFilePath); // Clean up local file immediately
    // 2. Create notification with S3 URL
    const notificationData = Object.assign(Object.assign({}, req.body), { image: s3Url, scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : undefined });
    const notification = yield notification_model_1.default.create(notificationData);
    res.status(201).json(notification);
}));
exports.updateNotification = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const localFilePath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    const updateData = Object.assign({}, req.body);
    if (req.file && localFilePath) {
        const oldNotification = yield notification_model_1.default.findById(id);
        if (oldNotification === null || oldNotification === void 0 ? void 0 : oldNotification.image) {
            const oldS3Key = (0, s3Upload_1.extractKeyFromS3Url)(oldNotification.image);
            if (oldS3Key)
                yield (0, s3Upload_1.deleteFileFromS3)(oldS3Key);
        }
        const fileBuffer = fs_1.default.readFileSync(localFilePath);
        const fileName = `notifications/${Date.now()}-${req.file.originalname}`;
        updateData.image = yield (0, s3Upload_1.uploadFileToS3)(fileBuffer, fileName, req.file.mimetype);
        fs_1.default.unlinkSync(localFilePath);
    }
    const updatedNotification = yield notification_model_1.default.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedNotification) {
        res.status(404).json({ message: "Notification not found" });
        return;
    }
    res.status(200).json(updatedNotification);
}));
exports.deleteNotification = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield notification_model_1.default.findById(req.params.id);
    if (!notification) {
        res.status(404).json({ message: 'Notification not found' });
        return;
    }
    const s3Key = (0, s3Upload_1.extractKeyFromS3Url)(notification.image);
    if (s3Key)
        yield (0, s3Upload_1.deleteFileFromS3)(s3Key);
    yield notification_model_1.default.findByIdAndDelete(req.params.id);
    res.status(204).send();
}));
exports.getAllNotifications = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const notifications = yield notification_model_1.default.find();
    res.status(200).json(notifications);
}));
exports.getNotificationById = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield notification_model_1.default.findById(req.params.id);
    if (!notification) {
        res.status(404).json({ message: 'Notification not found' });
        return;
    }
    res.status(200).json(notification);
}));
