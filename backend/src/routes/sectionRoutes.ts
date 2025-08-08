// src/routes/sectionRoutes.ts
import { Router } from 'express';
import {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection,
} from '../controllers/sectionController';

const router = Router();

/**
 * @swagger
 * tags:
 * - name: Sections
 * description: API for managing content sections
 */

/**
 * @swagger
 * /sections:
 * post:
 * summary: Create a new section
 * tags: [Sections]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Section'
 * examples:
 * createSectionExample:
 * value:
 * sectionName: "Homepage Carousel"
 * status: "active"
 * responses:
 * 201:
 * description: Section created successfully
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Section'
 * 400:
 * description: Bad request (e.g., missing fields, duplicate name)
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 */

/**
 * @swagger
 * /sections:
 * get:
 * summary: Get all sections
 * tags: [Sections]
 * responses:
 * 200:
 * description: A list of sections
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Section'
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 */
router.route('/')
  .post(createSection)
  .get(getSections);

/**
 * @swagger
 * /sections/{id}:
 * get:
 * summary: Get a section by ID
 * tags: [Sections]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The ID of the section to retrieve
 * example: 60c72b1f9b1e8e001c8f4b0f
 * responses:
 * 200:
 * description: Section found
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Section'
 * 404:
 * description: Section not found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 */

/**
 * @swagger
 * /sections/{id}:
 * put:
 * summary: Update a section by ID
 * tags: [Sections]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The ID of the section to update
 * example: 60c72b1f9b1e8e001c8f4b0f
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Section'
 * examples:
 * updateSectionExample:
 * value:
 * sectionName: "Homepage Hero Banner"
 * status: "inactive"
 * responses:
 * 200:
 * description: Section updated successfully
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Section'
 * 400:
 * description: Bad request (e.g., duplicate name)
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * 404:
 * description: Section not found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 */

/**
 * @swagger
 * /sections/{id}:
 * delete:
 * summary: Delete a section by ID
 * tags: [Sections]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The ID of the section to delete
 * example: 60c72b1f9b1e8e001c8f4b0f
 * responses:
 * 200:
 * description: Section removed successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * 404:
 * description: Section not found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 */
router.route('/:id')
  .get(getSectionById)
  .put(updateSection)
  .delete(deleteSection);

export default router;