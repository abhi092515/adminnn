"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const ebookController_1 = require("../controllers/ebookController"); // These functions will be created next
const router = express_1.default.Router();
// Configure Multer to store files in memory
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
// Define the fields to be processed by Multer
const ebookUploads = upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
    { name: 'samplePdf', maxCount: 1 },
    { name: 'bookPdf', maxCount: 1 }, // ✨ Added the new field
]);
// --- E-book Routes ---
router.route('/')
    .get(ebookController_1.getAllEbooks)
    .post(ebookUploads, ebookController_1.createEbook);
router.route('/:id')
    .get(ebookController_1.getEbookById)
    .put(ebookUploads, ebookController_1.updateEbook)
    .delete(ebookController_1.deleteEbook);
exports.default = router;
