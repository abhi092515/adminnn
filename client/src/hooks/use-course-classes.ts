// src/hooks/use-course-classes.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Replace with your actual API endpoints
const API_BASE_URL = "http://localhost:5099/api";

// This is likely handled by your build tool (e.g., Vite, Next.js)
const API_TOKEN = import.meta.env.VITE_API_TOKEN; 

// The interface for a single class, matching your API response
export interface CourseClass {
  id: string;
  link: string;
  status: "active" | "inactive";
  isChat: boolean;
  isFree: boolean;
  teacherName: string;
  priority: number;
  isLive: boolean;
  isShort: boolean;
  isTopper: boolean;
  image: string;
  title: string;
  description: string;
  mainCategory: {
    mainCategoryName: string;
    id: string;
  };
  category: {
    categoryName:string;
    id: string;
  };
  section: {
    sectionName: string;
    id: string;
  };
  topic: {
    topicName: string;
    id: string;
  };
  uniqueViewCount: number;
  mp4Recordings: any[];
  createdAt: string;
  updatedAt: string;
}

// The interface for filter options, using string IDs
export interface FilterOptions {
  mainCategoryId?: string;
  categoryId?: string;
  sectionId?: string;
  topicId?: string;
  status?: string;
  search?: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useCourseClasses() {
  const queryClient = useQueryClient();

  // Fetches ALL main categories for the dropdown
  const mainCategoriesQuery = useQuery({
    queryKey: ["main-categories-filter", { limit: 1000 }],
    queryFn: async ({ queryKey }) => {
      const [_key, params] = queryKey as [string, { limit: number }];
      const url = `${API_BASE_URL}/main-categories?limit=${params.limit}`;
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
      });
      if (!response.ok) throw new Error("Failed to fetch main categories");
      const result = await response.json();
      return result.data; 
    },
  });

  // Fetches ALL categories for a given main category
  const getCategoriesByMainCategory = (mainCategoryId: string) => {
    return useQuery({
      queryKey: ["categories-by-main", mainCategoryId, { limit: 1000 }],
      queryFn: async ({ queryKey }) => {
        const [_key, mId, params] = queryKey as [string, string, { limit: number }];
        const url = `${API_BASE_URL}/categories?mainCategoryId=${mId}&limit=${params.limit}`;
        const response = await fetch(url, {
          headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
        });
        if (!response.ok) throw new Error("Failed to fetch categories");
        const result = await response.json();
        return result.data;
      },
      enabled: !!mainCategoryId, 
    });
  };

  // Fetches ALL classes for client-side filtering
  const getClasses = () => {
    return useQuery({
      queryKey: ["course-classes-all"], 
      queryFn: async () => {
        const url = `${API_BASE_URL}/classes/filter`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
          body: JSON.stringify({}) // Send empty object to fetch all
        });
        if (!response.ok) throw new Error("Failed to fetch course classes");
        const result = await response.json();
        return result.data as CourseClass[];
      },
    });
  };
  
  // Mutations using string IDs and correct URLs
  const updateClassStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`${API_BASE_URL}/classes/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update class status");
      await sleep(3000);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-classes-all"] });
    },
  });

  const goLive = useMutation({
    mutationFn: async (classId: string) => {
      const response = await fetch(`${API_BASE_URL}/classes/${classId}/go-live`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
      });
      if (!response.ok) throw new Error("Failed to go live");
      return response.json();
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["course-classes-all"] });
      },
  });


  const toggleClassStatus = useMutation({
    mutationFn: async ({ classId, status }: { classId: string; status: 'active' | 'inactive' }) => {
      const url = `${API_BASE_URL}/classes/${classId}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 
          "Content-Type": "application/json", 
          ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) 
        },
        // We send the new status in the body
        body: JSON.stringify({ status: status }) 
      });

      if (!response.ok) {
        throw new Error("Failed to update class status");
      }
      return response.json();
    },
    // When the mutation is successful, we tell TanStack Query to invalidate
    // the main class list. This will trigger a refetch to get the fresh data.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-classes-all"] });
    },
  });

  return {
    mainCategories: mainCategoriesQuery.data,
    isLoadingMainCategories: mainCategoriesQuery.isLoading,
    getCategoriesByMainCategory,
    getClasses,
    updateClassStatus,
    goLive,
    toggleClassStatus
    
  };
}