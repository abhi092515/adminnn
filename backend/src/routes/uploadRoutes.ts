// src/routes/uploadRoutes.ts

import { Router } from 'express';
import { uploadFileController } from '../controllers/uploadController';
import configureMulter from '../config/multerConfig'; // Adjust path if needed

const router = Router();

// Configure multer to save files to a temporary directory
const upload = configureMulter('temp'); 

// ✅ Defines the POST / route (which will be mounted at /api/upload)
// It uses multer to handle a single file with the field name "file"
router.post('/', upload.single('file'), uploadFileController);

export default router;