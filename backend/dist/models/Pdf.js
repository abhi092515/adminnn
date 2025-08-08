"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/Pdf.ts
const mongoose_1 = require("mongoose");
const pdfSchema = new mongoose_1.Schema({
    link: { type: String },
    status: { type: String, required: true, default: 'active' },
    isChat: { type: Boolean, required: true, default: false },
    isFree: { type: Boolean, required: true, default: false },
    teacherName: { type: String, required: true },
    priority: { type: Number, required: true, default: 0 },
    isLive: { type: Boolean, required: true, default: false },
    image: { type: String },
    title: { type: String, required: true, unique: true }, // Title should be unique for PDFs
    uploadPdf: { type: String, required: true }, // The URL where the PDF file is hosted
    description: { type: String },
    mainCategory: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MainCategory', required: true },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true },
    section: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Section', required: true },
    topic: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic', required: true },
    courseBanner: { type: String }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    // --- ADD THESE SCHEMA OPTIONS HERE ---
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            // 1. Convert _id to string and add as 'id' at the beginning
            ret.id = ret._id.toString();
            // 2. Remove the original _id and __v fields
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
    // --- END OF SCHEMA OPTIONS ---
});
const Pdf = (0, mongoose_1.model)('Pdf', pdfSchema);
exports.default = Pdf;
