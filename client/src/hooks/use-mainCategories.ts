import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// FIX: Import the specific types for MainCategory
import { type MainCategory, type InsertMainCategory } from "@shared/schema";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5099/api";

type ApiResponse<T> = {
  state: number;
  msg: string;
  data: T;
};


// FIX: Renamed the hook to be specific
export function useMainCategories() {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    // FIX: Updated queryKey to be specific and avoid cache collisions
    queryKey: ["main-categories"],
    // FIX: Return type is now an array of MainCategory
    queryFn: async (): Promise<MainCategory[]> => {
      const response = await fetch(`${API_BASE_URL}/main-categories`);
      if (!response.ok) {
        throw new Error("Failed to fetch main categories");
      }
      const result = await response.json();

      if (result && Array.isArray(result.data)) {
        return result.data;
      }
      console.warn("Unexpected API response structure for main categories:", result);
      return [];
    },
  });

  // FIX: Renamed mutation to be specific
  const createMainCategory = useMutation({
    // FIX: Expects the specific InsertMainCategory type
    mutationFn: async (data: InsertMainCategory) => {
      const formData = new FormData();
      formData.append("mainCategoryName", data.name);
      formData.append("description", data.description || "");
      formData.append("status", data.status);
      if (data.assignedToHeader !== undefined) {
         formData.append("assignedToHeader", String(data.assignedToHeader));
      }
      if (data.image) {
        formData.append("mainCategoryImage", data.image);
      }
      const response = await fetch(`${API_BASE_URL}/main-categories`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorPayload = await response.json();
        throw new Error(errorPayload.msg || "Failed to create main category");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Main category created successfully!");
      queryClient.invalidateQueries({ queryKey: ["main-categories"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // FIX: Renamed mutation to be specific
  const updateMainCategory = useMutation({
    // FIX: Uses MainCategory types and string ID
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertMainCategory> }) => {
      const formData = new FormData();
      if (data.name !== undefined) formData.append("mainCategoryName", data.name);
      if (data.description !== undefined) formData.append("description", data.description);
      if (data.status !== undefined) formData.append("status", data.status);
      if (data.assignedToHeader !== undefined) {
        formData.append("assignedToHeader", String(data.assignedToHeader));
      }
      if (data.image !== undefined) {
        formData.append("mainCategoryImage", data.image || "");
      }
      const response = await fetch(`${API_BASE_URL}/main-categories/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.msg || "Failed to update main category");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Main category updated successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
    onMutate: async (updatedCategory: { id: string; data: Partial<InsertMainCategory> }) => {
      await queryClient.cancelQueries({ queryKey: ["main-categories"] });
      const previousCategories = queryClient.getQueryData<MainCategory[]>(["main-categories"]);
      queryClient.setQueryData<MainCategory[]>(["main-categories"], (oldData = []) =>
        oldData.map((category) => {
          if (category.id === updatedCategory.id) {
            return {
              ...category,
              ...(updatedCategory.data.name !== undefined && { mainCategoryName: updatedCategory.data.name }),
              ...(updatedCategory.data.description !== undefined && { description: updatedCategory.data.description }),
              ...(updatedCategory.data.status !== undefined && { status: updatedCategory.data.status }),
              ...(updatedCategory.data.assignedToHeader !== undefined && { assignedToHeader: updatedCategory.data.assignedToHeader }),
            };
          }
          return category;
        })
      );
      return { previousCategories };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["main-categories"] });
    },
  });

  // FIX: Renamed mutation to be specific
  const deleteMainCategory = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/main-categories${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.msg || "Failed to delete main category");
      }
    },
    onSuccess: () => {
      toast.success("Main category deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["main-categories"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
  const toggleMainCategoryStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
      const formData = new FormData();
      formData.append('status', status);

      const response = await fetch(`${API_BASE_URL}/main-categories/${id}`, {
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
      // This will automatically refetch the data after a successful update
      queryClient.invalidateQueries({ queryKey: ["main-categories"] });
    },
  });


  return {
    // FIX: Renamed returned data and functions for clarity and correctness
    mainCategories: categoriesQuery.data,
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    createMainCategory,
    updateMainCategory,
    deleteMainCategory,
    toggleMainCategoryStatus,
    isCreating: createMainCategory.isPending,
    isUpdating: updateMainCategory.isPending,
    isDeleting: deleteMainCategory.isPending,
  };
}