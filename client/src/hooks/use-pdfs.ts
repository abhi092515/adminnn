// // src/hooks/use-pdfs.ts

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner"; // ✅ 1. Import 'toast' directly from sonner

// const API_BASE_URL = "http://localhost:5099/api";
// const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// // Your Pdf and PdfFilterOptions interfaces
// export interface Pdf {
//     _id: string;
//     id: string;
//     title: string;
//     // ... other PDF properties
// }
// export interface PdfFilterOptions {
//   mainCategoryId?: string;
//   categoryId?: string;
// }

// export function usePdfs() {
//   const queryClient = useQueryClient();

//   // No changes needed for getPdfs
//   const getPdfs = (filters: PdfFilterOptions) => {
//     return useQuery<Pdf[]>({
//       queryKey: ["pdfs", filters],
//       queryFn: async () => {
//         const params = new URLSearchParams({ limit: '1000', ...filters as Record<string, string> });
//         const response = await fetch(`${API_BASE_URL}/pdfs?${params.toString()}`, {
//              headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
//         });
//         if (!response.ok) throw new Error("Failed to fetch PDFs");
//         const data = await response.json();
//         return data.data || data || [];
//       },
//     });
//   };

//   const assignPdf = useMutation({
//     mutationFn: async ({ courseId, pdfId }: { courseId: string; pdfId: string }) => {
//       const url = `${API_BASE_URL}/courses/${courseId}/pdfs`;
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
//         body: JSON.stringify({ pdfId: pdfId }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.msg || 'Failed to assign PDF');
//       }
//       return response.json();
//     },
//     onSuccess: (data, variables) => {
//       queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
//       // ✅ 2. Use the sonner toast function syntax
//       toast.success("PDF has been assigned successfully.");
//     },
//     onError: (error: Error) => {
//       // ✅ 3. Use the sonner toast function syntax
//       toast.error(error.message || "Failed to assign PDF.");
//     }
//   });
  
//   const unassignPdf = useMutation({
//     // ... your unassign mutation logic would go here
//     onSuccess: (data, variables) => {
//         queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
//         toast.success("PDF has been unassigned successfully.");
//     },
//     onError: (error: Error) => {
//       toast.error(error.message || "Failed to unassign PDF.");
//     }
//   });

//   return {
//     getPdfs,
//     assignPdf,
//     unassignPdf
//   };
// } 




// src/hooks/use-pdfs.ts

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";

// const API_BASE_URL = "http://localhost:5099/api";
// const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// // Define your types (it's good practice to export them)
// export interface Pdf {
//     _id: string;
//     id: string;
//     title: string;
//     status: 'active' | 'inactive';
//     isFree: boolean;
//     category?: { categoryName: string };
//     // Add any other properties your component uses
// }

// export interface PdfFilterOptions {
//   mainCategoryId?: string;
//   categoryId?: string;
// }

// // ✅ The courseId parameter is removed from here because it's not needed for the general hook setup.
// // It will be passed directly to the mutations when they are called.
// export function usePdfs() {
//   const queryClient = useQueryClient();

//   // This query fetches the list of ALL available PDFs based on filters.
//   // It should NOT be concerned with which ones are assigned.
//   const getPdfs = (filters: PdfFilterOptions) => {
//     return useQuery<Pdf[]>({
//       // The query key correctly includes filters to re-fetch when they change.
//       queryKey: ["pdfs", filters],
//       queryFn: async () => {
//         // Use limit=1000 or similar to ensure you get all PDFs for filtering
//         const params = new URLSearchParams({ limit: '1000', ...filters as Record<string, string> });
//         const response = await fetch(`${API_BASE_URL}/pdfs?${params.toString()}`, {
//              headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
//         });
//         if (!response.ok) throw new Error("Failed to fetch PDFs");
//         const result = await response.json();
//         // This handles cases where the API returns { data: [...] } or just [...]
//         return result.data || result || [];
//       },
//     });
//   };

//   // MUTATION TO ASSIGN A PDF
//   const assignPdf = useMutation({
//     mutationFn: async ({ courseId, pdfId }: { courseId: string; pdfId: string }) => {
//       const url = `${API_BASE_URL}/courses/${courseId}/pdfs`;
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
//         body: JSON.stringify({ pdfId }), // Ensure your backend expects { "pdfId": "..." }
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.msg || 'Failed to assign PDF');
//       }
//       return response.json();
//     },
//     // ✅ This is the most critical part!
//     onSuccess: (data, variables) => {
//       // After a successful assignment, invalidate the specific course's query.
//       // This tells TanStack Query that the data for ['course', courseId] is stale.
//       // TanStack Query will then automatically refetch it using your `useCourseById` hook.
//       // This refetch updates `courseQuery.data`, which in turn triggers your `useMemo`.
//       queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
//       toast.success("PDF assigned successfully.");
//     },
//     onError: (error: Error) => {
//       toast.error(error.message || "An error occurred during assignment.");
//     }
//   });
  
//   // MUTATION TO UNASSIGN A PDF
//   const unassignPdf = useMutation({
//     mutationFn: async ({ courseId, pdfId }: { courseId: string; pdfId: string }) => {
//        const url = `${API_BASE_URL}/courses/${courseId}/pdfs/${pdfId}`;
//        const response = await fetch(url, {
//         method: 'DELETE',
//         headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
//       });
//        if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.msg || 'Failed to unassign PDF');
//       }
//       return response.json();
//     },
//     // ✅ The same invalidation logic applies here for unassigning.
//     onSuccess: (data, variables) => {
//         queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
//         toast.success("PDF unassigned successfully.");
//     },
//     onError: (error: Error) => {
//       toast.error(error.message || "An error occurred during unassignment.");
//     }
//   });

//   return {
//     getPdfs,
//     assignPdf,
//     unassignPdf,
//   };
// } 


// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";

// const API_BASE_URL = "http://localhost:5099/api";
// const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// // Your Pdf and PdfFilterOptions interfaces
// export interface Pdf {
//     _id: string;
//     id: string;
//     title: string;
//     status: 'active' | 'inactive';
//     isFree: boolean;
//     category?: { categoryName: string };
// }

// export interface PdfFilterOptions {
//   mainCategoryId?: string;
//   categoryId?: string;
// }

// export function usePdfs() {
//   const queryClient = useQueryClient();

//   // This function fetches the master list of all PDFs and does not need changes.
//   const getPdfs = (filters: PdfFilterOptions) => {
//     return useQuery<Pdf[]>({
//       queryKey: ["pdfs", filters],
//       queryFn: async () => {
//         const params = new URLSearchParams({ limit: '1000', ...filters as Record<string, string> });
//         const response = await fetch(`${API_BASE_URL}/pdfs?${params.toString()}`, {
//              headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
//         });
//         if (!response.ok) throw new Error("Failed to fetch PDFs");
//         const result = await response.json();
//         return result.data || result || [];
//       },
//     });
//   };

//   // MUTATION TO ASSIGN A PDF
//   const assignPdf = useMutation({
//     mutationFn: async ({ courseId, pdfId }: { courseId: string; pdfId: string }) => {
//       const url = `${API_BASE_URL}/courses/${courseId}/pdfs`; // This remains your POST endpoint
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
//         body: JSON.stringify({ pdfId }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.msg || 'Failed to assign PDF');
//       }
//       return response.json();
//     },
//     onSuccess: (data, variables) => {
//       // ✅ VITAL CHANGE: Invalidate the dedicated query for assigned PDFs.
//       // This tells TanStack Query to refetch data from your new endpoint.
//       queryClient.invalidateQueries({ queryKey: ['assignedPdfs', variables.courseId] });
//       toast.success("PDF assigned successfully.");
//     },
//     onError: (error: Error) => {
//       toast.error(error.message || "An error occurred during assignment.");
//     }
//   });
  
//   // MUTATION TO UNASSIGN A PDF
//   const unassignPdf = useMutation({
//     mutationFn: async ({ courseId, pdfId }: { courseId: string; pdfId: string }) => {
//        const url = `${API_BASE_URL}/courses/${courseId}/pdfs/${pdfId}`; // This remains your DELETE endpoint
//        const response = await fetch(url, {
//         method: 'DELETE',
//         headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
//       });
//        if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.msg || 'Failed to unassign PDF');
//       }
//       return response.json();
//     },
//     onSuccess: (data, variables) => {
//         // ✅ VITAL CHANGE: Invalidate the same dedicated query here.
//         queryClient.invalidateQueries({ queryKey: ['assignedPdfs', variables.courseId] });
//         toast.success("PDF unassigned successfully.");
//     },
//     onError: (error: Error) => {
//       toast.error(error.message || "An error occurred during unassignment.");
//     }
//   });

//   return {
//     getPdfs,
//     assignPdf,
//     unassignPdf,
//   };
// }
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5099/api";
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// --- Interfaces ---
export interface CoursePdf {
  id: string;
  title: string;
  status: 'active' | 'inactive';
  image?: string;
  uploadPdf?: string;
  description: string;
  priority: number;
  isChat: boolean;
  isFree: boolean;
  isLive: boolean;
  link?: string;
  courseBanner?: string;
  section?: { id: string; sectionName: string };
  topic?: { id: string; topicName: string };
  teacherName: string;
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
        return result.data || result || [];  
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
  const createPdfMutation = useMutation({
    // The mutation now expects a FormData object
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`${API_BASE_URL}/pdfs`, {
        method: "POST",
        // DO NOT set Content-Type header when sending FormData.
        // The browser sets it automatically with the correct boundary.
        headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
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
  
  // NOTE: For better separation, this category logic should be in its own `useCategories` hook.
  // It is included here for simplicity based on your existing code.
  const { data: mainCategories, isLoading: isLoadingMainCategories } = useQuery<any[]>({
    queryKey: ['main-categories-for-filter'],
    queryFn: async () => {
        const response = await fetch(`${API_BASE_URL}/main-categories?limit=1000`, {
            headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) }
        });
        if (!response.ok) throw new Error('Failed to fetch main categories');
        const result = await response.json();
        return result.data || [];
    }
  });
  const assignPdf = useMutation({
    mutationFn: async ({ courseId, pdfId }: { courseId: string; pdfId: string }) => {
      const url = `${API_BASE_URL}/courses/${courseId}/pdfs`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
        body: JSON.stringify({ pdfId }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to assign PDF');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success("PDF assigned successfully.");
      
      // ✅ Invalidate both queries to refresh the UI correctly
      queryClient.invalidateQueries({ queryKey: ['assignedPdfs', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['availablePdfs', variables.courseId] });
    },
    onError: (error: Error) => {
      console.error("MUTATION FAILED:", error);
      toast.error(error.message || "An error occurred.");
    }
  });
  
  const unassignPdf = useMutation({
    mutationFn: async ({ courseId, pdfId }: { courseId: string; pdfId: string }) => {
      const url = `${API_BASE_URL}/courses/${courseId}/pdfs/${pdfId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
      });
       if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to unassign PDF');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success("PDF unassigned successfully.");
      
      // ✅ Invalidate both queries here as well
      queryClient.invalidateQueries({ queryKey: ['assignedPdfs', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['availablePdfs', variables.courseId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "An error occurred.");
    }
  });

  const getCategoriesByMainCategory = (mainCategoryId: string) => {
    return useQuery<any[]>({
        queryKey: ['categories-for-filter', mainCategoryId],
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/categories?mainCategoryId=${mainCategoryId}&limit=1000`, {
                headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) }
            });
            if (!response.ok) throw new Error('Failed to fetch categories');
            const result = await response.json();
            return result.data || [];
        },
        enabled: !!mainCategoryId,
    });
  };
  const assignMultiplePdfs = useMutation({
    mutationFn: async ({ courseId, pdfIds }: { courseId: string; pdfIds: string[] }) => {
      const url = `${API_BASE_URL}/courses/${courseId}/pdfs`; // Assuming this is your bulk-assign endpoint
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
        // ✅ FIX: Change the key from 'pdfIds' to 'pdfId' to match the backend
        body: JSON.stringify({ pdfId: pdfIds }), 
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to assign PDFs');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success(`${variables.pdfIds.length} PDFs assigned successfully.`);
      queryClient.invalidateQueries({ queryKey: ['assignedPdfs', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['availablePdfs', variables.courseId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "An error occurred during bulk assignment.");
    }
});
  
const unassignMultiplePdfs = useMutation({
    mutationFn: async ({ courseId, pdfIds }: { courseId: string; pdfIds: string[] }) => {
       // Assuming a similar endpoint for bulk unassignment
      const url = `${API_BASE_URL}/courses/${courseId}/unassign-pdfs`; 
      const response = await fetch(url, {
        method: 'POST', // Or DELETE, depending on your API
        headers: { 'Content-Type': 'application/json', ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
        // ✅ FIX: Change the key here as well
        body: JSON.stringify({ pdfId: pdfIds }),
      });
       if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to unassign PDFs');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success(`${variables.pdfIds.length} PDFs unassigned successfully.`);
      queryClient.invalidateQueries({ queryKey: ['assignedPdfs', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['availablePdfs', variables.courseId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "An error occurred during bulk unassignment.");
    }
});

  return {
    getPdfs,
    getPdfById,
    createPdfMutation,
    updatePdfMutation,
    togglePdfStatus,
    uploadFileMutation,
    mainCategories,
    isLoadingMainCategories,
    getCategoriesByMainCategory,
    assignPdf,
    unassignPdf,
    assignMultiplePdfs,
    unassignMultiplePdfs
  };
}