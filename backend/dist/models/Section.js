"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/Section.ts
const mongoose_1 = require("mongoose");
const SectionSchema = new mongoose_1.Schema({
    sectionName: { type: String, required: true, unique: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, {
    timestamps: true,
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
const Section = (0, mongoose_1.model)('Section', SectionSchema);
exports.default = Section;
