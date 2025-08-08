"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTopicSchema = exports.createTopicSchema = void 0;
// src/schemas/topicSchemas.ts
const zod_1 = require("zod");
const mongoose_1 = require("mongoose"); // For ObjectId validation
// Helper to validate Mongoose ObjectId strings (re-use this across your schemas)
const objectId = zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});
// Schema for creating a new Topic
exports.createTopicSchema = zod_1.z.object({
    topicName: zod_1.z.string().min(1, "Topic name is required."),
    status: zod_1.z.string().min(1, "Status is required").default('active'), // Assuming status is always a string and defaults to 'active'
    section: objectId, // Topic must be linked to a Section
});
// Schema for updating an existing Topic
// All fields are optional because you might only update a subset
exports.updateTopicSchema = zod_1.z.object({
    topicName: zod_1.z.string().min(1, "Topic name must not be empty.").optional(),
    status: zod_1.z.string().min(1, "Status must not be empty").optional(),
    section: objectId.optional(), // Can optionally update the linked Section
}).partial(); // .partial() makes all fields optional on the top level
