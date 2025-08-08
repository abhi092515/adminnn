// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { type Class } from "@/hooks/use-classes"; 
// import { type CoursePdf as Pdf } from "@/hooks/use-pdfs";

// const API_BASE_URL = "http://localhost:5099/api";
// const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// export interface Course {
//   id: string;
//   title: string;
//   banner: string | null;
//   status: "active" | "inactive";
//   isFree: boolean;
//   isLive: boolean;
//   isRecorded: boolean;
//   mainCategory: { mainCategoryName: string; id: string; };
//   category: { categoryName: string; id: string; };
//   facultyDetails?: { name: string; designation?: string; };
//   classes?: Class[];
//   assignedPdfs?: Pdf[];
//   courseInfo?: string[]
// }

// export interface FilterOptions {
//   mainCategoryId?: string;
//   categoryId?: string;
//   search?: string;
// }

// const fetchCourseById = async (courseId: string): Promise<Course> => {
//   const url = `${API_BASE_URL}/courses/${courseId}`;
//   const response = await fetch(url, {
//     headers: {
//       "Content-Type": "application/json",
//       ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }),
//     },
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to fetch course with id ${courseId}`);
//   }
//   const result = await response.json();
//   return result.data as Course;
// };

// export function useCourses() {
//   const queryClient = useQueryClient();

//   const mainCategoriesQuery = useQuery({
//     queryKey: ["main-categories-filter", { limit: 1000 }],
//     queryFn: async ({ queryKey }) => {
//       const [, params] = queryKey as [string, { limit: number }];
//       const url = `${API_BASE_URL}/main-categories?limit=${params.limit}`;
//       const response = await fetch(url, { headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) } });
//       if (!response.ok) throw new Error("Failed to fetch main categories");
//       const result = await response.json();
//       return result.data || [];
//     },
//   });

//   const getCategoriesByMainCategory = (mainCategoryId: string) => {
//     return useQuery({
//       queryKey: ["categories-by-main", mainCategoryId],
//       queryFn: async () => {
//         const url = `${API_BASE_URL}/categories?mainCategoryId=${mainCategoryId}&limit=1000`;
//         const response = await fetch(url, { headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) } });
//         if (!response.ok) throw new Error("Failed to fetch categories");
//         const result = await response.json();
//         return result.data || [];
//       },
//       enabled: !!mainCategoryId,
//     });
//   };

//   const getCourses = () => {
//     return useQuery({
//       queryKey: ["courses-all"],
//       queryFn: async () => {
//         const url = `${API_BASE_URL}/courses`; 
//         const response = await fetch(url, {
//           method: 'GET',
//           headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
//         });
//         if (!response.ok) throw new Error("Failed to fetch courses");
//         const result = await response.json();
//         return (result.data || []) as Course[];
//       },
//     });
//   };
  
//   const createCourse = useMutation({
//     mutationFn: async (formData: FormData) => {
//       const url = `${API_BASE_URL}/courses`;
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
//         body: formData,
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to create course');
//       }
//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["courses-all"] });
//     },
//   });

//   const updateCourse = useMutation({
//     mutationFn: async ({ courseId, formData }: { courseId: string; formData: FormData }) => {
//       const url = `${API_BASE_URL}/courses/${courseId}`;
//       const response = await fetch(url, {
//         method: 'PUT', 
//         headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
//         body: formData,
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to update course');
//       }
//       return response.json();
//     },
//     onSuccess: (data, { courseId }) => {
//       queryClient.invalidateQueries({ queryKey: ["courses-all"] });
//       queryClient.invalidateQueries({ queryKey: ['course', courseId] });
//     },
//   });

//   const useCourseById = (courseId: string) => {
//     return useQuery<Course>({
//       queryKey: ['course', courseId],
//       queryFn: () => fetchCourseById(courseId), 
//       enabled: !!courseId,
//     });
//   };

//   const toggleCourseStatus = useMutation({
//     mutationFn: async ({ courseId, status }: { courseId: string; status: 'active' | 'inactive' }) => {
//       const url = `${API_BASE_URL}/courses/${courseId}`;
//       const response = await fetch(url, {
//         method: 'PUT',
//         headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
//         body: JSON.stringify({ status: status }) 
//       });
//       if (!response.ok) throw new Error("Failed to update course status");
//       return response.json();
//     },
//     onSuccess: (data, { courseId }) => {
//       queryClient.invalidateQueries({ queryKey: ["courses-all"] });
//       queryClient.invalidateQueries({ queryKey: ['course', courseId] });
//     },
//   });

//   const useCourseList() {
//     const query = useQuery({
//       queryKey: ["all-courses-list"], // A unique key for this specific query
//       queryFn: fetchAllCourses,
//     });
  
//     return {
//       // The key is 'data' to match the destructuring in your form
//       data: query.data, 
//       isLoading: query.isLoading,
//     };
//   }
  
//   // ✅ REMOVED the extra, nested functions that were here.

//   return {
//     mainCategories: mainCategoriesQuery.data,
//     isLoadingMainCategories: mainCategoriesQuery.isLoading,
//     getCategoriesByMainCategory,
//     getCourses,
//     toggleCourseStatus,
//     createCourse,
//     updateCourse,
//     useCourseById,
//   };
// } // ✅ REMOVED the extra closing brace that was here.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type Class } from "@/hooks/use-classes"; 
import { type CoursePdf as Pdf } from "@/hooks/use-pdfs";

const API_BASE_URL = "http://localhost:5099/api";
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// ============================================================================
// INTERFACES
// ============================================================================

export interface Course {
  id: string;
  title: string;
  banner: string | null;
  status: "active" | "inactive";
  isFree: boolean;
  isLive: boolean;
  isRecorded: boolean;
  mainCategory: { mainCategoryName: string; id: string; };
  category: { categoryName: string; id: string; };
  facultyDetails?: { name: string; designation?: string; };
  classes?: Class[];
  assignedPdfs?: Pdf[];
  courseInfo?: string[];
}

// ============================================================================
// API FETCHING FUNCTIONS
// ============================================================================

const fetchCourses = async (): Promise<Course[]> => {
  const url = `${API_BASE_URL}/courses`; 
  const response = await fetch(url, { headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) } });
  if (!response.ok) throw new Error("Failed to fetch courses");
  const result = await response.json();
  return (result.data || []) as Course[];
};

const fetchCourseById = async (courseId: string): Promise<Course> => {
  const url = `${API_BASE_URL}/courses/${courseId}`;
  const response = await fetch(url, { headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) } });
  if (!response.ok) throw new Error(`Failed to fetch course with id ${courseId}`);
  const result = await response.json();
  return result.data as Course;
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * ✅ Hook to fetch the list of all courses.
 */
export function useCourses() {
  return useQuery({
    queryKey: ["courses-all"],
    queryFn: fetchCourses,
  });
}

/**
 * ✅ Hook to fetch a single course by its ID.
 */
export function useCourseById(courseId?: string) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourseById(courseId!),
    enabled: !!courseId,
  });
}

/**
 * ✅ Hook to fetch main categories.
 */
export function useMainCategories() {
  return useQuery({
    queryKey: ["main-categories-filter"],
    queryFn: async () => {
      const url = `${API_BASE_URL}/main-categories?limit=1000`;
      const response = await fetch(url, { headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) } });
      if (!response.ok) throw new Error("Failed to fetch main categories");
      const result = await response.json();
      return result.data || [];
    },
  });
}

/**
 * ✅ Hook to fetch categories for a specific main category.
 */
export function useCategoriesByMainCategory(mainCategoryId?: string) {
  return useQuery({
    queryKey: ["categories-by-main", mainCategoryId],
    queryFn: async () => {
      const url = `${API_BASE_URL}/categories?mainCategoryId=${mainCategoryId}&limit=1000`;
      const response = await fetch(url, { headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) } });
      if (!response.ok) throw new Error("Failed to fetch categories");
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!mainCategoryId,
  });
}

/**
 * ✅ Hook containing all course-related mutations (create, update, toggle status).
 */
export function useCourseMutations() {
  const queryClient = useQueryClient();

  const createCourse = useMutation({
    mutationFn: async (formData: FormData) => {
      const url = `${API_BASE_URL}/courses`;
      const response = await fetch(url, { method: 'POST', headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) }, body: formData });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to create course'); }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Course created successfully!");
      queryClient.invalidateQueries({ queryKey: ["courses-all"] });
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const updateCourse = useMutation({
    mutationFn: async ({ courseId, formData }: { courseId: string; formData: FormData }) => {
      const url = `${API_BASE_URL}/courses/${courseId}`;
      const response = await fetch(url, { method: 'PUT', headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) }, body: formData });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to update course'); }
      return response.json();
    },
    onSuccess: (_, { courseId }) => {
      toast.success("Course updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["courses-all"] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const toggleCourseStatus = useMutation({
    mutationFn: async ({ courseId, status }: { courseId: string; status: 'active' | 'inactive' }) => {
      const url = `${API_BASE_URL}/courses/${courseId}`;
      const response = await fetch(url, { method: 'PUT', headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) }, body: JSON.stringify({ status }) });
      if (!response.ok) throw new Error("Failed to update course status");
      return response.json();
    },
    onSuccess: (_, { courseId }) => {
      toast.success("Status updated!");
      queryClient.invalidateQueries({ queryKey: ["courses-all"] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
    onError: (error: Error) => toast.error(error.message)
  });

  return { createCourse, updateCourse, toggleCourseStatus };
}