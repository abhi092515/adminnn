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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updateOrder = exports.getOrderById = exports.getUserOrders = exports.createOrder = void 0;
const order_model_1 = __importDefault(require("../models/order.model"));
const nanoid_1 = require("nanoid");
// Helper function to handle async logic and errors
const asyncHandler = (fn) => {
    return (req, res) => {
        fn(req, res).catch((error) => {
            console.error(error);
            res.status(500).json({ message: 'An internal server error occurred', error: error.message });
        });
    };
};
// @desc    Create a new order
// @route   POST /api/orders
exports.createOrder = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { user_id, product_id, address_id, price_per_quantity, total_quantity, shipping_charge = 0 } = _a, // Default shipping charge to 0 if not provided
    otherFields = __rest(_a, ["user_id", "product_id", "address_id", "price_per_quantity", "total_quantity", "shipping_charge"]);
    // 1. Calculate total_price
    const calculatedTotalPrice = (price_per_quantity * total_quantity) + shipping_charge;
    // 2. Generate a unique order_id
    const nanoid = (0, nanoid_1.customAlphabet)('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);
    const uniqueOrderId = `ORD-${nanoid()}`;
    // 3. Create the order document
    const orderData = Object.assign({ user_id,
        product_id,
        address_id,
        price_per_quantity,
        total_quantity,
        shipping_charge, total_price: calculatedTotalPrice, order_id: uniqueOrderId }, otherFields);
    const newOrder = yield order_model_1.default.create(orderData);
    res.status(201).json(newOrder);
}));
// @desc    Get all orders for a specific user
// @route   GET /api/orders/user/:userId
exports.getUserOrders = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield order_model_1.default.find({ user_id: req.params.userId })
        .populate('product_id', 'title author image1') // Populate with book details including image1
        .populate('address_id'); // Populate with address details
    res.status(200).json(orders);
}));
// @desc    Get a single order by its ID
// @route   GET /api/orders/:id
exports.getOrderById = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.default.findById(req.params.id)
        .populate('product_id')
        .populate('address_id')
        .populate('user_id', 'name email'); // Populate with user's name and email
    if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
    }
    res.status(200).json(order);
}));
// @desc    Update an order (e.g., payment or order status)
// @route   PUT /api/orders/:id
exports.updateOrder = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedOrder = yield order_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!updatedOrder) {
        res.status(404).json({ message: 'Order not found' });
        return;
    }
    res.status(200).json(updatedOrder);
}));
// @desc    Delete an order
// @route   DELETE /api/orders/:id
exports.deleteOrder = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.default.findByIdAndDelete(req.params.id);
    if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
    }
    res.status(204).send();
}));
