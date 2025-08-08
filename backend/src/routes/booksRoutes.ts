import express from 'express';
import multer from 'multer';
import {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook
} from '../controllers/booksController';

const router = express.Router();

// Configure Multer to store files in memory as buffers
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
  .get(getAllBooks)
  .post(bookUploads, createBook); // Use middleware to handle multipart form data

router.route('/:id')
  .get(getBookById)
  .put(bookUploads, updateBook)   // Use middleware here as well for updates
  .delete(deleteBook);

export default router;