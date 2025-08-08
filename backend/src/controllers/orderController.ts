// src/controllers/orderController.ts
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Order, { IOrder } from '../models/Order-books';
// Remove User import since we're not managing users locally
import Course from '../models/Course';
import { calculateMultipleCourseProgress } from '../utils/courseProgressUtils';

// Import Zod schemas
import {
    createOrderSchema,
    updateOrderSchema,
    getOrderByIdBodySchema,
    orderFilterSchema,
    getOrdersByUserSchema
} from '../schemas/orderSchemas';
import { z } from 'zod';



// Helper function to check if a referenced ID is valid and exists
const validateReference = async (
    model: any,
    id: string | Types.ObjectId,
    modelName: string,
    res: Response
): Promise<boolean> => {
    if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: `Invalid ${modelName} ID provided.` });
        return false;
    }
    const exists = await model.findById(id);
    if (!exists) {
        res.status(404).json({ message: `${modelName} not found.` });
        return false;
    }
    return true;
};

// Helper function to generate unique order number
const generateOrderNumber = (): string => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
};

// @desc    Create a new Order
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        // Zod validation
        const validationResult = createOrderSchema.safeParse(req.body);

        if (!validationResult.success) {
            res.status(400).json({
                message: 'Validation failed',
                errors: validationResult.error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            });
            return;
        } const validatedData = validationResult.data;

        // Validate referenced course
        if (!(await validateReference(Course, validatedData.courseId, 'Course', res))) return;// Check if user already has an order for this course
        const existingOrder = await Order.findOne({
            userId: validatedData.userId,
            courseId: validatedData.courseId
        });

        if (existingOrder) {
            res.status(400).json({
                message: 'User already has an order for this course',
                existingOrderId: existingOrder._id
            });
            return;
        } const orderData = {
            ...validatedData,
            orderNumber: generateOrderNumber()
        };

        const newOrder: IOrder = new Order(orderData);
        const createdOrder = await newOrder.save();

        // Populate only the course (no user population since it's external)
        const populatedOrder = await Order.findById(createdOrder._id)
            .populate('courseId', 'title banner');

        res.status(201).json(populatedOrder);
    } catch (error: any) {
        if (error.code === 11000) {
            // Check if it's the user-course compound key violation
            if (error.keyPattern && error.keyPattern.userId && error.keyPattern.courseId) {
                res.status(400).json({
                    message: 'User already has an order for this course',
                    error: 'Duplicate order not allowed'
                });
            } else {
                // Other duplicate key errors (like orderNumber)
                res.status(400).json({ message: 'Duplicate order number. Please try again.' });
            }
            return;
        }
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get all Orders with optional filtering
// @route   GET /api/orders
// @access  Public
export const getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate query parameters
        const filterValidation = orderFilterSchema.safeParse(req.query);

        if (!filterValidation.success) {
            res.status(400).json({
                message: 'Invalid filter parameters',
                errors: filterValidation.error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            });
            return;
        }

        const filters = filterValidation.data;        // Build query object
        const query: any = {};

        if (filters.user) query.userId = filters.user;
        if (filters.course) query.courseId = filters.course;

        // Date range filter
        if (filters.startDate || filters.endDate) {
            query.createdAt = {};
            if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
            if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
        } const orders = await Order.find(query)
            .populate('courseId', 'title banner')
            .sort({ createdAt: -1 }); // Sort by newest first

        if (orders.length > 0) {
            res.status(200).json(orders);
        } else {
            res.status(200).json([]);
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get a single Order by ID
// @route   GET /api/orders/:id
// @access  Public
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('courseId', 'title banner assignHeader description');

        if (order) {
            res.status(200).json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Update an Order
// @route   PUT /api/orders/:id
// @access  Public
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        // Zod validation for update
        const validationResult = updateOrderSchema.safeParse(req.body);

        if (!validationResult.success) {
            res.status(400).json({
                message: 'Validation failed',
                errors: validationResult.error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            });
            return;
        } const updates = validationResult.data;

        // Validate referenced course if being updated
        if (updates.courseId && !(await validateReference(Course, updates.courseId, 'Course', res))) return;

        const orderItem: IOrder | null = await Order.findById(req.params.id);

        if (orderItem) {


            // Apply updates from validated data
            Object.assign(orderItem, updates);

            const updatedOrder = await orderItem.save();            // Populate the referenced fields for the response
            const populatedOrder = await Order.findById(updatedOrder._id)
                .populate('courseId', 'title banner');

            res.status(200).json(populatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Duplicate order number error.' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Delete an Order
// @route   DELETE /api/orders/:id
// @access  Public
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            await Order.deleteOne({ _id: order._id });
            res.status(200).json({ message: 'Order removed' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get Orders by User ID
// @route   POST /api/orders/user/
// @access  Public
export const getOrdersByUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate request body
        const validationResult = getOrdersByUserSchema.safeParse(req.body);

        if (!validationResult.success) {
            res.status(400).json({
                message: 'Validation failed',
                errors: validationResult.error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            });
            return;
        }

        const { userId, isLive } = validationResult.data;        const orders = await Order.find({ userId: userId })
            .populate({
                path: 'courseId', 
                select: 'title banner assignHeader isLive facultyDetails',
    
            })
            .sort({ createdAt: -1 });
            
        if (orders.length === 0) {
            res.status(200).json({
            state: 204,
            msg: 'No orders found for the specified criteria',
            data: []
        });
            return;
        }        
        // Filter orders based on course isLive status
        const filteredOrders = orders.filter(order => {
            const course = order.courseId as any;
            return course && course.isLive === isLive;
        });

        if (filteredOrders.length === 0) {
            res.status(200).json({
            state: 204,
            msg: 'No orders found for the specified criteria',
            data: []
        });
            return;
        }

        // Extract course IDs for progress calculation
        const courseIds = filteredOrders
            .map(order => order.courseId as any)
            .filter(courseId => courseId && Types.ObjectId.isValid(courseId._id || courseId))
            .map(courseId => new Types.ObjectId(courseId._id || courseId));

        // Calculate progress for all courses
        let courseProgressMap: { [key: string]: number } = {};

        if (courseIds.length > 0) {
            try {
                const progressResults = await calculateMultipleCourseProgress(courseIds, userId);
                courseProgressMap = progressResults.reduce((map, progress) => {
                    map[progress.courseId] = progress.progressPercentage;
                    return map;
                }, {} as { [key: string]: number });
            } catch (progressError) {
                console.error('Error calculating course progress:', progressError);
                // Continue without progress data if calculation fails
            }
        }        // Add progress percentage and additional data to each filtered order
        const ordersWithProgress = filteredOrders.map(order => {
            const orderObj = order.toObject() as any;
            const courseId = orderObj.courseId?._id?.toString() || orderObj.courseId?.toString();
            const course = orderObj.courseId;
            
            // Add progress percentage
            orderObj.progressPercentage = courseProgressMap[courseId] || 0;
            
            // Add faculty name
            orderObj.facultyName = course?.facultyDetails?.name || null;
            
            // Calculate course start and end dates from classes
            if (course?.classes && Array.isArray(course.classes) && course.classes.length > 0) {
                const validDates = course.classes
                    .filter((cls: any) => cls.startDate && cls.endDate)
                    .map((cls: any) => ({
                        startDate: new Date(cls.startDate),
                        endDate: new Date(cls.endDate)
                    }));
                  if (validDates.length > 0) {
                    // Find earliest start date and latest end date
                    const startDates = validDates.map((d: any) => d.startDate);
                    const endDates = validDates.map((d: any) => d.endDate);
                    
                    orderObj.courseStartDate = new Date(Math.min(...startDates.map((d: Date) => d.getTime())));
                    orderObj.courseEndDate = new Date(Math.max(...endDates.map((d: Date) => d.getTime())));
                } else {
                    orderObj.courseStartDate = null;
                    orderObj.courseEndDate = null;
                }
            } else {
                orderObj.courseStartDate = null;
                orderObj.courseEndDate = null;
            }
            
            return orderObj;
        })

        res.status(200).json({
            state: 200,
            msg: 'Orders retrieved successfully',
            data: ordersWithProgress
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get Orders by Course ID
// @route   GET /api/orders/course/:courseId
// @access  Public
export const getOrdersByCourse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { courseId } = req.params;

        // Validate course ID
        if (!(await validateReference(Course, courseId, 'Course', res))) return; const orders = await Order.find({ courseId: courseId })
            .sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};