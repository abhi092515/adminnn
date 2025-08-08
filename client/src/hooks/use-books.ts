import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type Book } from "@/types";

const API_BASE_URL = "http://localhost:5099/api";

// --- API FUNCTIONS ---
const fetchBooks = async (): Promise<Book[]> => {
  const response = await fetch(`${API_BASE_URL}/books`);
  if (!response.ok) throw new Error("Failed to fetch books");
  const result = await response.json();
  return result.data || [];
};

const fetchBookById = async (id: string): Promise<Book> => {
  const response = await fetch(`${API_BASE_URL}/books/${id}`);
  if (!response.ok) throw new Error("Failed to fetch book details");
  const result = await response.json();
  return result.data;
};

const createBook = async (formData: FormData): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/books`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || "Failed to create book");
  }
  return response.json();
};

const updateBook = async ({ id, formData }: { id: string; formData: FormData }): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/books/${id}`, {
    method: "PUT",
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || "Failed to update book");
  }
  return response.json();
};

const deleteBook = async (id: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/books/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || "Failed to delete book");
  }
  return response.json();
};

const toggleBookStatus = async ({ bookId, status }: { bookId: string; status: 'active' | 'inactive' }) => {
  const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
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
export function useBooks() {
  const queryClient = useQueryClient();

  const booksQuery = useQuery({ queryKey: ["books"], queryFn: fetchBooks });

  const getBookByIdQuery = (id: string | undefined) => useQuery({
    queryKey: ['book-details', id],
    queryFn: () => fetchBookById(id!),
    enabled: !!id,
  });
  
  const createBookMutation = useMutation({
    mutationFn: createBook,
    onSuccess: (res) => {
      toast.success(res.msg || "Book created successfully!");
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateBookMutation = useMutation({
    mutationFn: updateBook,
    onSuccess: (res, { id }) => {
      toast.success(res.msg || "Book updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["book-details", id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteBookMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: (res) => {
      toast.success(res.msg || "Book deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleBookStatusMutation = useMutation({
    mutationFn: toggleBookStatus,
    onSuccess: (res, { bookId }) => {
       toast.success(res.msg || "Status updated!");
       queryClient.invalidateQueries({ queryKey: ["books"] });
       queryClient.invalidateQueries({ queryKey: ["book-details", bookId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    books: booksQuery.data,
    isLoading: booksQuery.isLoading,
    error: booksQuery.error,
    getBookByIdQuery,
    createBook: createBookMutation,
    updateBook: updateBookMutation,
    deleteBook: deleteBookMutation,
    toggleBookStatus: toggleBookStatusMutation,
  };
}