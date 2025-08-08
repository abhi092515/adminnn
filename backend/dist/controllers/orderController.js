"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersByCourse = exports.getOrdersByUser = exports.deleteOrder = exports.updateOrder = exports.getOrderById = exports.getOrders = exports.createOrder = void 0;
const mongoose_1 = require("mongoose");
const Order_books_1 = __importDefault(require("../models/Order-books"));
// Remove User import since we're not managing users locally
const Course_1 = __importDefault(require("../models/Course"));
const courseProgressUtils_1 = require("../utils/courseProgressUtils");
// Import Zod schemas
const orderSchemas_1 = require("../schemas/orderSchemas");
// Helper function to check if a referenced ID is valid and exists
const validateReference = (model, id, modelName, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: `Invalid ${modelName} ID provided.` });
        return false;
    }
    const exists = yield model.findById(id);
    if (!exists) {
        res.status(404).json({ message: `${modelName} not found.` });
        return false;
    }
    return true;
});
// Helper function to generate unique order number
const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
};
// @desc    Create a new Order
// @route   POST /api/orders
// @access  Public
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Zod validation
        const validationResult = orderSchemas_1.createOrderSchema.safeParse(req.body);
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
        const validatedData = validationResult.data;
        // Validate referenced course
        if (!(yield validateReference(Course_1.default, validatedData.courseId, 'Course', res)))
            return; // Check if user already has an order for this course
        const existingOrder = yield Order_books_1.default.findOne({
            userId: validatedData.userId,
            courseId: validatedData.courseId
        });
        if (existingOrder) {
            res.status(400).json({
                message: 'User already has an order for this course',
                existingOrderId: existingOrder._id
            });
            return;
        }
        const orderData = Object.assign(Object.assign({}, validatedData), { orderNumber: generateOrderNumber() });
        const newOrder = new Order_books_1.default(orderData);
        const createdOrder = yield newOrder.save();
        // Populate only the course (no user population since it's external)
        const populatedOrder = yield Order_books_1.default.findById(createdOrder._id)
            .populate('courseId', 'title banner');
        res.status(201).json(populatedOrder);
    }
    catch (error) {
        if (error.code === 11000) {
            // Check if it's the user-course compound key violation
            if (error.keyPattern && error.keyPattern.userId && error.keyPattern.courseId) {
                res.status(400).json({
                    message: 'User already has an order for this course',
                    error: 'Duplicate order not allowed'
                });
            }
            else {
                // Other duplicate key errors (like orderNumber)
                res.status(400).json({ message: 'Duplicate order number. Please try again.' });
            }
            return;
        }
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.createOrder = createOrder;
// @desc    Get all Orders with optional filtering
// @route   GET /api/orders
// @access  Public
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate query parameters
        const filterValidation = orderSchemas_1.orderFilterSchema.safeParse(req.query);
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
        const filters = filterValidation.data; // Build query object
        const query = {};
        if (filters.user)
            query.userId = filters.user;
        if (filters.course)
            query.courseId = filters.course;
        // Date range filter
        if (filters.startDate || filters.endDate) {
            query.createdAt = {};
            if (filters.startDate)
                query.createdAt.$gte = new Date(filters.startDate);
            if (filters.endDate)
                query.createdAt.$lte = new Date(filters.endDate);
        }
        const orders = yield Order_books_1.default.find(query)
            .populate('courseId', 'title banner')
            .sort({ createdAt: -1 }); // Sort by newest first
        if (orders.length > 0) {
            res.status(200).json(orders);
        }
        else {
            res.status(200).json([]);
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.getOrders = getOrders;
// @desc    Get a single Order by ID
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield Order_books_1.default.findById(req.params.id)
            .populate('courseId', 'title banner assignHeader description');
        if (order) {
            res.status(200).json(order);
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.getOrderById = getOrderById;
// @desc    Update an Order
// @route   PUT /api/orders/:id
// @access  Public
const updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Zod validation for update
        const validationResult = orderSchemas_1.updateOrderSchema.safeParse(req.body);
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
        const updates = validationResult.data;
        // Validate referenced course if being updated
        if (updates.courseId && !(yield validateReference(Course_1.default, updates.courseId, 'Course', res)))
            return;
        const orderItem = yield Order_books_1.default.findById(req.params.id);
        if (orderItem) {
            // Apply updates from validated data
            Object.assign(orderItem, updates);
            const updatedOrder = yield orderItem.save(); // Populate the referenced fields for the response
            const populatedOrder = yield Order_books_1.default.findById(updatedOrder._id)
                .populate('courseId', 'title banner');
            res.status(200).json(populatedOrder);
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Duplicate order number error.' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.updateOrder = updateOrder;
// @desc    Delete an Order
// @route   DELETE /api/orders/:id
// @access  Public
const deleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield Order_books_1.default.findById(req.params.id);
        if (order) {
            yield Order_books_1.default.deleteOne({ _id: order._id });
            res.status(200).json({ message: 'Order removed' });
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.deleteOrder = deleteOrder;
// @desc    Get Orders by User ID
// @route   POST /api/orders/user/
// @access  Public
const getOrdersByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request body
        const validationResult = orderSchemas_1.getOrdersByUserSchema.safeParse(req.body);
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
        const { userId, isLive } = validationResult.data;
        const orders = yield Order_books_1.default.find({ userId: userId })
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
            const course = order.courseId;
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
            .map(order => order.courseId)
            .filter(courseId => courseId && mongoose_1.Types.ObjectId.isValid(courseId._id || courseId))
            .map(courseId => new mongoose_1.Types.ObjectId(courseId._id || courseId));
        // Calculate progress for all courses
        let courseProgressMap = {};
        if (courseIds.length > 0) {
            try {
                const progressResults = yield (0, courseProgressUtils_1.calculateMultipleCourseProgress)(courseIds, userId);
                courseProgressMap = progressResults.reduce((map, progress) => {
                    map[progress.courseId] = progress.progressPercentage;
                    return map;
                }, {});
            }
            catch (progressError) {
                console.error('Error calculating course progress:', progressError);
                // Continue without progress data if calculation fails
            }
        } // Add progress percentage and additional data to each filtered order
        const ordersWithProgress = filteredOrders.map(order => {
            var _a, _b, _c, _d;
            const orderObj = order.toObject();
            const courseId = ((_b = (_a = orderObj.courseId) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) || ((_c = orderObj.courseId) === null || _c === void 0 ? void 0 : _c.toString());
            const course = orderObj.courseId;
            // Add progress percentage
            orderObj.progressPercentage = courseProgressMap[courseId] || 0;
            // Add faculty name
            orderObj.facultyName = ((_d = course === null || course === void 0 ? void 0 : course.facultyDetails) === null || _d === void 0 ? void 0 : _d.name) || null;
            // Calculate course start and end dates from classes
            if ((course === null || course === void 0 ? void 0 : course.classes) && Array.isArray(course.classes) && course.classes.length > 0) {
                const validDates = course.classes
                    .filter((cls) => cls.startDate && cls.endDate)
                    .map((cls) => ({
                    startDate: new Date(cls.startDate),
                    endDate: new Date(cls.endDate)
                }));
                if (validDates.length > 0) {
                    // Find earliest start date and latest end date
                    const startDates = validDates.map((d) => d.startDate);
                    const endDates = validDates.map((d) => d.endDate);
                    orderObj.courseStartDate = new Date(Math.min(...startDates.map((d) => d.getTime())));
                    orderObj.courseEndDate = new Date(Math.max(...endDates.map((d) => d.getTime())));
                }
                else {
                    orderObj.courseStartDate = null;
                    orderObj.courseEndDate = null;
                }
            }
            else {
                orderObj.courseStartDate = null;
                orderObj.courseEndDate = null;
            }
            return orderObj;
        });
        res.status(200).json({
            state: 200,
            msg: 'Orders retrieved successfully',
            data: ordersWithProgress
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.getOrdersByUser = getOrdersByUser;
// @desc    Get Orders by Course ID
// @route   GET /api/orders/course/:courseId
// @access  Public
const getOrdersByCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        // Validate course ID
        if (!(yield validateReference(Course_1.default, courseId, 'Course', res)))
            return;
        const orders = yield Order_books_1.default.find({ courseId: courseId })
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});
exports.getOrdersByCourse = getOrdersByCourse;
