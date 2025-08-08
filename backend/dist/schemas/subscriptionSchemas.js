"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionSchema = exports.createSubscriptionSchema = void 0;
const zod_1 = require("zod");
exports.createSubscriptionSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: "Subscription name is required" }).min(1),
        title: zod_1.z.string().optional(),
        amount: zod_1.z.coerce.number({ required_error: "Amount is required" }).positive(),
        durationInDays: zod_1.z.coerce.number({ required_error: "Duration is required" }).int().positive(),
        // packages: z.array(z.string()).optional(), // DUMMY FIELD
        courses: zod_1.z.array(zod_1.z.string()).optional(),
        ebooks: zod_1.z.array(zod_1.z.string()).optional(),
        coupons: zod_1.z.array(zod_1.z.string()).optional(),
        status: zod_1.z.enum(['active', 'inactive']).default('active'),
    }),
});
exports.updateSubscriptionSchema = zod_1.z.object({
    body: exports.createSubscriptionSchema.shape.body.partial(),
    params: zod_1.z.object({
        id: zod_1.z.string({ required_error: "Subscription ID is required" }),
    }),
});
