// // // src/hooks/use-course-pdfs.ts

// // import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// // const API_BASE_URL = "http://localhost:5099/api";
// // const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// // export interface CoursePdf {
// //   id: string;
// //   link: string;
// //   status: "active" | "inactive";
// //   isChat: boolean;
// //   isFree: boolean;
// //   teacherName: string;
// //   priority: number;
// //   isLive: boolean;
// //   image: string;
// //   title: string;
// //   uploadPdf: string;
// //   description: string;
// //   mainCategory: { mainCategoryName: string; id: string; };
// //   category: { categoryName: string; id: string; };
// //   section: { sectionName: string; id: string; };
// //   topic: { topicName: string; id: string; };
// //   createdAt: string;
// //   updatedAt: string;
// // }

// // export interface FilterOptions {
// //   mainCategoryId?: string;
// //   categoryId?: string;
// //   search?: string;
// // }

// // export function useCoursePdfs() {
// //   const queryClient = useQueryClient();

//   // const mainCategoriesQuery = useQuery({
//   //   queryKey: ["main-categories-filter", { limit: 1000 }],
//   //   queryFn: async ({ queryKey }) => {
//   //     const [_key, params] = queryKey as [string, { limit: number }];
//   //     const url = `${API_BASE_URL}/main-categories?limit=${params.limit}`;
//   //     const response = await fetch(url, { headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) } });
//   //     if (!response.ok) throw new Error("Failed to fetch main categories");
//   //     return (await response.json()).data;
//   //   },
//   // });

// //   const getCategoriesByMainCategory = (mainCategoryId: string) => {
// //     return useQuery({
// //       queryKey: ["categories-by-main", mainCategoryId, { limit: 1000 }],
// //       queryFn: async ({ queryKey }) => {
// //         const [_key, mId, params] = queryKey as [string, string, { limit: number }];
// //         const url = `${API_BASE_URL}/categories?mainCategoryId=${mId}&limit=${params.limit}`;
// //         const response = await fetch(url, { headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) } });
// //         if (!response.ok) throw new Error("Failed to fetch categories");
// //         return (await response.json()).data;
// //       },
// //       enabled: !!mainCategoryId,
// //     });
// //   };

// //   const getPdfs = () => {
// //     return useQuery({
// //       queryKey: ["course-pdfs-all"],
// //       queryFn: async () => {
// //         const url = `${API_BASE_URL}/pdfs`; 
// //         const response = await fetch(url, { method: 'GET', headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) } });
// //         if (!response.ok) throw new Error("Failed to fetch course PDFs");
// //         return await response.json() as Promise<CoursePdf[]>;
// //       },
// //     });
// //   };
  
// //   const togglePdfStatus = useMutation({
// //     mutationFn: async ({ pdfId, status }: { pdfId: string; status: 'active' | 'inactive' }) => {
// //       const url = `${API_BASE_URL}/pdfs/${pdfId}`;
// //       const response = await fetch(url, {
// //         method: 'PUT',
// //         headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
// //         body: JSON.stringify({ status: status }) 
// //       });
// //       if (!response.ok) throw new Error("Failed to update PDF status");
// //       return response.json();
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["course-pdfs-all"] });
// //     },
// //   });

// //   return {
// //     mainCategories: mainCategoriesQuery.data,
// //     isLoadingMainCategories: mainCategoriesQuery.isLoading,
// //     getCategoriesByMainCategory,
// //     getPdfs,
// //     togglePdfStatus,
// //   };
// // } 
// // src/hooks/use-course-pdfs.ts (Recommendation: Rename to usePdfs.ts)

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";

// const API_BASE_URL = "http://localhost:5099/api";
// const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// // ✨ FIX 1: Rename interface for clarity and export it for use in other files.
// export interface Pdf {
//   _id: string; // Keep _id for MongoDB references
//   id: string;    // Keep id for frontend consistency
//   title: string;
//   status: "active" | "inactive";
//   isFree: boolean;
//   teacherName: string;
//   // Add other properties from your component if needed
// }

// export interface FilterOptions {
//   mainCategoryId?: string;
//   categoryId?: string;
//   search?: string;
// }

// export function useCoursePdfs() {
//   const queryClient = useQueryClient();

//   // NOTE: This category logic is duplicated from use-courses.ts.
//   // It's recommended to move this to a separate useCategories.ts hook.
//   const mainCategoriesQuery = useQuery({
//     queryKey: ["main-categories-filter", { limit: 1000 }],
//     queryFn: async ({ queryKey }) => {
//       const [_key, params] = queryKey as [string, { limit: number }];
//       const url = `${API_BASE_URL}/main-categories?limit=${params.limit}`;
//       const response = await fetch(url, { headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) } });
//       if (!response.ok) throw new Error("Failed to fetch main categories");
//       return (await response.json()).data;
//     },
//   });
//   const getCategoriesByMainCategory = (mainCategoryId: string) => { /* ... no changes ... */ };

//   const getPdfs = (filters: FilterOptions) => { // Pass filters to the hook
//     return useQuery<Pdf[]>({
//       queryKey: ["pdfs", filters], // Use filters in the query key
//       queryFn: async () => {
//         const params = new URLSearchParams(filters as Record<string, string>);
//         const url = `${API_BASE_URL}/pdfs?${params.toString()}`; 
//         const response = await fetch(url, { method: 'GET', headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) } });
//         if (!response.ok) throw new Error("Failed to fetch PDFs");

//         // ✨ FIX 2: Correctly and safely parse the API response.
//         const result = await response.json();
//         // This safely handles responses with or without a .data wrapper.
//         return result.data || result || []; 
//       },
//     });
//   };
  
//   // ✨ FIX 3: Add the missing 'assignPdf' mutation.
//   const assignPdf = useMutation({
//     mutationFn: async ({ courseId, pdfId }: { courseId: string; pdfId: string }) => {
//       const url = `${API_BASE_URL}/courses/${courseId}/pdfs`;
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
//       // This is the key to updating the UI.
//       console.log(`STEP 1: Mutation successful for course ${variables.courseId}. Invalidating cache...`);

//       queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
//       toast.success("PDF assigned successfully.");

//     },
//     onError: (error: Error) => {
//       console.error("MUTATION FAILED:", error);
//       toast.error(error.message || "An error occurred.");
//     }
//   });

// //   // ✨ FIX 4: Add the missing 'unassignPdf' mutation.
//   const unassignPdf = useMutation({
//     mutationFn: async ({ courseId, pdfId }: { courseId: string; pdfId: string }) => {
//       const url = `${API_BASE_URL}/courses/${courseId}/pdfs/${pdfId}`;
//       const response = await fetch(url, {
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
//       // This ensures the UI updates after unassigning.
//       console.log(`STEP 1: Mutation successful for course ${variables.courseId}. Invalidating cache...`);

//       queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
//       toast.success("PDF unassigned successfully.");
//     },
//     onError: (error: Error) => {
//       toast.error(error.message || "An error occurred.");
//     }
//   });
  
//   const togglePdfStatus = useMutation({ /* ... no changes ... */ });

//   return {
//     mainCategories: mainCategoriesQuery.data,
//     isLoadingMainCategories: mainCategoriesQuery.isLoading,
//     getCategoriesByMainCategory,
//     getPdfs,
//     assignPdf,
//     unassignPdf,
//     togglePdfStatus,
//   };
// }