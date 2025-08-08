import { z } from 'zod';

export const createInstructionSchema = z.object({
    series: z.string().optional(), // ✅ FIX: Made the series field optional
    instruction: z.string().min(1, "Instruction text cannot be empty."),
    status: z.enum(['active', 'inactive']).optional(),
});

export const updateInstructionSchema = createInstructionSchema.partial();