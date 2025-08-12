"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInstructionSchema = exports.createInstructionSchema = void 0;
const zod_1 = require("zod");
exports.createInstructionSchema = zod_1.z.object({
    series: zod_1.z.string().optional(), // ✅ FIX: Made the series field optional
    instruction: zod_1.z.string().min(1, "Instruction text cannot be empty."),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
exports.updateInstructionSchema = exports.createInstructionSchema.partial();
