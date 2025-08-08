import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5099/api";

export interface SubTopic {
  _id: string;
  subTopicName: string;
  status: "active" | "inactive";
  topic: {
    id: string;
    topicName: string;
  };
}

export type SubTopicPayload = {
  subTopicName: string;
  status: "active" | "inactive";
  topic: string;
}

// Hook to fetch just the list of topics for dropdowns
export function useTopicList() {
  return useQuery({
      queryKey: ['topicsList'],
      queryFn: async (): Promise<{id: string, topicName:string}[]> => {
          const response = await fetch(`${API_BASE_URL}/topics`);
          if (!response.ok) throw new Error("Failed to fetch topics list");
          const result = await response.json();
          return Array.isArray(result) ? result : result.data || [];
      }
  });
}

// --- API Functions ---
const fetchSubTopics = async (): Promise<SubTopic[]> => {
    const response = await fetch(`${API_BASE_URL}/sub-topics`);
    if (!response.ok) throw new Error("Failed to fetch sub-topics");
    const result = await response.json();
    return result.data || [];
};

const fetchSubTopicById = async (id: string): Promise<SubTopic> => {
    const response = await fetch(`${API_BASE_URL}/sub-topics/${id}`);
    if (!response.ok) throw new Error("Failed to fetch sub-topic details");
    const result = await response.json();
    return result.data;
};

const createSubTopic = async (data: SubTopicPayload) => {
  const response = await fetch(`${API_BASE_URL}/sub-topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
  });
  if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create sub-topic");
  }
  return response.json();
};

const updateSubTopic = async ({ id, data }: { id: string; data: Partial<SubTopicPayload> }) => {
  const response = await fetch(`${API_BASE_URL}/sub-topics/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
  });
  if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update sub-topic");
  }
  return response.json();
};

const deleteSubTopicApi = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/sub-topics/${id}`, { method: 'DELETE' });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete sub-topic");
    }
    return response.json();
};

// Main hook for CRUD operations
export function useSubTopics() {
  const queryClient = useQueryClient();

  const subTopicsQuery = useQuery({ 
    queryKey: ["subTopics"], 
    queryFn: fetchSubTopics 
  });

  const getSubTopicById = (id?: string) => useQuery({ 
    queryKey: ["subTopic", id], 
    queryFn: () => fetchSubTopicById(id!), 
    enabled: !!id 
  });

  const createMutation = useMutation({
    mutationFn: createSubTopic,
    onSuccess: () => {
        toast.success("Sub-Topic created successfully!");
        queryClient.invalidateQueries({ queryKey: ["subTopics"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateSubTopic,
    onSuccess: () => {
        toast.success("Sub-Topic updated successfully!");
    },
    onMutate: async (updatedSubTopic: { id: string; data: Partial<SubTopicPayload> }) => {
        await queryClient.cancelQueries({ queryKey: ["subTopics"] });
        const previousSubTopics = queryClient.getQueryData<SubTopic[]>(["subTopics"]);
        queryClient.setQueryData<SubTopic[]>(["subTopics"], (oldData = []) =>
            oldData.map(st => st._id === updatedSubTopic.id 
                ? { ...st, ...updatedSubTopic.data } 
                : st
            )
        );
        return { previousSubTopics };
    },
    onError: (err, variables, context) => {
        if (context?.previousSubTopics) {
            queryClient.setQueryData(["subTopics"], context.previousSubTopics);
        }
        toast.error("Update failed.");
    },
    onSettled: (data) => {
        queryClient.invalidateQueries({ queryKey: ["subTopics"] });
        if (data) {
            queryClient.invalidateQueries({ queryKey: ["subTopic", data.id] });
        }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubTopicApi,
    onSuccess: () => {
        toast.success("Sub-Topic deleted successfully!");
    },
    onMutate: async (id: string) => {
        await queryClient.cancelQueries({ queryKey: ["subTopics"] });
        const previousSubTopics = queryClient.getQueryData<SubTopic[]>(["subTopics"]);
        queryClient.setQueryData<SubTopic[]>(["subTopics"], (oldData = []) =>
            oldData.filter(st => st._id !== id)
        );
        return { previousSubTopics };
    },
    onError: (err, variables, context) => {
      if (context?.previousSubTopics) {
          queryClient.setQueryData(["subTopics"], context.previousSubTopics);
      }
      toast.error("Delete failed.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["subTopics"] });
    },
  });

  return {
    subTopics: subTopicsQuery.data,
    isLoading: subTopicsQuery.isLoading,
    error: subTopicsQuery.error as Error | null,
    getSubTopicById,
    createSubTopic: createMutation,
    updateSubTopic: updateMutation,
    deleteSubTopic: deleteMutation,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}