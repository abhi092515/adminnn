import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Section, type InsertSection } from "@shared/schema";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5099/api";

// This hook manages all API interactions for Sections
export function useSections() {
  const queryClient = useQueryClient();

  const sectionsQuery = useQuery({
    queryKey: ["sections"],
    queryFn: async (): Promise<Section[]> => {
      const response = await fetch(`${API_BASE_URL}/sections`);
      if (!response.ok) throw new Error("Failed to fetch sections");
      const result = await response.json();
      return result.data || [];
    },
  });

  const createSection = useMutation({
    mutationFn: async (data: InsertSection) => {
      // Sending JSON as there's no file
      const response = await fetch(`${API_BASE_URL}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sectionName: data.name, // API expects `sectionName`
            description: data.description,
            status: data.status,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.msg || "Failed to create section");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Section created successfully!");
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateSection = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertSection> }) => {
        // Sending JSON as there's no file
        const response = await fetch(`${API_BASE_URL}/sections/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sectionName: data.name,
                description: data.description,
                status: data.status,
            }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.msg || "Failed to update section");
        }
        return response.json();
    },
    onSuccess: () => {
      toast.success("Section updated successfully!");
    },
    onError: (err: Error) => toast.error(err.message),
    onMutate: async (updatedSection: { id: string; data: Partial<InsertSection> }) => {
      await queryClient.cancelQueries({ queryKey: ["sections"] });
      const previousSections = queryClient.getQueryData<Section[]>(["sections"]);
      queryClient.setQueryData<Section[]>(["sections"], (oldData = []) =>
        oldData.map((section) => {
          if (section.id === updatedSection.id) {
            return {
              ...section,
              ...(updatedSection.data.name !== undefined && { sectionName: updatedSection.data.name }),
              ...(updatedSection.data.description !== undefined && { description: updatedSection.data.description }),
              ...(updatedSection.data.status !== undefined && { status: updatedSection.data.status }),
            };
          }
          return section;
        })
      );
      return { previousSections };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });

  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/sections/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.msg || "Failed to delete section");
      }
    },
    onSuccess: () => {
      toast.success("Section deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    sections: sectionsQuery.data,
    isLoading: sectionsQuery.isLoading,
    error: sectionsQuery.error,
    createSection,
    updateSection,
    deleteSection,
    isCreating: createSection.isPending,
    isUpdating: updateSection.isPending,
    isDeleting: deleteSection.isPending,
  };
}