"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSectionSchema = exports.createSectionSchema = void 0;
// src/schemas/sectionSchemas.ts
const zod_1 = require("zod");
// Schema for creating a new Section
exports.createSectionSchema = zod_1.z.object({
    sectionName: zod_1.z.string().min(1, "Section name is required."),
    status: zod_1.z.string().min(1, "Status is required").default('active'), // Assuming status is always a string and defaults to 'active'
});
// Schema for updating an existing Section
// All fields are optional because you might only update a subset
exports.updateSectionSchema = zod_1.z.object({
    sectionName: zod_1.z.string().min(1, "Section name must not be empty.").optional(),
    status: zod_1.z.string().min(1, "Status must not be empty").optional(),
}).partial(); // .partial() makes all fields optional on the top level
