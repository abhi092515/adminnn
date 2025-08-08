// import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
// import { createInsertSchema } from "drizzle-zod";
// import { z } from "zod";

// export const users = pgTable("users", {
//   id: serial("id").primaryKey(),
//   username: text("username").notNull().unique(),
//   password: text("password").notNull(),
// });

// export const categories = pgTable("categories", {
//   id: serial("id").primaryKey(),
//   name: text("name").notNull(),
//   description: text("description").notNull(),
//   image: text("image"),
//   status: text("status").notNull().default("active"), // "active" | "inactive"
//   assignedToHeader: boolean("assigned_to_header").notNull().default(false),
//   createdAt: timestamp("created_at").defaultNow(),
// });

// export const sales = pgTable("sales", {
//   id: serial("id").primaryKey(),
//   customerName: text("customer_name").notNull(),
//   customerEmail: text("customer_email").notNull(),
//   amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
//   createdAt: timestamp("created_at").defaultNow(),
// });

// export const analytics = pgTable("analytics", {
//   id: serial("id").primaryKey(),
//   totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).notNull(),
//   subscriptions: integer("subscriptions").notNull(),
//   salesCount: integer("sales_count").notNull(),
//   usersCount: integer("users_count").notNull(),
//   updatedAt: timestamp("updated_at").defaultNow(),
// });

// export const insertUserSchema = createInsertSchema(users).pick({
//   username: true,
//   password: true,
// });

// export const insertCategorySchema = createInsertSchema(categories).omit({
//   id: true,
//   createdAt: true,
// });

// export const insertSaleSchema = createInsertSchema(sales).omit({
//   id: true,
//   createdAt: true,
// });

// export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
//   id: true,
//   updatedAt: true,
// });

// export type InsertUser = z.infer<typeof insertUserSchema>;
// export type User = typeof users.$inferSelect;

// export type InsertCategory = z.infer<typeof insertCategorySchema>;
// export type Category = typeof categories.$inferSelect;

// export type InsertSale = z.infer<typeof insertSaleSchema>;
// export type Sale = typeof sales.$inferSelect;

// export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
// export type Analytics = typeof analytics.$inferSelect;



import { z } from 'zod';
// We don't need Drizzle or Mongoose imports here for the frontend Zod schema.

//--- Schema for the MAIN CATEGORY form ---
export const insertMainCategorySchema = z.object({
  name: z.string().min(1, { message: "Name is required and cannot be empty." }),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  assignedToHeader: z.boolean().optional(),
  image: z.any().optional().nullable(), // For file uploads from the form
});


// --- Schema for the CATEGORY SECTION form ---
export const insertCategorySchema = z.object({
  name: z.string().min(1, { message: "Category name is required." }),
  // This matches the Mongoose rule: the description is required.
  description: z.string().min(1, { message: "Description is required and cannot be empty." }),
  status: z.enum(['active', 'inactive']),
  // This field is not in your Zod schema for the backend, so we can make it optional here
  // and handle it in the hook if needed. Or remove if not used in the form.
  assignedToHeader: z.boolean().optional(),
  image: z.any().optional().nullable(),
  // This makes the dropdown selection for the parent category required.
  mainCategory: z.string({
    required_error: "Parent Main Category is required.",
  }).min(1, { message: "Please select a Parent Main Category." }),
});


// --- TypeScript Type Definitions ---

// Shape of data for the form to submit (for either form)
 export type InsertMainCategory = z.infer<typeof insertMainCategorySchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;


//Shape of data received from the Mongoose API for a MAIN Category
export type MainCategory = {
  id: string; // Mongoose uses string IDs
  mainCategoryName: string;
  mainCategoryImage?: string;
  description?: string;
  status: "active" | "inactive";
  assignedToHeader?: boolean;
};

// Shape of data received from the Mongoose API for a CHILD Category
export type Category = {
  id: string; // Mongoose uses string IDs
  categoryName: string;
  categoryDescription: string;
  categoryImage?: string;
  status: "active" | "inactive";
  mainCategory: {
    id: string;
    mainCategoryName: string;
  };
};

// --- Schema for SECTION ---
export const insertSectionSchema = z.object({
  name: z.string().min(1, { message: "Section name is required." }),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

// --- Section TypeScript Types ---
export type InsertSection = z.infer<typeof insertSectionSchema>;

export type Section = {
  id: string;
  sectionName: string;
  description: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};