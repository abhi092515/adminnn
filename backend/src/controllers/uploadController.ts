// src/controllers/uploadController.ts

import { Request, Response } from 'express';
import fs from 'fs/promises';
import { uploadFileToS3 } from '../config/s3Upload'; // Adjust the path if needed

export const uploadFileController = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      // ✅ Remove the 'return' keyword here. res.json() sends the response.
      res.status(400).json({ message: 'No file uploaded.' });
      return; // Use a plain return to exit the function
    }

    const file = req.file;
    const fileBuffer = await fs.readFile(file.path);
    const s3Key = `uploads/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    const fileUrl = await uploadFileToS3(fileBuffer, s3Key, file.mimetype);
    await fs.unlink(file.path);

    res.status(200).json({ url: fileUrl });

  } catch (error: any) {
    console.error('Error in upload controller:', error);
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(err => console.error("Failed to cleanup temp file on error:", err));
    }
    res.status(500).json({ message: error.message || 'File upload failed.' });
  }
};