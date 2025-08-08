// src/schemas/sectionSchemas.ts
import { z } from 'zod';

// Schema for creating a new Section
export const createSectionSchema = z.object({
  sectionName: z.string().min(1, "Section name is required."),
  status: z.string().min(1, "Status is required").default('active'), // Assuming status is always a string and defaults to 'active'
});

// Schema for updating an existing Section
// All fields are optional because you might only update a subset
export const updateSectionSchema = z.object({
  sectionName: z.string().min(1, "Section name must not be empty.").optional(),
  status: z.string().min(1, "Status must not be empty").optional(),
}).partial(); // .partial() makes all fields optional on the top level