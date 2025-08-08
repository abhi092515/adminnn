import { z } from 'zod';

export const contactSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }).min(3, 'Name must be at least 3 characters long'),

    email: z.string({
      required_error: 'Email is required',
    }).email('Not a valid email address'),

    mobileNumber: z.string({
      required_error: 'Mobile number is required',
    }).regex(/^\+?[1-9]\d{1,14}$/, 'Invalid mobile number format'),
    
    message: z.string({
      required_error: 'Message is required',
    }).min(10, 'Message must be at least 10 characters long'),
  }),
});