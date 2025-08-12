"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubTopicSchema = exports.createSubTopicSchema = void 0;
const zod_1 = require("zod");
exports.createSubTopicSchema = zod_1.z.object({
    subTopicName: zod_1.z.string().min(1, "Sub-topic name is required."),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
    topic: zod_1.z.string().min(1, "A parent topic must be selected."),
});
exports.updateSubTopicSchema = exports.createSubTopicSchema.partial();
