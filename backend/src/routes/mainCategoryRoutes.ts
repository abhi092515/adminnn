// src/routes/mainCategoryRoutes.ts
import { Router } from 'express';
import {
  createMainCategory,
  getMainCategories,
  getMainCategoryById,
  updateMainCategory,
  deleteMainCategory,
} from '../controllers/mainCategoryController';

// --- REMOVED: Local Multer Setup ---
// import multer from 'multer'; // No longer needed directly here
// import path from 'path';     // No longer needed directly here

// --- ADDED: Import the common Multer configuration function ---
import configureMulter from '../config/multerConfig';

// --- ADDED: Configure Multer specifically for main category images ---
// This will now use the common logic defined in multerConfig.ts
const uploadMainCategory = configureMulter('main-categories');

const router = Router();

/**
 * @swagger
 * tags:
 * - name: Main Categories
 * description: API for managing main categories
 */

/**
 * @swagger
 * components:
 * schemas:
 * MainCategory:
 * type: object
 * required:
 * - mainCategoryName
 * - assignedToHeader
 * properties:
 * id:
 * type: string
 * description: The auto-generated ID of the main category
 * readOnly: true
 * mainCategoryName:
 * type: string
 * description: The name of the main category
 * mainCategoryImage:
 * type: string
 * format: uri
 * description: URL of the main category image (optional)
 * description:
 * type: string
 * description: Description of the main category (optional)
 * assignedToHeader:
 * type: boolean
 * description: Whether the main category is assigned to the header (true/false)
 * status:
 * type: string
 * enum: [active, inactive]
 * default: active
 * description: Status of the main category (active/inactive)
 * createdAt:
 * type: string
 * format: date-time
 * description: The date and time the main category was created
 * readOnly: true
 * updatedAt:
 * type: string
 * format: date-time
 * description: The date and time the main category was last updated
 * readOnly: true
 * example:
 * id: "60c72b1f9b1e8e001c8f4b0d"
 * mainCategoryName: "Electronics"
 * mainCategoryImage: "https://example.com/images/electronics.jpg"
 * description: "Gadgets and electronic devices."
 * assignedToHeader: true
 * status: "active"
 * createdAt: "2023-01-01T10:00:00Z"
 * updatedAt: "2023-01-01T10:00:00Z"
 *
 * requestBodies:
 * MainCategoryCreate:
 * description: Main category data with optional image file upload
 * required: true
 * content:
 * multipart/form-data:
 * schema:
 * type: object
 * properties:
 * mainCategoryName:
 * type: string
 * description: The name of the main category
 * description:
 * type: string
 * description: Description of the main category (optional)
 * assignedToHeader:
 * type: boolean
 * description: Whether the main category is assigned to the header (true/false)
 * status:
 * type: string
 * enum: [active, inactive]
 * default: active
 * description: Status of the main category (active/inactive)
 * mainCategoryImage:
 * type: string
 * format: binary
 * description: Image file to upload for the main category (e.g., JPG, PNG)
 * required:
 * - mainCategoryName
 * - assignedToHeader
 * MainCategoryUpdate:
 * description: Main category data to update with optional image file upload or URL
 * required: true
 * content:
 * multipart/form-data:
 * schema:
 * type: object
 * properties:
 * mainCategoryName:
 * type: string
 * description: The updated name of the main category (optional)
 * description:
 * type: string
 * description: Updated description of the main category (optional)
 * assignedToHeader:
 * type: boolean
 * description: Updated assignment to header (optional)
 * status:
 * type: string
 * enum: [active, inactive]
 * description: Updated status (optional)
 * mainCategoryImage:
 * type: string
 * format: binary
 * description: New image file to upload for the main category. If you want to clear the image without uploading a new one, send an empty string or null in the JSON body (not via multipart).
 * encoding:
 * mainCategoryImage:
 * contentType: image/jpeg, image/png, image/gif
 * application/json: # Keep this for if they update non-file fields with JSON, or clear image via JSON
 * schema:
 * type: object
 * properties:
 * mainCategoryName:
 * type: string
 * description: The updated name of the main category (optional)
 * description:
 * type: string
 * description: Updated description of the main category (optional)
 * assignedToHeader:
 * type: boolean
 * description: Updated assignment to header (optional)
 * status:
 * type: string
 * enum: [active, inactive]
 * description: Updated status (optional)
 * mainCategoryImage:
 * type: string
 * format: uri
 * nullable: true
 * description: URL of the new image, or empty string/null to clear the existing image (optional).
 * examples:
 * updateNameOnly:
 * value:
 * mainCategoryName: "Fashion"
 * updateDescriptionAndClearImage:
 * value:
 * description: "Latest trends and accessories."
 * mainCategoryImage: null
 * updateImageByUrl:
 * value:
 * mainCategoryImage: "https://new-image.com/fashion.jpg"
 */

/**
 * @swagger
 * /main-categories:
 * post:
 * summary: Create a new main category with optional image upload
 * tags: [Main Categories]
 * requestBody:
 * $ref: '#/components/requestBodies/MainCategoryCreate'
 * responses:
 * 200:
 * description: Main category created successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state:
 * type: number
 * example: 200
 * msg:
 * type: string
 * example: "Main Category created successfully"
 * data:
 * $ref: '#/components/schemas/MainCategory'
 * examples:
 * successResponse:
 * value:
 * state: 200
 * msg: "Main Category created successfully"
 * data:
 * id: "60c72b1f9b1e8e001c8f4b0d"
 * mainCategoryName: "Electronics"
 * mainCategoryImage: "https://your-s3-bucket.s3.amazonaws.com/categories/1678886400000-electronics.jpg"
 * description: "Gadgets and electronic devices."
 * assignedToHeader: true
 * status: "active"
 * createdAt: "2023-01-01T10:00:00Z"
 * updatedAt: "2023-01-01T10:00:00Z"
 * 400:
 * description: Bad request (e.g., validation failed, duplicate name, file upload error)
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state: { type: number, example: 400 }
 * msg: { type: string, example: "Validation failed" }
 * errors:
 * type: array
 * items:
 * type: object
 * properties:
 * path: { type: string }
 * message: { type: string }
 * examples:
 * validationError:
 * value:
 * state: 400
 * msg: "Validation failed"
 * errors:
 * - path: "mainCategoryName"
 * message: "Main category name is required."
 * duplicateName:
 * value:
 * state: 400
 * msg: "Main Category Name already exists."
 * data: null # Changed from [] to null for consistency
 * fileUploadError:
 * value:
 * message: "File upload error: File too large"
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state: { type: number, example: 500 }
 * msg: { type: string, example: "Server Error" }
 * data: { type: null, example: null } # Changed from [] to null for consistency
 */

/**
 * @swagger
 * /main-categories:
 * get:
 * summary: Get all main categories
 * tags: [Main Categories]
 * responses:
 * 200:
 * description: A list of main categories
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state: { type: number, example: 200 }
 * msg: { type: string, example: "success" }
 * data:
 * type: array
 * items:
 * $ref: '#/components/schemas/MainCategory'
 * examples:
 * successResponse:
 * value:
 * state: 200
 * msg: "success"
 * data:
 * - id: "60c72b1f9b1e8e001c8f4b0d"
 * mainCategoryName: "Electronics"
 * mainCategoryImage: "https://your-s3-bucket.s3.amazonaws.com/categories/electronics.jpg"
 * description: "Gadgets and electronic devices."
 * assignedToHeader: true
 * status: "active"
 * createdAt: "2023-01-01T10:00:00Z"
 * updatedAt: "2023-01-01T10:00:00Z"
 * - id: "60c72b1f9b1e8e001c8f4b0e"
 * mainCategoryName: "Fashion"
 * mainCategoryImage: "https://your-s3-bucket.s3.amazonaws.com/categories/fashion.jpg"
 * description: "Apparel and accessories."
 * assignedToHeader: false
 * status: "active"
 * createdAt: "2023-01-02T11:00:00Z"
 * updatedAt: "2023-01-02T11:00:00Z"
 * 200: # Changed from 201 to 200 for consistency with empty array response
 * description: No data found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state: { type: number, example: 200 }
 * msg: { type: string, example: "No data found" }
 * data: { type: array, example: [] }
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state: { type: number, example: 500 }
 * msg: { type: string, example: "Server Error" }
 * data: { type: array, example: [] }
 */
router.route('/')
  .post(uploadMainCategory.single('mainCategoryImage'), createMainCategory) // Use the common Multer instance
  .get(getMainCategories);

/**
 * @swagger
 * /main-categories/{id}:
 * get:
 * summary: Get a main category by ID
 * tags: [Main Categories]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The ID of the main category to retrieve
 * example: 60c72b1f9b1e8e001c8f4b0d
 * responses:
 * 200:
 * description: Main category found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state: { type: number, example: 200 }
 * msg: { type: string, example: "success" }
 * data:
 * $ref: '#/components/schemas/MainCategory'
 * examples:
 * successResponse:
 * value:
 * state: 200
 * msg: "success"
 * data:
 * id: "60c72b1f9b1e8e001c8f4b0d"
 * mainCategoryName: "Electronics"
 * mainCategoryImage: "https://your-s3-bucket.s3.amazonaws.com/categories/electronics.jpg"
 * description: "Gadgets and electronic devices."
 * assignedToHeader: true
 * status: "active"
 * createdAt: "2023-01-01T10:00:00Z"
 * updatedAt: "2023-01-01T10:00:00Z"
 * 404: # Changed from 201 to 404 for consistency with controller's "not found"
 * description: Main category not found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state: { type: number, example: 404 }
 * msg: { type: string, example: "Main Category not found" }
 * data: { type: null, example: null }
 * 400:
 * description: Invalid ID format
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state: { type: number, example: 400 }
 * msg: { type: string, example: "Invalid Main Category ID format." }
 * data: { type: null, example: null }
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state: { type: number, example: 500 }
 * msg: { type: string, example: "Server Error" }
 * data: { type: null, example: null }
 */

/**
 * @swagger
 * /main-categories/{id}:
 * put:
 * summary: Update a main category by ID with optional image upload/clear
 * tags: [Main Categories]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The ID of the main category to update
 * example: 60c72b1f9b1e8e001c8f4b0d
 * requestBody:
 * $ref: '#/components/requestBodies/MainCategoryUpdate'
 * responses:
 * 200:
 * description: Main category updated successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state: { type: number, example: 200 }
 * msg: { type: string, example: "Main Category updated successfully" }
 * data:
 * $ref: '#/components/schemas/MainCategory'
 * examples:
 * successResponse:
 * value:
 * state: 200
 * msg: "Main Category updated successfully"
 * data:
 * id: "60c72b1f9b1e8e001c8f4b0d"
 * mainCategoryName: "Electronics"
 * mainCategoryImage: "https://your-s3-bucket.s3.amazonaws.com/categories/updated-electronics.jpg"
 * description: "Updated description for electronics."
 * assignedToHeader: true
 * status: "active"
 * createdAt: "2023-01-01T10:00:00Z"
 * updatedAt: "2023-01-01T11:00:00Z"
 * 404: # Changed from 201 to 404 for consistency with controller's "not found"
 * description: Main category not found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state: { type: number, example: 404 }
 * msg: { type: string, example: "Main Category not found" }
 * data: { type: null, example: null }
 * 400:
 * description: Bad request (e.g., validation failed, duplicate name, invalid ID format, file upload error)
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state: { type: number, example: 400 }
 * msg: { type: string, example: "Validation failed" }
 * errors:
 * type: array
 * items:
 * type: object
 * properties:
 * path: { type: string }
 * message: { type: string }
 * examples:
 * validationError:
 * value:
 * state: 400
 * msg: "Validation failed"
 * errors:
 * - path: "mainCategoryName"
 * message: "Main category name cannot be empty."
 * duplicateName:
 * value:
 * state: 400
 * msg: "Main Category Name already exists."
 * data: null # Changed from [] to null for consistency
 * invalidIdFormat:
 * value:
 * state: 400
 * msg: "Invalid Main Category ID format."
 * data: null # Changed from [] to null for consistency
 * fileUploadError:
 * value:
 * message: "File upload error: Invalid file type"
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state: { type: number, example: 500 }
 * msg: { type: string, example: "Server Error" }
 * data: { type: null, example: null } # Changed from [] to null for consistency
 */

/**
 * @swagger
 * /main-categories/{id}:
 * delete:
 * summary: Delete a main category by ID
 * tags: [Main Categories]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The ID of the main category to delete
 * example: 60c72b1f9b1e8e001c8f4b0d
 * responses:
 * 200:
 * description: Main category removed successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state: { type: number, example: 200 }
 * msg: { type: string, example: "Main Category removed successfully" }
 * data: { type: null, example: null } # Changed from [] to null for consistency
 * examples:
 * successResponse:
 * value:
 * state: 200
 * msg: "Main Category removed successfully"
 * data: null # Changed from [] to null for consistency
 * 404: # Changed from 201 to 404 for consistency with controller's "not found"
 * description: Main category not found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state: { type: number, example: 404 }
 * msg: { type: string, example: "Main Category not found" }
 * data: { type: null, example: null }
 * 400:
 * description: Invalid ID format
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state: { type: number, example: 400 }
 * msg: { type: string, example: "Invalid Main Category ID format." }
 * data: { type: null, example: null }
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state: { type: number, example: 500 }
 * msg: { type: string, example: "Server Error" }
 * data: { type: null, example: null }
 */
router.route('/:id')
  .get(getMainCategoryById)
  .put(uploadMainCategory.single('mainCategoryImage'), updateMainCategory) // Use the common Multer instance
  .delete(deleteMainCategory);

export default router;