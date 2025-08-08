import { z } from 'zod';

export const createNotificationSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required',
    }),
    url: z.string().url({
      message: 'Invalid URL format',
    }),
    image: z.string().url({
      message: 'Invalid URL format',
    }),
    videoLink: z.string().url({
      message: 'Invalid URL format',
    }).optional(),
    redirectUrl: z.string().url({
      message: 'Invalid URL format',
    }),
  }),
});

export const updateNotificationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    url: z.string().url({
      message: 'Invalid URL format',
    }).optional(),
    image: z.string().url({
      message: 'Invalid URL format',
    }).optional(),
    videoLink: z.string().url({
      message: 'Invalid URL format',
    }).optional(),
    redirectUrl: z.string().url({
      message: 'Invalid URL format',
    }).optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>['body'];
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;