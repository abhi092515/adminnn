// import { Request, Response } from 'express';
// import Book from '../models/books';
// import { createBookSchema, updateBookSchema } from '../schemas/booksSchemas';
// import { uploadFileToS3, deleteFileFromS3, extractKeyFromS3Url } from '../config/s3Upload';
// import MainCategory from '../models/MainCategory';
// import Category from '../models/Category';

// // Helper function to handle a single file upload to S3
// const handleS3Upload = async (file: Express.Multer.File): Promise<string> => {
//     const uniqueFileName = `books/${Date.now()}-${file.originalname}`;
//     return await uploadFileToS3(file.buffer, uniqueFileName, file.mimetype);
// };

// // --- CREATE BOOK ---
// export const createBook = async (req: Request, res: Response): Promise<void> => {
//   try {
//       const validationResult = createBookSchema.safeParse(req.body);
//       if (!validationResult.success) {
//           res.status(400).json({ state: 400, msg: "Validation failed", errors: validationResult.error.errors });
//           return;
//       }

//       // Validate that referenced categories exist
//       const { mainCategory, category } = validationResult.data;
//       const mainCategoryExists = await MainCategory.findById(mainCategory);
//       if (!mainCategoryExists) {
//           res.status(404).json({ state: 404, msg: "MainCategory not found." });
//           return;
//       }
//       const categoryExists = await Category.findById(category);
//       if (!categoryExists) {
//           res.status(404).json({ state: 404, msg: "Category not found." });
//           return;
//       }
      
//       const newBook = new Book(validationResult.data);
//       const savedBook = await newBook.save();

//       res.status(201).json({
//           state: 201,
//           msg: "Book created successfully",
//           data: savedBook
//       });

//   } catch (error: any) {
//       res.status(500).json({ state: 500, msg: "Failed to create book.", error: error.message });
//   }
// };
// // --- GET ALL BOOKS ---
// export const getAllBooks = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const books = await Book.find({})
//             .populate('mainCategory', 'mainCategoryName')
//             .populate('category', 'categoryName');

//         // ✅ WRAP THE RESPONSE
//         res.status(200).json({
//             state: 200,
//             msg: "Books retrieved successfully",
//             data: books
//         });
//     } catch (error: any) {
//         res.status(500).json({ state: 500, msg: error.message });
//     }
// };

// // --- GET BOOK BY ID ---
// export const getBookById = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const book = await Book.findById(req.params.id)
//             .populate('mainCategory', 'mainCategoryName')
//             .populate('category', 'categoryName');
//         if (!book) {
//             res.status(404).json({ state: 404, msg: 'Book not found' });
//             return;
//         }
//         // ✅ WRAP THE RESPONSE
//         res.status(200).json({
//             state: 200,
//             msg: "Book retrieved successfully",
//             data: book
//         });
//     } catch (error: any) {
//         res.status(500).json({ state: 500, msg: error.message });
//     }
// };

// // --- UPDATE BOOK ---
// export const updateBook = async (req: Request, res: Response): Promise<void> => {
//   try {
//       const book = await Book.findById(req.params.id);
//       if (!book) {
//           res.status(404).json({ state: 404, msg: 'Book not found' });
//           return;
//       }

//       const validationResult = updateBookSchema.safeParse(req.body);
//       if (!validationResult.success) {
//           res.status(400).json({ state: 400, msg: "Validation failed", errors: validationResult.error.errors });
//           return;
//       }

//       Object.assign(book, validationResult.data);
//       const updatedBook = await book.save();

//       res.status(200).json({
//           state: 200,
//           msg: "Book updated successfully",
//           data: updatedBook
//       });

//   } catch (error: any) {
//       res.status(500).json({ state: 500, msg: "Failed to update book.", error: error.message });
//   }
// };

// // --- DELETE BOOK ---
// export const deleteBook = async (req: Request, res: Response): Promise<void> => {
//     try {
//         // ... (delete logic remains the same)
//         const book = await Book.findById(req.params.id);
//         if (!book) {
//             res.status(404).json({ state: 404, msg: 'Book not found' });
//             return;
//         }
//         const deletionPromises: Promise<void>[] = [];
//         const fileFields = ['image1', 'image2', 'image3', 'image4', 'samplePdf'];
//         fileFields.forEach(field => {
//             const url = (book as any)[field];
//             if (url) {
//                 const key = extractKeyFromS3Url(url);
//                 if (key) deletionPromises.push(deleteFileFromS3(key));
//             }
//         });
//         await Promise.all(deletionPromises);
//         await Book.deleteOne({ _id: book._id });

//         // ✅ WRAP THE RESPONSE
//         res.status(200).json({
//             state: 200,
//             msg: 'Book removed successfully'
//         });

//     } catch (error: any) {
//         res.status(500).json({ state: 500, msg: "Failed to delete book.", error: error.message });
//     }
// }; 
import { Request, Response } from 'express';
import Book from '../models/books';
import { createBookSchema, updateBookSchema } from '../schemas/booksSchemas';
import { uploadFileToS3, deleteFileFromS3, extractKeyFromS3Url } from '../config/s3Upload';
import MainCategory from '../models/MainCategory';
import Category from '../models/Category';

const handleS3Upload = async (file: Express.Multer.File): Promise<string> => {
    const uniqueFileName = `books/${Date.now()}-${file.originalname}`;
    return await uploadFileToS3(file.buffer, uniqueFileName, file.mimetype);
};

// --- CREATE BOOK ---
export const createBook = async (req: Request, res: Response): Promise<void> => {
    console.log('--- CREATE BOOK REQUEST RECEIVED ---');
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.files);
  try {
      const validationResult = createBookSchema.safeParse(req.body);
      if (!validationResult.success) {
          res.status(400).json({ state: 400, msg: "Validation failed", errors: validationResult.error.errors });
          return;
      }

      const { mainCategory, category, ...bookData } = validationResult.data;
      
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
      
      const newBook = new Book({ ...bookData, mainCategory, category });

      if (req.files) {
          const files = req.files as { [fieldname: string]: Express.Multer.File[] };
          const uploadPromises: Promise<void>[] = [];

          const processFile = (fieldName: keyof typeof files) => {
              if (files[fieldName]?.[0]) {
                  uploadPromises.push(
                      handleS3Upload(files[fieldName][0]).then(url => {
                          (newBook as any)[fieldName] = url;
                      })
                  );
              }
          };
          
          processFile('image1');
          processFile('image2');
          processFile('image3');
          processFile('image4');
          processFile('samplePdf');

          await Promise.all(uploadPromises);
      }

      const savedBook = await newBook.save();
      res.status(201).json({
          state: 201,
          msg: "Book created successfully",
          data: savedBook
      });

  } catch (error: any) {
      res.status(500).json({ state: 500, msg: "Failed to create book.", error: error.message });
  }
};

// --- GET ALL BOOKS ---
export const getAllBooks = async (req: Request, res: Response): Promise<void> => {
    try {
        const books = await Book.find({})
            .populate('mainCategory', 'mainCategoryName')
            .populate('category', 'categoryName');
        res.status(200).json({
            state: 200,
            msg: "Books retrieved successfully",
            data: books
        });
    } catch (error: any) {
        res.status(500).json({ state: 500, msg: error.message });
    }
};

// --- GET BOOK BY ID ---
export const getBookById = async (req: Request, res: Response): Promise<void> => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('mainCategory', 'mainCategoryName')
            .populate('category', 'categoryName');
        if (!book) {
            res.status(404).json({ state: 404, msg: 'Book not found' });
            return;
        }
        res.status(200).json({
            state: 200,
            msg: "Book retrieved successfully",
            data: book
        });
    } catch (error: any) {
        res.status(500).json({ state: 500, msg: error.message });
    }
};

// --- UPDATE BOOK ---
export const updateBook = async (req: Request, res: Response): Promise<void> => {
  try {
      const book = await Book.findById(req.params.id);
      if (!book) {
          res.status(404).json({ state: 404, msg: 'Book not found' });
          return;
      }

      const validationResult = updateBookSchema.safeParse(req.body);
      if (!validationResult.success) {
          res.status(400).json({ state: 400, msg: "Validation failed", errors: validationResult.error.errors });
          return;
      }

      Object.assign(book, validationResult.data);

      if (req.files) {
          const files = req.files as { [fieldname: string]: Express.Multer.File[] };
          const uploadPromises: Promise<void>[] = [];

          const processFileUpdate = (fieldName: keyof typeof files) => {
              if (files[fieldName]?.[0]) {
                  uploadPromises.push(
                      (async () => {
                          const oldKey = extractKeyFromS3Url((book as any)[fieldName]);
                          if (oldKey) await deleteFileFromS3(oldKey);
                          
                          const newUrl = await handleS3Upload(files[fieldName][0]);
                          (book as any)[fieldName] = newUrl;
                      })()
                  );
              }
          };
          
          processFileUpdate('image1');
          processFileUpdate('image2');
          processFileUpdate('image3');
          processFileUpdate('image4');
          processFileUpdate('samplePdf');

          await Promise.all(uploadPromises);
      }

      const updatedBook = await book.save();
      res.status(200).json({
          state: 200,
          msg: "Book updated successfully",
          data: updatedBook
      });

  } catch (error: any) {
      res.status(500).json({ state: 500, msg: "Failed to update book.", error: error.message });
  }
};

// --- DELETE BOOK ---
export const deleteBook = async (req: Request, res: Response): Promise<void> => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            res.status(404).json({ state: 404, msg: 'Book not found' });
            return;
        }
        const deletionPromises: Promise<void>[] = [];
        const fileFields = ['image1', 'image2', 'image3', 'image4', 'samplePdf'];
        fileFields.forEach(field => {
            const url = (book as any)[field];
            if (url) {
                const key = extractKeyFromS3Url(url);
                if (key) deletionPromises.push(deleteFileFromS3(key));
            }
        });
        await Promise.all(deletionPromises);
        await Book.deleteOne({ _id: book._id });
        res.status(200).json({
            state: 200,
            msg: 'Book removed successfully'
        });
    } catch (error: any) {
        res.status(500).json({ state: 500, msg: "Failed to delete book.", error: error.message });
    }
};