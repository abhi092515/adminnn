"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AddressSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User', // This should match the name of your User model
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    mobile: {
        type: String,
        required: true,
        trim: true,
    },
    alt_mobile: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    pincode: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        trim: true,
    },
    landmark: {
        type: String,
        trim: true,
    },
    state: {
        type: String,
        required: true,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    country: {
        type: String,
        required: true,
        trim: true,
    },
    deliverySlot: {
        type: String,
        required: true,
        enum: {
            values: ['Home', 'Office/Commercial'],
            message: '{VALUE} is not a valid delivery slot. Choose Home or Office/Commercial.',
        },
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});
const Address = (0, mongoose_1.model)('Address', AddressSchema);
exports.default = Address;
