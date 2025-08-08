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
exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User")); // Using your existing User model
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// This function creates the JWT token
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        const userExists = yield User_1.default.findOne({ email });
        if (userExists) {
            // --- FIX: Removed 'return' ---
            res.status(400).json({ msg: 'User already exists' });
            return; // Exit function
        }
        const user = yield User_1.default.create({ name, email, password });
        res.status(201).json({
            state: 201,
            msg: 'User registered successfully',
            data: {
                id: user.id,
                email: user.email,
                role: user.role,
                token: generateToken(user.id, user.role)
            }
        });
    }
    catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield User_1.default.findOne({ email }).select('+password');
        if (user && (yield user.comparePassword(password))) {
            res.json({
                state: 200,
                msg: 'Login successful',
                data: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user.id, user.role)
                }
            });
        }
        else {
            // --- FIX: Removed 'return' ---
            res.status(401).json({ state: 401, msg: 'Invalid email or password' });
        }
    }
    catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});
exports.loginUser = loginUser;
