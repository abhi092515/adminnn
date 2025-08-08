// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";

// const API_BASE_URL = "http://localhost:5099/api"; 
// const UPLOAD_API_URL = `${API_BASE_URL}/upload`;
// const PDF_API_URL = `${API_BASE_URL}/pdfs`;

// export function usePdfForm(pdfId?: string) {
//   const queryClient = useQueryClient();

//   const getPdfByIdQuery = useQuery({
//     queryKey: ["pdf-details", pdfId],
//     queryFn: async () => {
//       if (!pdfId) return null;
      
//       const response = await fetch(`${PDF_API_URL}/${pdfId}`);
//       if (!response.ok) throw new Error("Failed to fetch PDF details");
      
//       const result = await response.json();
      
//       // ✅ FIX: Return the result directly, because your API does not wrap it in a 'data' property.
//       return result;
//     },
//     enabled: !!pdfId,
//   });
//   const uploadFileMutation = useMutation({
//     mutationFn: async (file: File): Promise<{ url: string }> => {
//       const formData = new FormData();
//       formData.append("file", file);
//       const response = await fetch(UPLOAD_API_URL, {
//         method: "POST",
//         body: formData,
//       });
//       if (!response.ok) throw new Error("File upload failed");
//       return response.json();
//     }
//   });

//   const createPdfMutation = useMutation({
//     mutationFn: async (pdfData: any) => {
//       const response = await fetch(PDF_API_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(pdfData),
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to create PDF");
//       }
//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["course-pdfs-all"] });
//     },
//   });

//   // const updatePdfMutation = useMutation({
//   //   mutationFn: async ({ id, data }: { id: string; data: any }) => {
//   //     const response = await fetch(`${PDF_API_URL}/${id}`, {
//   //       method: "PUT",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify(data),
//   //     });
//   //     if (!response.ok) {
//   //       const errorData = await response.json();
//   //       throw new Error(errorData.message || "Failed to update PDF");
//   //     }
//   //     return response.json();
//   //   },
//   //   onSuccess: (_, { id }) => {
//   //     queryClient.invalidateQueries({ queryKey: ["course-pdfs-all"] });
//   //     queryClient.invalidateQueries({ queryKey: ["pdf-details", id] });
//   //   },
//   // }); 
//   const updatePdfMutation = useMutation({
//     mutationFn: async ({ id, data }: { id: string, data: any }) => {
//       // Your PUT request logic to update the PDF
//       const response = await fetch(`${API_BASE_URL}/pdfs/${id}`, {
//         method: 'PUT',
//         headers: { /* your headers */ },
//         body: JSON.stringify(data),
//       });
//       if (!response.ok) {
//         throw new Error('Failed to update PDF');
//       }
//       return response.json();
//     },
//     // ✅ THIS IS THE FIX
//     onSuccess: () => {
//       // This line tells React Query that any query whose key starts
//       // with ['pdfs'] is now stale and must be refetched.
//       queryClient.invalidateQueries({ queryKey: ['pdfs'] });
      
//       // You can also show a success toast here
//       toast({ title: "Success", description: "PDF updated successfully." });
//     },
//     onError: (error) => {
//       toast({ title: "Error", description: error.message, variant: "destructive" });
//     }
//   });

//   return {
//     getPdfByIdQuery,
//     uploadFileMutation,
//     createPdfMutation,
//     updatePdfMutation,
//   };
// } 
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5099/api";
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// --- Interfaces (assuming CoursePdf is the detailed type) ---
export interface CoursePdf {
  id: string;
  title: string;
  status: 'active' | 'inactive';
  image?: string;
  uploadPdf?: string;
  teacherName?: string;
  mainCategory?: { id: string; mainCategoryName: string };
  category?: { id: string; categoryName: string };
}

export interface FilterOptions {
  mainCategoryId?: string;
  categoryId?: string;
  search?: string;
}

// --- The SINGLE Hook for All PDF Operations ---
export function usePdfs() {
  const queryClient = useQueryClient();

  // For the LIST page
  const getPdfs = (filters: FilterOptions) => {
    return useQuery<CoursePdf[]>({
      queryKey: ['pdfs', filters],
      queryFn: async () => {
        const params = new URLSearchParams(filters as Record<string, string>);
        const response = await fetch(`${API_BASE_URL}/pdfs?${params.toString()}`, {
          headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) }
        });
        if (!response.ok) throw new Error("Failed to fetch PDFs");
        const result = await response.json();
        return Array.isArray(result.data) ? result.data : [];
      },
    });
  };

  // For the EDIT page
  const getPdfById = (pdfId?: string) => {
    return useQuery<CoursePdf>({
      queryKey: ['pdfs', pdfId],
      queryFn: async () => {
        const response = await fetch(`${API_BASE_URL}/pdfs/${pdfId}`, {
          headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) }
        });
        if (!response.ok) throw new Error('Failed to fetch PDF details');
        const result = await response.json();
        return result.data || result;
      },
      enabled: !!pdfId,
    });
  };

  // For the LIST page (toggle status)
  const togglePdfStatus = useMutation({
    mutationFn: async ({ pdfId, status }: { pdfId: string; status: 'active' | 'inactive' }) => {
        const response = await fetch(`${API_BASE_URL}/pdfs/${pdfId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Failed to update status');
        return response.json();
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pdfs'] });
    },
  });

  // For the NEW and EDIT pages
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File): Promise<{ url: string }> => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
        body: formData,
      });
      if (!response.ok) throw new Error("File upload failed");
      return response.json();
    }
  });

  // For the NEW page
  // const createPdfMutation = useMutation({
  //   mutationFn: async (pdfData: any) => {
  //     const response = await fetch(`${API_BASE_URL}/pdfs`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
  //       body: JSON.stringify(pdfData),
  //     });
  //     if (!response.ok) throw new Error("Failed to create PDF");
  //     return response.json();
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['pdfs'] });
  //   },
  // });
  // In src/hooks/use-pdfs.ts

  const createPdfMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`${API_BASE_URL}/pdfs`, {
        method: "POST",
        headers: {
          // ✅ REMOVED 'Content-Type'. The browser MUST set this for FormData.
          ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` })
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create PDF");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("PDF Created Successfully!");
      queryClient.invalidateQueries({ queryKey: ['pdfs'] });
    },
    onError: (error: Error) => {
        toast.error(error.message || "Failed to create PDF.");
    }
  });

  // For the EDIT page
  const updatePdfMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`${API_BASE_URL}/pdfs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update PDF");
      return response.json();
    },
    onSuccess: (_, { id }) => {
      // Invalidate both the main list and the specific detail query
      queryClient.invalidateQueries({ queryKey: ['pdfs'] });
      queryClient.invalidateQueries({ queryKey: ['pdfs', id] });
    },
  });

  // Dummy functions for main/sub categories if they come from another hook
  const mainCategories: any[] = [];
  const getCategoriesByMainCategory = (id: string) => ({ data: [], isLoading: false });

  return {
    getPdfs,
    getPdfById,
    createPdfMutation,
    updatePdfMutation,
    togglePdfStatus,
    uploadFileMutation,
    // Include these for compatibility with your list page
    mainCategories,
    isLoadingMainCategories: false,
    getCategoriesByMainCategory,
  };
}