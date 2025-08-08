"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/Category.ts
const mongoose_1 = require("mongoose");
const CategorySchema = new mongoose_1.Schema({
    // HIGHLIGHT START
    categoryImage: { type: String, required: false }, // Set 'required' to false in the Mongoose schema
    // HIGHLIGHT END
    categoryName: { type: String, required: true, unique: true },
    categoryDescription: { type: String, required: true },
    assignedToHeader: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    mainCategory: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MainCategory',
        required: true,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
    toObject: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
const Category = (0, mongoose_1.model)('Category', CategorySchema);
exports.default = Category;
