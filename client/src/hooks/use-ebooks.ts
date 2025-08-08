import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type Ebook } from "@/types"; // Assuming you have a types file

const API_BASE_URL = "http://localhost:5099/api"; // Make sure your port is correct

// --- API FUNCTIONS ---

const fetchEbooks = async (): Promise<Ebook[]> => {
  const response = await fetch(`${API_BASE_URL}/ebooks`);
  if (!response.ok) throw new Error("Failed to fetch e-books");
  const result = await response.json();
  return result.data || [];
};

const fetchEbookById = async (id: string): Promise<Ebook> => {
  const response = await fetch(`${API_BASE_URL}/ebooks/${id}`);
  if (!response.ok) throw new Error("Failed to fetch e-book details");
  const result = await response.json();
  return result.data;
};

const createEbook = async (formData: FormData): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/ebooks`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || "Failed to create e-book");
  }
  return response.json();
};

const updateEbook = async ({ id, formData }: { id: string; formData: FormData }): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/ebooks/${id}`, {
    method: "PUT",
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || "Failed to update e-book");
  }
  return response.json();
};

const deleteEbook = async (id: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/ebooks/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || "Failed to delete e-book");
  }
  return response.json();
};

const toggleEbookStatus = async ({ ebookId, status }: { ebookId: string; status: 'active' | 'inactive' }) => {
  const response = await fetch(`${API_BASE_URL}/ebooks/${ebookId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.msg || "Failed to update status");
  }
  return response.json();
};


// --- CUSTOM HOOK ---

export function useEbooks() {
  const queryClient = useQueryClient();

  // Queries
  const ebooksQuery = useQuery({ queryKey: ["ebooks"], queryFn: fetchEbooks });

  const getEbookByIdQuery = (id: string | undefined) => useQuery({
    queryKey: ['ebook-details', id],
    queryFn: () => fetchEbookById(id!),
    enabled: !!id, // Only run the query if an ID is provided
  });
  
  // Mutations
  const createEbookMutation = useMutation({
    mutationFn: createEbook,
    onSuccess: (res) => {
      toast.success(res.msg || "E-book created successfully!");
      queryClient.invalidateQueries({ queryKey: ["ebooks"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateEbookMutation = useMutation({
    mutationFn: updateEbook,
    onSuccess: (res, { id }) => {
      toast.success(res.msg || "E-book updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["ebooks"] });
      queryClient.invalidateQueries({ queryKey: ["ebook-details", id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteEbookMutation = useMutation({
    mutationFn: deleteEbook,
    onSuccess: (res) => {
      toast.success(res.msg || "E-book deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["ebooks"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleEbookStatusMutation = useMutation({
    mutationFn: toggleEbookStatus,
    onSuccess: (res, { ebookId }) => {
       toast.success(res.msg || "Status updated!");
       queryClient.invalidateQueries({ queryKey: ["ebooks"] });
       queryClient.invalidateQueries({ queryKey: ["ebook-details", ebookId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    ebooks: ebooksQuery.data,
    isLoading: ebooksQuery.isLoading,
    error: ebooksQuery.error,
    getEbookByIdQuery,
    createEbook: createEbookMutation,
    updateEbook: updateEbookMutation,
    deleteEbook: deleteEbookMutation,
    toggleEbookStatus: toggleEbookStatusMutation,
  };
}