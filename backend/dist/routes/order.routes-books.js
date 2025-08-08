"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_books_1 = require("../controllers/order.controller-books");
const router = (0, express_1.Router)();
// Route to create a new order
router.post('/', order_controller_books_1.createOrder);
// Specific route to get all orders for a user
router.get('/user/:userId', order_controller_books_1.getUserOrders);
// General routes for a specific order by its database _id
router.route('/:id')
    .get(order_controller_books_1.getOrderById)
    .put(order_controller_books_1.updateOrder)
    .delete(order_controller_books_1.deleteOrder);
exports.default = router;
