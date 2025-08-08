//src/hooks/use-book-form.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5099/api";

// Assuming a generic upload endpoint exists at /api/upload
const UPLOAD_API_URL = `${API_BASE_URL}/upload`; 
const BOOKS_API_URL = `${API_BASE_URL}/books`;

export function useBookForm(bookId?: string) {
  const queryClient = useQueryClient();

  // Query to fetch a single book for editing
  const getBookByIdQuery = useQuery({
    queryKey: ['book-details', bookId],
    queryFn: async () => {
      const response = await fetch(`${BOOKS_API_URL}/${bookId}`);
      if (!response.ok) throw new Error('Failed to fetch book data.');
      const result = await response.json();
      return result.data;
    },
    enabled: !!bookId, // Only run this query if a bookId is provided
  });

  // Mutation for uploading a single file
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File): Promise<{ url: string }> => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(UPLOAD_API_URL, { method: "POST", body: formData });
      if (!response.ok) throw new Error("File upload failed");
      return response.json();
    }
  });

  // Mutation for creating a book record with JSON
  const createBookMutation = useMutation({
    mutationFn: async (bookData: any) => {
      const response = await fetch(BOOKS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to create book");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] }); // Assuming your list page uses this key
    },
  });

  // Mutation for updating a book record with JSON
  const updateBookMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`${BOOKS_API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to update book");
      }
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["book-details", id] });
    },
  });

  return {
    getBookByIdQuery,
    uploadFileMutation,
    createBookMutation,
    updateBookMutation,
  };
}