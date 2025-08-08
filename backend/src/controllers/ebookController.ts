import { Request, Response } from 'express';
import Ebook from '../models/ebookModel'; // Use the Ebook model
import { createEbookSchema, updateEbookSchema } from '../schemas/ebookSchemas'; // Use the Ebook schemas
import { uploadFileToS3, deleteFileFromS3, extractKeyFromS3Url } from '../config/s3Upload';
import MainCategory from '../models/MainCategory';
import Category from '../models/Category';

// Helper function to handle a single file upload to S3
const handleS3Upload = async (file: Express.Multer.File): Promise<string> => {
    const uniqueFileName = `ebooks/${Date.now()}-${file.originalname}`; // Changed folder to 'ebooks'
    return await uploadFileToS3(file.buffer, uniqueFileName, file.mimetype);
};

// --- CREATE E-BOOK ---
export const createEbook = async (req: Request, res: Response): Promise<void> => {
    try {
        const validationResult = createEbookSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ state: 400, msg: "Validation failed", errors: validationResult.error.errors });
            return;
        }

        const { mainCategory, category, ...ebookData } = validationResult.data;
        
        const mainCategoryExists = await MainCategory.findById(mainCategory);
        if (!mainCategoryExists) {
            res.status(404).json({ state: 404, msg: "MainCategory not found." });
            return;
        }
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            res.status(404).json({ state: 404, msg: "Category not found." });
            return;
        }
        
        const newEbook = new Ebook({ ...ebookData, mainCategory, category });

        if (req.files) {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const uploadPromises: Promise<void>[] = [];

            const processFile = (fieldName: keyof typeof files, ebookField: keyof typeof newEbook) => {
                if (files[fieldName]?.[0]) {
                    uploadPromises.push(
                        handleS3Upload(files[fieldName][0]).then(url => {
                            (newEbook as any)[ebookField] = url;
                        })
                    );
                }
            };
            
            processFile('image1', 'image1');
            processFile('image2', 'image2');
            processFile('image3', 'image3');
            processFile('image4', 'image4');
            processFile('samplePdf', 'samplePdf');
            processFile('bookPdf', 'bookPdf'); // ✨ Handle the new bookPdf file

            await Promise.all(uploadPromises);
        }

        const savedEbook = await newEbook.save();
        res.status(201).json({
            state: 201,
            msg: "E-book created successfully",
            data: savedEbook
        });

    } catch (error: any) {
        res.status(500).json({ state: 500, msg: "Failed to create e-book.", error: error.message });
    }
};

// --- GET ALL E-BOOKS ---
export const getAllEbooks = async (req: Request, res: Response): Promise<void> => {
    try {
        const ebooks = await Ebook.find({})
            .populate('mainCategory', 'mainCategoryName')
            .populate('category', 'categoryName');
        res.status(200).json({
            state: 200,
            msg: "E-books retrieved successfully",
            data: ebooks
        });
    } catch (error: any) {
        res.status(500).json({ state: 500, msg: error.message });
    }
};

// --- GET E-BOOK BY ID ---
export const getEbookById = async (req: Request, res: Response): Promise<void> => {
    try {
        const ebook = await Ebook.findById(req.params.id)
            .populate('mainCategory', 'mainCategoryName')
            .populate('category', 'categoryName');
        if (!ebook) {
            res.status(404).json({ state: 404, msg: 'E-book not found' });
            return;
        }
        res.status(200).json({
            state: 200,
            msg: "E-book retrieved successfully",
            data: ebook
        });
    } catch (error: any) {
        res.status(500).json({ state: 500, msg: error.message });
    }
};

// --- UPDATE E-BOOK ---
export const updateEbook = async (req: Request, res: Response): Promise<void> => {
    try {
        const ebook = await Ebook.findById(req.params.id);
        if (!ebook) {
            res.status(404).json({ state: 404, msg: 'E-book not found' });
            return;
        }

        const validationResult = updateEbookSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ state: 400, msg: "Validation failed", errors: validationResult.error.errors });
            return;
        }

        Object.assign(ebook, validationResult.data);

        if (req.files) {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const uploadPromises: Promise<void>[] = [];

            const processFileUpdate = (fieldName: keyof typeof files, ebookField: keyof typeof ebook) => {
                if (files[fieldName]?.[0]) {
                    uploadPromises.push(
                        (async () => {
                            const oldKey = extractKeyFromS3Url((ebook as any)[ebookField]);
                            if (oldKey) await deleteFileFromS3(oldKey);
                            const newUrl = await handleS3Upload(files[fieldName][0]);
                            (ebook as any)[ebookField] = newUrl;
                        })()
                    );
                }
            };
            
            processFileUpdate('image1', 'image1');
            processFileUpdate('image2', 'image2');
            processFileUpdate('image3', 'image3');
            processFileUpdate('image4', 'image4');
            processFileUpdate('samplePdf', 'samplePdf');
            processFileUpdate('bookPdf', 'bookPdf'); // ✨ Handle updating the bookPdf file

            await Promise.all(uploadPromises);
        }

        const updatedEbook = await ebook.save();
        res.status(200).json({
            state: 200,
            msg: "E-book updated successfully",
            data: updatedEbook
        });

    } catch (error: any) {
        res.status(500).json({ state: 500, msg: "Failed to update e-book.", error: error.message });
    }
};

// --- DELETE E-BOOK ---
export const deleteEbook = async (req: Request, res: Response): Promise<void> => {
    try {
        const ebook = await Ebook.findById(req.params.id);
        if (!ebook) {
            res.status(404).json({ state: 404, msg: 'E-book not found' });
            return;
        }

        const deletionPromises: Promise<void>[] = [];
        const fileFields = ['image1', 'image2', 'image3', 'image4', 'samplePdf', 'bookPdf']; // ✨ Add bookPdf to deletion list

        fileFields.forEach(field => {
            const url = (ebook as any)[field];
            if (url) {
                const key = extractKeyFromS3Url(url);
                if (key) deletionPromises.push(deleteFileFromS3(key));
            }
        });

        await Promise.all(deletionPromises);

        await Ebook.deleteOne({ _id: ebook._id });
        res.status(200).json({
            state: 200,
            msg: 'E-book and associated files removed successfully'
        });

    } catch (error: any) {
        res.status(500).json({ state: 500, msg: "Failed to delete e-book.", error: error.message });
    }
};