"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/MainCategory.ts
const mongoose_1 = require("mongoose");
const mainCategorySchema = new mongoose_1.Schema({
    mainCategoryName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    mainCategoryImage: { type: String }, // This field will store the S3 URL
    description: { type: String },
    assignedToHeader: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            // These lines are correctly placed at the top to ensure 'id' is created first
            ret.id = ret._id.toString(); // Convert _id to string and rename to 'id'
            delete ret._id; // Remove the original _id field
            delete ret.__v; // Remove the __v (version key) field
            return ret;
        },
    },
    toObject: {
        virtuals: true,
        transform: (doc, ret) => {
            // Same correct order for toObject consistency
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
const MainCategory = (0, mongoose_1.model)('MainCategory', mainCategorySchema);
exports.default = MainCategory;
