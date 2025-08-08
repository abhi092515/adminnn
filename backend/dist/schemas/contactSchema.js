"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactSchema = void 0;
const zod_1 = require("zod");
exports.contactSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: 'Name is required',
        }).min(3, 'Name must be at least 3 characters long'),
        email: zod_1.z.string({
            required_error: 'Email is required',
        }).email('Not a valid email address'),
        mobileNumber: zod_1.z.string({
            required_error: 'Mobile number is required',
        }).regex(/^\+?[1-9]\d{1,14}$/, 'Invalid mobile number format'),
        message: zod_1.z.string({
            required_error: 'Message is required',
        }).min(10, 'Message must be at least 10 characters long'),
    }),
});
