import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Category, type InsertCategory } from "@shared/schema";
import { toast } from "sonner";

// Changed API endpoint for this hook
const API_BASE_URL = "http://localhost:5099/api/categories";

type ApiResponse<T> = {
  state: number;
  msg: string;
  data: T;
};

// Renamed hook to be specific for this section
export function useCategorySection() {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    // Changed queryKey to avoid conflicts with main categories
    queryKey: ["category-section"], 
    queryFn: async (): Promise<Category[]> => {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const result: ApiResponse<Category[]> = await response.json();
      return result.data;
    },
  });

  const createCategory = useMutation({
    mutationFn: async (data: InsertCategory) => {
      const formData = new FormData();
      // Use field names for 'Category' based on your controller
      formData.append("categoryName", data.name);
      formData.append("categoryDescription", data.description);
      formData.append("status", data.status);
      formData.append("mainCategory", data.mainCategory); // This field is required
      if (data.image) {
        formData.append("categoryImage", data.image);
      }

      const response = await fetch(API_BASE_URL, { method: "POST", body: formData });
      if (!response.ok) {
        const errorPayload = await response.json();
        throw new Error(errorPayload.msg || "Failed to create category");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Category created successfully!");
      queryClient.invalidateQueries({ queryKey: ["category-section"] });
    },
    onError: (err: Error) => { toast.error(err.message); },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCategory> }) => {
      const formData = new FormData();
      // Use correct field names for updating
      if (data.name !== undefined) formData.append("categoryName", data.name);
      if (data.description !== undefined) formData.append("Description", data.description);
      if (data.status !== undefined) formData.append("status", data.status);
      if (data.mainCategory !== undefined) formData.append("mainCategory", data.mainCategory);
      if (data.image !== undefined) {
        formData.append("categoryImage", data.image || "");
      }

      const response = await fetch(`${API_BASE_URL}/${id}`, { method: "PUT", body: formData });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.msg || "Failed to update category");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Category updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["category-section"] });
    },
    onError: (err: Error) => { toast.error(err.message); },
    // Note: Optimistic updates would be more complex here due to the populated `mainCategory` data.
    // Simple invalidation is safer and often sufficient.
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.msg || "Failed to delete category");
      }
    },
    onSuccess: () => {
      toast.success("Category deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["category-section"] });
    },
    onError: (err: Error) => { toast.error(err.message); },
  });

  const toggleCategoryStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
      const formData = new FormData();
      formData.append('status', status);

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.msg || 'Failed to update status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-section"] });
    },
  });

  return {
    categories: categoriesQuery.data,
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    isCreating: createCategory.isPending,
    isUpdating: updateCategory.isPending,
    isDeleting: deleteCategory.isPending,
  };
}