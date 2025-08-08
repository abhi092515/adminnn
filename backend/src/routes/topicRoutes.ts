// src/routes/topicRoutes.ts
import { Router } from 'express';
import {
  createTopic,
  getTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
} from '../controllers/topicController';

const router = Router();

/**
 * @swagger
 * tags:
 * - name: Topics
 * description: API for managing content topics with section relationships
 */

/**
 * @swagger
 * /topics:
 * post:
 * summary: Create a new topic
 * tags: [Topics]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Topic'
 * examples:
 * createTopicExample:
 * value:
 * topicName: "Latest News"
 * status: "active"
 * section: "60c72b1f9b1e8e001c8f4b0f" # Example Section ID
 * responses:
 * 201:
 * description: Topic created successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * _id:
 * type: string
 * description: The auto-generated ID of the topic
 * example: 60c72b1f9b1e8e001c8f4b10
 * topicName:
 * type: string
 * example: "Latest News"
 * status:
 * type: string
 * example: "active"
 * section:
 * type: object
 * properties:
 * _id:
 * type: string
 * description: The ID of the associated section
 * example: 60c72b1f9b1e8e001c8f4b0f
 * sectionName:
 * type: string
 * example: "Homepage Carousel"
 * createdAt:
 * type: string
 * format: date-time
 * updatedAt:
 * type: string
 * format: date-time
 * createdAt:
 * type: string
 * format: date-time
 * updatedAt:
 * type: string
 * format: date-time
 * 400:
 * description: Bad request (e.g., missing fields, duplicate name, invalid section ID)
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * 404:
 * description: Associated Section not found
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
 * /topics:
 * get:
 * summary: Get all topics
 * tags: [Topics]
 * responses:
 * 200:
 * description: A list of topics
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * _id:
 * type: string
 * description: The auto-generated ID of the topic
 * example: 60c72b1f9b1e8e001c8f4b10
 * topicName:
 * type: string
 * example: "Latest News"
 * status:
 * type: string
 * example: "active"
 * section:
 * type: object
 * properties:
 * _id:
 * type: string
 * description: The ID of the associated section
 * example: 60c72b1f9b1e8e001c8f4b0f
 * sectionName:
 * type: string
 * example: "Homepage Carousel"
 * createdAt:
 * type: string
 * format: date-time
 * updatedAt:
 * type: string
 * format: date-time
 * createdAt:
 * type: string
 * format: date-time
 * updatedAt:
 * type: string
 * format: date-time
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
  .post(createTopic)
  .get(getTopics);

/**
 * @swagger
 * /topics/{id}:
 * get:
 * summary: Get a topic by ID
 * tags: [Topics]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The ID of the topic to retrieve
 * example: 60c72b1f9b1e8e001c8f4b10
 * responses:
 * 200:
 * description: Topic found
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * _id:
 * type: string
 * description: The auto-generated ID of the topic
 * example: 60c72b1f9b1e8e001c8f4b10
 * topicName:
 * type: string
 * example: "Latest News"
 * status:
 * type: string
 * example: "active"
 * section:
 * type: object
 * properties:
 * _id:
 * type: string
 * description: The ID of the associated section
 * example: 60c72b1f9b1e8e001c8f4b0f
 * sectionName:
 * type: string
 * example: "Homepage Carousel"
 * createdAt:
 * type: string
 * format: date-time
 * updatedAt:
 * type: string
 * format: date-time
 * 404:
 * description: Topic not found
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
 * /topics/{id}:
 * put:
 * summary: Update a topic by ID
 * tags: [Topics]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The ID of the topic to update
 * example: 60c72b1f9b1e8e001c8f4b10
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Topic'
 * examples:
 * updateTopicExample:
 * value:
 * topicName: "Seasonal Offers"
 * status: "inactive"
 * section: "60c72b1f9b1e8e001c8f4b0f" # Example Section ID
 * responses:
 * 200:
 * description: Topic updated successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * _id:
 * type: string
 * description: The auto-generated ID of the topic
 * example: 60c72b1f9b1e8e001c8f4b10
 * topicName:
 * type: string
 * example: "Seasonal Offers"
 * status:
 * type: string
 * example: "inactive"
 * section:
 * type: object
 * properties:
 * _id:
 * type: string
 * description: The ID of the associated section
 * example: 60c72b1f9b1e8e001c8f4b0f
 * sectionName:
 * type: string
 * example: "Homepage Carousel"
 * createdAt:
 * type: string
 * format: date-time
 * updatedAt:
 * type: string
 * format: date-time
 * 400:
 * description: Bad request (e.g., duplicate name, invalid section ID)
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * 404:
 * description: Topic or Section not found
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
 * /topics/{id}:
 * delete:
 * summary: Delete a topic by ID
 * tags: [Topics]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The ID of the topic to delete
 * example: 60c72b1f9b1e8e001c8f4b10
 * responses:
 * 200:
 * description: Topic removed successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * 404:
 * description: Topic not found
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
  .get(getTopicById)
  .put(updateTopic)
  .delete(deleteTopic);

export default router;