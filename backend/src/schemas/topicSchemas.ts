// src/schemas/topicSchemas.ts
import { z } from 'zod';
import { Types } from 'mongoose'; // For ObjectId validation

// Helper to validate Mongoose ObjectId strings (re-use this across your schemas)
const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId format",
});

// Schema for creating a new Topic
export const createTopicSchema = z.object({
  topicName: z.string().min(1, "Topic name is required."),
  status: z.string().min(1, "Status is required").default('active'), // Assuming status is always a string and defaults to 'active'
  section: objectId, // Topic must be linked to a Section
});

// Schema for updating an existing Topic
// All fields are optional because you might only update a subset
export const updateTopicSchema = z.object({
  topicName: z.string().min(1, "Topic name must not be empty.").optional(),
  status: z.string().min(1, "Status must not be empty").optional(),
  section: objectId.optional(), // Can optionally update the linked Section
}).partial(); // .partial() makes all fields optional on the top level