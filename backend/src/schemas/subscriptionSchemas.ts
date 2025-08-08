import { z } from 'zod';

export const createSubscriptionSchema = z.object({
    body: z.object({
        name: z.string({ required_error: "Subscription name is required" }).min(1),
        title: z.string().optional(),
        amount: z.coerce.number({ required_error: "Amount is required" }).positive(),
        durationInDays: z.coerce.number({ required_error: "Duration is required" }).int().positive(),
        // packages: z.array(z.string()).optional(), // DUMMY FIELD
        courses: z.array(z.string()).optional(),
        ebooks: z.array(z.string()).optional(),
        coupons: z.array(z.string()).optional(),
        status: z.enum(['active', 'inactive']).default('active'),
    }),
});

export const updateSubscriptionSchema = z.object({
    body: createSubscriptionSchema.shape.body.partial(),
    params: z.object({
        id: z.string({ required_error: "Subscription ID is required" }),
    }),
});