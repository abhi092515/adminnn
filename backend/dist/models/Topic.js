"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/Topic.ts
const mongoose_1 = require("mongoose");
const TopicSchema = new mongoose_1.Schema({
    topicName: { type: String, required: true, unique: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    section: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Section', // This links it to the 'Section' model
        required: true,
    },
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
const Topic = (0, mongoose_1.model)('Topic', TopicSchema);
exports.default = Topic;
