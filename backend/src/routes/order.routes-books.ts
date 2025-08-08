import { Router } from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from '../controllers/order.controller-books';

const router = Router();

// Route to create a new order
router.post('/', createOrder);

// Specific route to get all orders for a user
router.get('/user/:userId', getUserOrders);

// General routes for a specific order by its database _id
router.route('/:id')
  .get(getOrderById)
  .put(updateOrder)
  .delete(deleteOrder);

export default router;