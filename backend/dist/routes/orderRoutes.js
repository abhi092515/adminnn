"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/orderRoutes.ts
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 * - name: Orders
 * description: API for managing orders
 */
/**
 * @swagger
 * /orders:
 * post:
 * summary: Create a new order
 * tags: [Orders]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Order' * examples:
 * createOrderExample:
 * value:
 * orderNumber: "ORD-1234567890-001"
 * user: "60c72b1f9b1e8e001c8f4b0a"
 * course: "60c72b1f9b1e8e001c8f4b0b"
 * amount: 299.99
 * responses:
 * 201:
 * description: Order created successfully
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Order'
 * 400:
 * description: Bad request (e.g., missing fields, invalid references)
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
 * /orders:
 * get:
 * summary: Get all orders with optional filtering
 * tags: [Orders] * parameters:
 * - in: query
 * name: user
 * schema:
 * type: string
 * description: Filter by user ID
 * - in: query
 * name: course
 * schema:
 * type: string
 * description: Filter by course ID
 * - in: query
 * name: startDate
 * schema:
 * type: string
 * format: date-time
 * description: Filter orders created after this date
 * - in: query
 * name: endDate
 * schema:
 * type: string
 * format: date-time
 * description: Filter orders created before this date
 * - in: query
 * name: minAmount
 * schema:
 * type: number
 * description: Filter orders with amount greater than or equal to this value
 * - in: query
 * name: maxAmount
 * schema:
 * type: number
 * description: Filter orders with amount less than or equal to this value
 * responses:
 * 200:
 * description: A list of orders
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Order'
 * 400:
 * description: Invalid filter parameters
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
router.route('/')
    .post(orderController_1.createOrder)
    .get(orderController_1.getOrders);
/**
 * @swagger
 * /orders/{id}:
 * get:
 * summary: Get an order by ID
 * tags: [Orders]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The ID of the order to retrieve
 * example: 60c72b1f9b1e8e001c8f4b11
 * responses:
 * 200:
 * description: Order retrieved successfully
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Order'
 * 404:
 * description: Order not found
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
 * /orders/{id}:
 * put:
 * summary: Update an order
 * tags: [Orders]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The ID of the order to update
 * example: 60c72b1f9b1e8e001c8f4b11
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Order'
 * examples:
 * updateOrderExample:
 * value:
 * status: "completed"
 * paymentStatus: "paid"
 * paymentId: "txn_1234567890"
 * notes: "Payment completed successfully"
 * responses:
 * 200:
 * description: Order updated successfully
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Order'
 * 400:
 * description: Bad request (e.g., invalid fields, duplicate order number)
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * 404:
 * description: Order not found
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
 * /orders/{id}:
 * delete:
 * summary: Delete an order
 * tags: [Orders]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: The ID of the order to delete
 * example: 60c72b1f9b1e8e001c8f4b11
 * responses:
 * 200:
 * description: Order deleted successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * 404:
 * description: Order not found
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
    .get(orderController_1.getOrderById)
    .put(orderController_1.updateOrder)
    .delete(orderController_1.deleteOrder);
/**
 * @swagger
 * /orders/user/{userId}:
 * get:
 * summary: Get orders by user ID
 * tags: [Orders]
 * parameters:
 * - in: path
 * name: userId
 * required: true
 * schema:
 * type: string
 * description: The ID of the user
 * example: 60c72b1f9b1e8e001c8f4b0a
 * responses:
 * 200:
 * description: Orders retrieved successfully
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Order'
 * 404:
 * description: User not found
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
router.post('/user', orderController_1.getOrdersByUser);
/**
 * @swagger
 * /orders/course/{courseId}:
 * get:
 * summary: Get orders by course ID
 * tags: [Orders]
 * parameters:
 * - in: path
 * name: courseId
 * required: true
 * schema:
 * type: string
 * description: The ID of the course
 * example: 60c72b1f9b1e8e001c8f4b0b
 * responses:
 * 200:
 * description: Orders retrieved successfully
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Order'
 * 404:
 * description: Course not found
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
router.get('/course/:courseId', orderController_1.getOrdersByCourse);
exports.default = router;
