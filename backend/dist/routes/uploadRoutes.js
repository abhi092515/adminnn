"use strict";
// src/routes/uploadRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_1 = require("../controllers/uploadController");
const multerConfig_1 = __importDefault(require("../config/multerConfig")); // Adjust path if needed
const router = (0, express_1.Router)();
// Configure multer to save files to a temporary directory
const upload = (0, multerConfig_1.default)('temp');
// ✅ Defines the POST / route (which will be mounted at /api/upload)
// It uses multer to handle a single file with the field name "file"
router.post('/', upload.single('file'), uploadController_1.uploadFileController);
exports.default = router;
