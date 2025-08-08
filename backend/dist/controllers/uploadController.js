"use strict";
// src/controllers/uploadController.ts
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
exports.uploadFileController = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const s3Upload_1 = require("../config/s3Upload"); // Adjust the path if needed
const uploadFileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.file) {
            // ✅ Remove the 'return' keyword here. res.json() sends the response.
            res.status(400).json({ message: 'No file uploaded.' });
            return; // Use a plain return to exit the function
        }
        const file = req.file;
        const fileBuffer = yield promises_1.default.readFile(file.path);
        const s3Key = `uploads/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
        const fileUrl = yield (0, s3Upload_1.uploadFileToS3)(fileBuffer, s3Key, file.mimetype);
        yield promises_1.default.unlink(file.path);
        res.status(200).json({ url: fileUrl });
    }
    catch (error) {
        console.error('Error in upload controller:', error);
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
            yield promises_1.default.unlink(req.file.path).catch(err => console.error("Failed to cleanup temp file on error:", err));
        }
        res.status(500).json({ message: error.message || 'File upload failed.' });
    }
});
exports.uploadFileController = uploadFileController;
