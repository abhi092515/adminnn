// src/hooks/use-classes.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";

const API_BASE_URL = 'http://localhost:5099/api';
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// Interfaces
export interface Class {
  id: string;
  _id: string; 
  title: string;
  description: string;
  image?: string;
  teacherName: string;
  status: 'active' | 'inactive';
  isFree: boolean;
  isLive: boolean;
  priority: number;
  mainCategory: { id: string; mainCategoryName:string };
  category: { id: string; categoryName: string };
}

export interface ClassFilterOptions {
  mainCategoryId?: string;
  categoryId?: string;
}

// Custom React Query Hook
export function useClasses() {
  const queryClient = useQueryClient();

  // No changes needed for getClasses
  const getClasses = (filters: ClassFilterOptions) => {
    return useQuery<Class[]>({
      queryKey: ['classes', filters],
      queryFn: async () => {
        const url = new URL(`${API_BASE_URL}/classes`);
        url.searchParams.append('limit', '1000');
        if (filters.mainCategoryId) url.searchParams.append('mainCategoryId', filters.mainCategoryId);
        if (filters.categoryId) url.searchParams.append('categoryId', filters.categoryId);

        const response = await fetch(url.toString(), {
          headers: { ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
        });

        if (!response.ok) throw new Error('Failed to fetch classes');
        const result = await response.json();
        return result.data || result || [];
      },
    });
  };

  const assignClass = useMutation({
    mutationFn: async ({ courseId, classId }: { courseId: string; classId: string }) => {
      const response = await fetch(`${API_BASE_URL}/courses/assign-classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` })
        },
        body: JSON.stringify({ courseIds: [courseId], classIds: [classId] }),
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Failed to assign class');
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate the course query to update the "Assigned" list
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });

      // Manually update the "all classes" list to update the "Available" list
      queryClient.setQueryData(['classes', {}], (oldData: Class[] | undefined) => {
        if (!oldData) return [];
        
        // ✅ FIX: Use the `.id` property to match the data from your API
        return oldData.filter(c => c.id !== variables.classId);
      });

      toast.success("Class has been assigned successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const unassignClass = useMutation({
    mutationFn: async ({ courseId, classId }: { courseId: string; classId: string }) => {
      const response = await fetch(`${API_BASE_URL}/courses/unassign-classes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
          body: JSON.stringify({ courseIds: [courseId], classIds: [classId] }),
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Failed to unassign class');
      return response.json();
    },
    onSuccess: (data, variables) => {
        // Force a refetch for both queries on unassign
        queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
        queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'classes' });
        toast.success("Class has been unassigned successfully.");
    },
    onError: (error: Error) => {
        toast.error(error.message);
    }
  });
  const assignMultipleClasses = useMutation({
    mutationFn: async ({ courseId, classIds }: { courseId: string; classIds: string[] }) => {
      // ✅ 1. Use the same generic endpoint as your single assign function
      const url = `${API_BASE_URL}/courses/assign-classes`; 
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
        // ✅ 2. Send both courseIds and classIds in the payload
        body: JSON.stringify({ courseIds: [courseId], classIds: classIds }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to assign classes');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success(`${variables.classIds.length} classes assigned successfully.`);
      // Invalidate the queries to refresh both the "Assigned" and "Available" lists
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "An error occurred during assignment.");
    }
  });
  const unassignMultipleClasses = useMutation({
    mutationFn: async ({ courseId, classIds }: { courseId: string; classIds: string[] }) => {
      const url = `${API_BASE_URL}/courses/unassign-classes`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }) },
        body: JSON.stringify({ courseIds: [courseId], classIds }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to unassign classes');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success(`${variables.classIds.length} classes unassigned successfully.`);
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "An error occurred during unassignment.");
    }
  });

  return { getClasses, assignClass, unassignClass, assignMultipleClasses, unassignMultipleClasses };
}