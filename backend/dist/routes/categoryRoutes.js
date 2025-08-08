"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/categoryRoutes.ts
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const multerConfig_1 = __importDefault(require("../config/multerConfig")); // Import the common Multer configuration function
const router = (0, express_1.Router)();
// Configure Multer specifically for category images, saving them in 'uploads/categories/'
// This will now use the common logic defined in multerConfig.ts
const uploadCategory = (0, multerConfig_1.default)('categories');
/**
 * @swagger
 * tags:
 * - name: Categories
 * description: API for managing sub-categories linked to main categories
 */
/**
 * @swagger
 * /categories:
 * post:
 * summary: Create a new category
 * tags: [Categories]
 * requestBody:
 * required: true
 * content:
 * multipart/form-data: # CORRECTED: Indicate file upload via multipart/form-data
 * schema:
 * type: object
 * properties:
 * categoryImage:
 * type: string
 * format: binary # Indicates that this is a file upload field
 * description: Image file for the category.
 * categoryName:
 * type: string
 * description: The name of the category.
 * example: "T-Shirts"
 * categoryDescription:
 * type: string
 * description: A description of the category.
 * example: "Comfortable and stylish t-shirts."
 * assignedToHeader:
 * type: boolean
 * description: Whether the category should be assigned to the header (send as "true" or "false" string).
 * example: false
 * status:
 * type: string
 * enum: [active, inactive]
 * description: The status of the category.
 * example: "active"
 * mainCategory:
 * type: string
 * description: The ID of the main category this category belongs to.
 * example: "60c72b1f9b1e8e001c8f4b0d" # Example MainCategory ID
 * required:
 * - categoryName
 * - mainCategory
 * encoding: # Optional: Define encoding for file types if needed
 * categoryImage:
 * contentType: image/jpeg, image/png, image/webp
 * responses:
 * 200: # Changed from 201 to 200 to align with your controller's success status
 * description: Category created successfully
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
 * example: "Category created successfully"
 * data:
 * $ref: '#/components/schemas/Category'
 * examples:
 * createdCategoryExample:
 * value:
 * state: 200
 * msg: "Category created successfully"
 * data:
 * _id: "60c72b1f9b1e8e001c8f4b0e"
 * categoryImage: "https://example.com/images/tshirts-s3-url.jpg" # Reflects S3 URL
 * categoryName: "T-Shirts"
 * categoryDescription: "Comfortable and stylish t-shirts."
 * assignedToHeader: false
 * status: "active"
 * mainCategory:
 * _id: "60c72b1f9b1e8e001c8f4b0d"
 * mainCategoryName: "Apparel"
 * 400:
 * description: Bad request (e.g., validation failed, duplicate name, invalid Main Category ID, file upload error)
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state:
 * type: number
 * example: 400
 * msg:
 * type: string
 * example: "Validation failed"
 * errors:
 * type: array
 * items:
 * type: object
 * properties:
 * path: { type: string }
 * message: { type: string }
 * 404: # Changed from 201 to 404 for missing Main Category
 * description: Main category not found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state:
 * type: number
 * example: 404
 * msg:
 * type: string
 * example: "Main Category not found."
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state:
 * type: number
 * example: 500
 * msg:
 * type: string
 * example: "Server Error"
 */
/**
 * @swagger
 * /categories:
 * get:
 * summary: Get all categories
 * tags: [Categories]
 * responses:
 * 200:
 * description: A list of categories
 * content:
 * application/json:
 * schema:
 * type: object # Changed from array to object to match controller's response structure
 * properties:
 * state:
 * type: number
 * example: 200
 * msg:
 * type: string
 * example: "success"
 * data:
 * type: array
 * items:
 * $ref: '#/components/schemas/Category'
 * examples:
 * allCategoriesExample:
 * value:
 * state: 200
 * msg: "success"
 * data:
 * - _id: "60c72b1f9b1e8e001c8f4b0e"
 * categoryImage: "https://example.com/images/tshirts-s3-url.jpg"
 * categoryName: "T-Shirts"
 * categoryDescription: "Comfortable and stylish t-shirts."
 * assignedToHeader: false
 * status: "active"
 * mainCategory:
 * _id: "60c72b1f9b1e8e001c8f4b0d"
 * mainCategoryName: "Apparel"
 * - _id: "60c72b1f9b1e8e001c8f4b0f"
 * categoryImage: "https://example.com/images/jeans-s3-url.jpg"
 * categoryName: "Jeans"
 * categoryDescription: "Denim jeans for all occasions."
 * assignedToHeader: false
 * status: "active"
 * mainCategory:
 * _id: "60c72b1f9b1e8e001c8f4b0d"
 * mainCategoryName: "Apparel"
 * 201: # Keeping 201 to match your controller's "No categories found" status, but 200 with empty array is more standard
 * description: No categories found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state:
 * type: number
 * example: 201
 * msg:
 * type: string
 * example: "No categories found"
 * data:
 * type: array
 * example: []
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state:
 * type: number
 * example: 500
 * msg:
 * type: string
 * example: "Server Error"
 * data:
 * type: array
 * example: []
 */
router.route('/')
    .post(uploadCategory.single('categoryImage'), categoryController_1.createCategory) // Use the common Multer instance
    .get(categoryController_1.getCategories);
/**
 * @swagger
 * /categories/{id}:
 * get:
 * summary: Get a category by ID
 * tags: [Categories]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The ID of the category to retrieve
 * example: 60c72b1f9b1e8e001c8f4b0e
 * responses:
 * 200:
 * description: Category found
 * content:
 * application/json:
 * schema:
 * type: object # Changed to object to match controller's response structure
 * properties:
 * state:
 * type: number
 * example: 200
 * msg:
 * type: string
 * example: "success"
 * data:
 * $ref: '#/components/schemas/Category'
 * examples:
 * singleCategoryExample:
 * value:
 * state: 200
 * msg: "success"
 * data:
 * _id: "60c72b1f9b1e8e001c8f4b0e"
 * categoryImage: "https://example.com/images/tshirts-s3-url.jpg"
 * categoryName: "T-Shirts"
 * categoryDescription: "Comfortable and stylish t-shirts."
 * assignedToHeader: false
 * status: "active"
 * mainCategory:
 * _id: "60c72b1f9b1e8e001c8f4b0d"
 * mainCategoryName: "Apparel"
 * 400: # Added for invalid ID format
 * description: Invalid Category ID format.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state:
 * type: number
 * example: 400
 * msg:
 * type: string
 * example: "Invalid Category ID format."
 * data:
 * type: 'null'
 * 201: # Keeping 201 to match your controller's "not found" status, but 404 is more standard
 * description: Category not found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state:
 * type: number
 * example: 201
 * msg:
 * type: string
 * example: "Category not found"
 * data:
 * type: 'null'
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state:
 * type: number
 * example: 500
 * msg:
 * type: string
 * example: "Server Error"
 * data:
 * type: 'null'
 */
/**
 * @swagger
 * /categories/{id}:
 * put:
 * summary: Update a category by ID
 * tags: [Categories]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The ID of the category to update
 * example: 60c72b1f9b1e8e001c8f4b0e
 * requestBody:
 * required: true
 * content:
 * multipart/form-data: # CORRECTED: Indicate file upload via multipart/form-data
 * schema:
 * type: object
 * properties:
 * categoryImage:
 * type: string
 * format: binary # Indicates that this is a file upload field
 * description: New image file for the category (optional). To clear existing image, send `categoryImage` as an empty string in the JSON body if using application/json for other fields. For multipart/form-data, you'd typically omit the file part or have a specific 'clear_image' flag.
 * categoryName:
 * type: string
 * description: The updated name of the category.
 * example: "Updated T-Shirts"
 * categoryDescription:
 * type: string
 * description: An updated description of the category.
 * example: "Very comfortable and stylish t-shirts."
 * assignedToHeader:
 * type: boolean
 * description: Whether the category should be assigned to the header (send as "true" or "false" string).
 * example: true
 * status:
 * type: string
 * enum: [active, inactive]
 * description: The updated status of the category.
 * example: "inactive"
 * mainCategory:
 * type: string
 * description: The ID of the main category this category now belongs to.
 * example: "60c72b1f9b1e8e001c8f4b10" # Example MainCategory ID
 * encoding: # Optional: Define encoding for file types if needed
 * categoryImage:
 * contentType: image/jpeg, image/png, image/webp
 * responses:
 * 200:
 * description: Category updated successfully
 * content:
 * application/json:
 * schema:
 * type: object # Changed to object to match controller's response structure
 * properties:
 * state:
 * type: number
 * example: 200
 * msg:
 * type: string
 * example: "Category updated successfully"
 * data:
 * $ref: '#/components/schemas/Category'
 * 400:
 * description: Bad request (e.g., validation failed, duplicate name, invalid Main Category ID, file upload error)
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state:
 * type: number
 * example: 400
 * msg:
 * type: string
 * example: "Validation failed"
 * errors:
 * type: array
 * items:
 * type: object
 * properties:
 * path: { type: string }
 * message: { type: string }
 * 404: # Changed from 201 to 404 for missing Category or Main Category
 * description: Category or Main Category not found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state:
 * type: number
 * example: 404
 * msg:
 * type: string
 * example: "Category not found."
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state:
 * type: number
 * example: 500
 * msg:
 * type: string
 * example: "Server Error"
 */
/**
 * @swagger
 * /categories/{id}:
 * delete:
 * summary: Delete a category by ID
 * tags: [Categories]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The ID of the category to delete
 * example: 60c72b1f9b1e8e001c8f4b0e
 * responses:
 * 200:
 * description: Category removed successfully
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
 * example: "Category removed successfully"
 * data:
 * type: 'null'
 * 400: # Added for invalid ID format
 * description: Invalid Category ID format.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state:
 * type: number
 * example: 400
 * msg:
 * type: string
 * example: "Invalid Category ID format."
 * data:
 * type: 'null'
 * 201: # Keeping 201 to match your controller's "not found" status, but 404 is more standard
 * description: Category not found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state:
 * type: number
 * example: 201
 * msg:
 * type: string
 * example: "Category not found"
 * data:
 * type: 'null'
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * state:
 * type: number
 * example: 500
 * msg:
 * type: string
 * example: "Server Error"
 * data:
 * type: 'null'
 */
router.route('/:id')
    .get(categoryController_1.getCategoryById)
    .put(uploadCategory.single('categoryImage'), categoryController_1.updateCategory) // Use the common Multer instance
    .delete(categoryController_1.deleteCategory);
exports.default = router;
