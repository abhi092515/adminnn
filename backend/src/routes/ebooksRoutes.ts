import express from 'express';
import multer from 'multer';
import {
  createEbook,
  getAllEbooks,
  getEbookById,
  updateEbook,
  deleteEbook
} from '../controllers/ebookController'; // These functions will be created next

const router = express.Router();

// Configure Multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
  .get(getAllEbooks)
  .post(ebookUploads, createEbook);

router.route('/:id')
  .get(getEbookById)
  .put(ebookUploads, updateEbook)
  .delete(deleteEbook);

export default router;