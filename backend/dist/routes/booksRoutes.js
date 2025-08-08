"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const booksController_1 = require("../controllers/booksController");
const router = express_1.default.Router();
// Configure Multer to store files in memory as buffers
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
// Define the fields to be processed by Multer
const bookUploads = upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
    { name: 'samplePdf', maxCount: 1 },
]);
// --- Book Routes ---
router.route('/')
    .get(booksController_1.getAllBooks)
    .post(bookUploads, booksController_1.createBook); // Use middleware to handle multipart form data
router.route('/:id')
    .get(booksController_1.getBookById)
    .put(bookUploads, booksController_1.updateBook) // Use middleware here as well for updates
    .delete(booksController_1.deleteBook);
exports.default = router;
