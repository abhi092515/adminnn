// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  mainCategories;
  currentMainCategoryId;
  constructor() {
    this.mainCategories = /* @__PURE__ */ new Map();
    this.currentMainCategoryId = 1;
    this.initializeData();
  }
  initializeData() {
    const sampleMainCategories = [
      {
        name: "Technology",
        description: "All tech related content",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=300&h=200",
        status: "active"
      },
      {
        name: "Art & Design",
        description: "Creative and artistic subjects",
        image: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=300&h=200",
        status: "active"
      },
      {
        name: "Business",
        description: "Business, finance, and leadership",
        image: "https://images.unsplash.com/photo-1523958203904-cdcb402031fd?auto=format&fit=crop&w=300&h=200",
        status: "inactive"
      }
    ];
    sampleMainCategories.forEach((category) => {
      const id = this.currentMainCategoryId++;
      this.mainCategories.set(id, {
        ...category,
        id,
        createdAt: /* @__PURE__ */ new Date(),
        image: category.image || null,
        status: category.status || "active"
      });
    });
  }
  // Main Categories
  async getMainCategories() {
    return Array.from(this.mainCategories.values()).sort((a, b) => a.id - b.id);
  }
  async getMainCategory(id) {
    return this.mainCategories.get(id);
  }
  async createMainCategory(insertCategory) {
    const id = this.currentMainCategoryId++;
    const category = {
      ...insertCategory,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      image: insertCategory.image || null,
      status: insertCategory.status || "active"
    };
    this.mainCategories.set(id, category);
    return category;
  }
  async updateMainCategory(id, updates) {
    const existing = this.mainCategories.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.mainCategories.set(id, updated);
    return updated;
  }
  async deleteMainCategory(id) {
    return this.mainCategories.delete(id);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { z } from "zod";
var insertMainCategorySchema = z.object({
  name: z.string().min(1, { message: "Name is required and cannot be empty." }),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  assignedToHeader: z.boolean().optional(),
  image: z.any().optional().nullable()
  // For file uploads from the form
});
var insertCategorySchema = z.object({
  name: z.string().min(1, { message: "Category name is required." }),
  // This matches the Mongoose rule: the description is required.
  description: z.string().min(1, { message: "Description is required and cannot be empty." }),
  status: z.enum(["active", "inactive"]),
  // This field is not in your Zod schema for the backend, so we can make it optional here
  // and handle it in the hook if needed. Or remove if not used in the form.
  assignedToHeader: z.boolean().optional(),
  image: z.any().optional().nullable(),
  // This makes the dropdown selection for the parent category required.
  mainCategory: z.string({
    required_error: "Parent Main Category is required."
  }).min(1, { message: "Please select a Parent Main Category." })
});
var insertSectionSchema = z.object({
  name: z.string().min(1, { message: "Section name is required." }),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active")
});

// server/routes.ts
import multer from "multer";
import path from "path";
var upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  }
});
async function registerRoutes(app2) {
  app2.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      if (!analytics) {
        return res.status(404).json({ message: "Analytics not found" });
      }
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/sales/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const sales = await storage.getRecentSales(limit);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent sales" });
    }
  });
  app2.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.get("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });
  app2.post("/api/categories", upload.single("image"), async (req, res) => {
    try {
      const categoryData = {
        name: req.body.name,
        description: req.body.description,
        status: req.body.status || "active",
        assignedToHeader: req.body.assignedToHeader === "true" || req.body.assignedToHeader === true,
        image: req.file ? `/uploads/${req.file.filename}` : req.body.image || null
      };
      const validatedData = insertCategorySchema.parse(categoryData);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  });
  app2.put("/api/categories/:id", upload.single("image"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      const existingCategory = await storage.getCategory(id);
      if (!existingCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      const updateData = {};
      if (req.body.name !== void 0) updateData.name = req.body.name;
      if (req.body.description !== void 0) updateData.description = req.body.description;
      if (req.body.status !== void 0) updateData.status = req.body.status;
      if (req.body.assignedToHeader !== void 0) {
        updateData.assignedToHeader = req.body.assignedToHeader === "true" || req.body.assignedToHeader === true;
      }
      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      } else if (req.body.image !== void 0) {
        updateData.image = req.body.image;
      }
      const category = await storage.updateCategory(id, updateData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update category" });
      }
    }
  });
  app2.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      const deleted = await storage.deleteCategory(id);
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  app2.use("/uploads", async (req, res, next) => {
    res.status(404).json({ message: "File not found" });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT || 5009;
  server.listen(port, () => {
    log(`Server listening on port ${port}`);
  });
})();
