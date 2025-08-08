import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5099/api";

// ✅ IMPROVEMENT: Standardized to use `id` everywhere for consistency.
export interface Topic {
  id: string;
  topicName: string;
  status: "active" | "inactive";
  section: {
    id: string;
    sectionName: string;
  };
}

export interface InsertTopic {
  name: string;
  status: "active" | "inactive";
  section: string;
}

// ✅ IMPROVEMENT: A small helper to keep API payload logic consistent.
const mapFormDataToApi = (data: Partial<InsertTopic>) => {
    const payload: { [key: string]: any } = {};
    if (data.name !== undefined) payload.topicName = data.name;
    if (data.status !== undefined) payload.status = data.status;
    if (data.section !== undefined) payload.section = data.section;
    return payload;
};

export function useTopics() {
  const queryClient = useQueryClient();

  const topicsQuery = useQuery({
    queryKey: ["topics"],
    queryFn: async (): Promise<Topic[]> => {
      const response = await fetch(`${API_BASE_URL}/topics`);
      if (!response.ok) throw new Error("Failed to fetch topics");
      const result = await response.json();
      // ✅ IMPROVEMENT: Safely handles both direct arrays and { data: [...] } responses.
      return Array.isArray(result) ? result : result.data || [];
    },
  });

  const createTopic = useMutation({
    mutationFn: async (data: InsertTopic) => {
      const response = await fetch(`${API_BASE_URL}/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapFormDataToApi(data)),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create topic");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Topic created successfully!");
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateTopic = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTopic> }) => {
      const response = await fetch(`${API_BASE_URL}/topics/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapFormDataToApi(data)),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update topic");
      }
      return response.json();
    },
    onMutate: async (updatedTopic) => {
      await queryClient.cancelQueries({ queryKey: ["topics"] });
      const previousTopics = queryClient.getQueryData<Topic[]>(["topics"]);
      queryClient.setQueryData<Topic[]>(["topics"], (oldData = []) =>
        oldData.map((topic) =>
          topic.id === updatedTopic.id
            ? { ...topic, topicName: updatedTopic.data.name || topic.topicName, status: updatedTopic.data.status || topic.status }
            : topic
        )
      );
      return { previousTopics };
    },
    onError: (err, updatedTopic, context) => {
      toast.error("Update failed. Restoring previous data.");
      if (context?.previousTopics) {
        queryClient.setQueryData(["topics"], context.previousTopics);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });

  const deleteTopic = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/topics/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete topic");
      }
      return { id }; // Pass the ID for optimistic update
    },
    // ✅ IMPROVEMENT: Added optimistic update for a faster UI response on delete.
    onMutate: async (id: string) => {
        await queryClient.cancelQueries({ queryKey: ['topics'] });
        const previousTopics = queryClient.getQueryData<Topic[]>(['topics']);
        queryClient.setQueryData<Topic[]>(['topics'], (oldData = []) => 
            oldData.filter(topic => topic.id !== id)
        );
        return { previousTopics };
    },
    onError: (err, id, context) => {
        toast.error("Delete failed. Restoring data.");
        if (context?.previousTopics) {
            queryClient.setQueryData(['topics'], context.previousTopics);
        }
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });

  return {
    topics: topicsQuery.data,
    isLoading: topicsQuery.isLoading,
    error: topicsQuery.error as Error | null,
    createTopic,
    updateTopic,
    deleteTopic,
    isCreating: createTopic.isPending,
    isUpdating: updateTopic.isPending,
    isDeleting: deleteTopic.isPending,
  };
}