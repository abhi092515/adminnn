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
exports.deleteAddress = exports.updateAddress = exports.getAddressById = exports.getUserAddresses = exports.createAddress = void 0;
const address_model_1 = __importDefault(require("../models/address.model"));
// Helper function to handle async logic and errors cleanly
const asyncHandler = (fn) => {
    return (req, res) => {
        fn(req, res).catch((error) => {
            console.error(error);
            res.status(500).json({ message: 'An internal server error occurred', error: error.message });
        });
    };
};
exports.createAddress = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newAddress = yield address_model_1.default.create(req.body);
    res.status(201).json(newAddress);
}));
exports.getUserAddresses = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const addresses = yield address_model_1.default.find({ user: req.params.userId });
    if (!addresses || addresses.length === 0) {
        res.status(404).json({ message: 'No addresses found for this user' });
        return; // Use bare return for early exit
    }
    res.status(200).json(addresses);
}));
exports.getAddressById = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const address = yield address_model_1.default.findById(req.params.id);
    if (!address) {
        res.status(404).json({ message: 'Address not found' });
        return; // Use bare return for early exit
    }
    res.status(200).json(address);
}));
exports.updateAddress = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedAddress = yield address_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!updatedAddress) {
        res.status(404).json({ message: 'Address not found' });
        return; // Use bare return for early exit
    }
    res.status(200).json(updatedAddress);
}));
exports.deleteAddress = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const address = yield address_model_1.default.findByIdAndDelete(req.params.id);
    if (!address) {
        res.status(404).json({ message: 'Address not found' });
        return; // Use bare return for early exit
    }
    res.status(204).send();
}));
