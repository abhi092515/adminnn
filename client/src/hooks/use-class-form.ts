import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Make sure this matches your actual backend URL
const API_BASE_URL = "http://localhost:5099/api"; 
// This should be configured in your environment variables
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// This hook centralizes all logic for the class form (create, read, update)
export function useClassForm(classId?: string) {
  const queryClient = useQueryClient();

  // Query to fetch a single class by its ID for the edit form
  const getClassByIdQuery = useQuery({
    queryKey: ["class-details", classId],
    queryFn: async () => {
      if (!classId) return null;
      const url = `${API_BASE_URL}/classes/${classId}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${API_TOKEN}` },
      });
      if (!response.ok) throw new Error("Failed to fetch class details");
      const result = await response.json();
      // --- THIS IS THE MOST LIKELY FIX ---
      // Check if your API returns { data: { ... } }
      // If it does, you must return result.data
      return result.data; 
    },
    enabled: !!classId,
  });

  // Mutation for creating a new class
  const createClassMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = `${API_BASE_URL}/classes`;
      const response = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${API_TOKEN}` },
        body: data,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create class");
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the main list of classes so it refetches with the new data
      queryClient.invalidateQueries({ queryKey: ["course-classes-all"] });
    },
  });

  // Mutation for updating an existing class
  const updateClassMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const url = `${API_BASE_URL}/classes/${id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: { Authorization: `Bearer ${API_TOKEN}` },
        body: data,
      });
       if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update class");
      }
      return response.json();
    },
    onSuccess: (_, { id }) => {
      // Invalidate both the main list and the specific class detail query
      queryClient.invalidateQueries({ queryKey: ["course-classes-all"] });
      queryClient.invalidateQueries({ queryKey: ["class-details", id] });
    },
  });

  return {
    getClassByIdQuery,
    createClassMutation,
    updateClassMutation,
  };
}