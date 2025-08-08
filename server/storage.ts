// import { users, categories, sales, analytics, type User, type InsertUser, type Category, type InsertCategory, type Sale, type InsertSale, type Analytics, type InsertAnalytics } from "@shared/schema";
import {  type MainCategory, type InsertMainCategory } from "@shared/schema";

export interface IStorage {
  // Main Categories
  getMainCategories(): Promise<MainCategory[]>;
  getMainCategory(id: number): Promise<MainCategory | undefined>;
  createMainCategory(category: InsertMainCategory): Promise<MainCategory>;
  updateMainCategory(id: number, category: Partial<InsertMainCategory>): Promise<MainCategory | undefined>;
  deleteMainCategory(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private mainCategories: Map<number, MainCategory>;
  private currentMainCategoryId: number;

  constructor() {
    this.mainCategories = new Map();
    this.currentMainCategoryId = 1;

    this.initializeData();
  }

  private initializeData() {
    const sampleMainCategories: InsertMainCategory[] = [
      {
        name: "Technology",
        description: "All tech related content",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=300&h=200",
        status: "active",
      },
      {
        name: "Art & Design",
        description: "Creative and artistic subjects",
        image: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=300&h=200",
        status: "active",
      },
      {
        name: "Business",
        description: "Business, finance, and leadership",
        image: "https://images.unsplash.com/photo-1523958203904-cdcb402031fd?auto=format&fit=crop&w=300&h=200",
        status: "inactive",
      },
    ];

    sampleMainCategories.forEach(category => {
      const id = this.currentMainCategoryId++;
      this.mainCategories.set(id, {
        ...category,
        id,
        createdAt: new Date(),
        image: category.image || null,
        status: category.status || "active",
      });
    });
  }

  // Main Categories
  async getMainCategories(): Promise<MainCategory[]> {
    return Array.from(this.mainCategories.values()).sort((a, b) => a.id - b.id);
  }

  async getMainCategory(id: number): Promise<MainCategory | undefined> {
    return this.mainCategories.get(id);
  }

  async createMainCategory(insertCategory: InsertMainCategory): Promise<MainCategory> {
    const id = this.currentMainCategoryId++;
    const category: MainCategory = {
      ...insertCategory,
      id,
      createdAt: new Date(),
      image: insertCategory.image || null,
      status: insertCategory.status || "active",
    };
    this.mainCategories.set(id, category);
    return category;
  }

  async updateMainCategory(id: number, updates: Partial<InsertMainCategory>): Promise<MainCategory | undefined> {
    const existing = this.mainCategories.get(id);
    if (!existing) return undefined;

    const updated: MainCategory = { ...existing, ...updates };
    this.mainCategories.set(id, updated);
    return updated;
  }

  async deleteMainCategory(id: number): Promise<boolean> {
    return this.mainCategories.delete(id);
  }
}

export const storage = new MemStorage();
