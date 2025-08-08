import { z } from 'zod';

export const createSubTopicSchema = z.object({
    subTopicName: z.string().min(1, "Sub-topic name is required."),
    status: z.enum(['active', 'inactive']).optional(),
    topic: z.string().min(1, "A parent topic must be selected."),
});

export const updateSubTopicSchema = createSubTopicSchema.partial();