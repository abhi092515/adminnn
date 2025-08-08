import { Request, Response } from 'express';
import Order from '../models/order.model';
import { customAlphabet } from 'nanoid';

// Helper function to handle async logic and errors
const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>) => {
  return (req: Request, res: Response) => {
    fn(req, res).catch((error) => {
      console.error(error);
      res.status(500).json({ message: 'An internal server error occurred', error: error.message });
    });
  };
};

// @desc    Create a new order
// @route   POST /api/orders
export const createOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    user_id,
    product_id,
    address_id,
    price_per_quantity,
    total_quantity,
    shipping_charge = 0, // Default shipping charge to 0 if not provided
    ...otherFields
  } = req.body;

  // 1. Calculate total_price
  const calculatedTotalPrice = (price_per_quantity * total_quantity) + shipping_charge;

  // 2. Generate a unique order_id
  const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);
  const uniqueOrderId = `ORD-${nanoid()}`;

  // 3. Create the order document
  const orderData = {
    user_id,
    product_id,
    address_id,
    price_per_quantity,
    total_quantity,
    shipping_charge,
    total_price: calculatedTotalPrice,
    order_id: uniqueOrderId,
    ...otherFields,
  };

  const newOrder = await Order.create(orderData);
  res.status(201).json(newOrder);
});

// @desc    Get all orders for a specific user
// @route   GET /api/orders/user/:userId
export const getUserOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const orders = await Order.find({ user_id: req.params.userId })
  .populate('product_id', 'title author image1') // Populate with book details including image1
    .populate('address_id'); // Populate with address details

  res.status(200).json(orders);
});

// @desc    Get a single order by its ID
// @route   GET /api/orders/:id
export const getOrderById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const order = await Order.findById(req.params.id)
    .populate('product_id')
    .populate('address_id')
    .populate('user_id', 'name email'); // Populate with user's name and email

  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }
  res.status(200).json(order);
});

// @desc    Update an order (e.g., payment or order status)
// @route   PUT /api/orders/:id
export const updateOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedOrder) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }
  res.status(200).json(updatedOrder);
});

// @desc    Delete an order
// @route   DELETE /api/orders/:id
export const deleteOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }
  res.status(204).send();
});