"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotificationSchema = exports.createNotificationSchema = void 0;
const zod_1 = require("zod");
exports.createNotificationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({
            required_error: 'Title is required',
        }),
        url: zod_1.z.string().url({
            message: 'Invalid URL format',
        }),
        image: zod_1.z.string().url({
            message: 'Invalid URL format',
        }),
        videoLink: zod_1.z.string().url({
            message: 'Invalid URL format',
        }).optional(),
        redirectUrl: zod_1.z.string().url({
            message: 'Invalid URL format',
        }),
    }),
});
exports.updateNotificationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        url: zod_1.z.string().url({
            message: 'Invalid URL format',
        }).optional(),
        image: zod_1.z.string().url({
            message: 'Invalid URL format',
        }).optional(),
        videoLink: zod_1.z.string().url({
            message: 'Invalid URL format',
        }).optional(),
        redirectUrl: zod_1.z.string().url({
            message: 'Invalid URL format',
        }).optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
});
