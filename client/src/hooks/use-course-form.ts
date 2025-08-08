import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = "http://localhost:5099/api";
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// Define the API endpoint for courses
const COURSE_API_URL = `${API_BASE_URL}/courses`;

// Define the type for a single course, matching your form's expectations
export interface Course {
    id: string;
    banner: string;
    title: string;
    assignHeader: string;
    description: string[];
    mainCategory: { id: string; mainCategoryName: string; };
    category: { id: string; categoryName: string; };
    priority: number;
    status: "active" | "inactive" | "draft";
    isLive: boolean;
    isFree: boolean;
    shortDescriptions: string[];
    courseHighlights: string[];
    faq: string; // Or a more complex object if needed
    courseInfo?: string[];
}

export function useCourseForm(courseId?: string) {
  const queryClient = useQueryClient();

  // Query to fetch a single course for the edit form
  const getCourseByIdQuery = useQuery<Course | null>({
    queryKey: ["course-details", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const response = await fetch(`${COURSE_API_URL}/${courseId}`, {
        headers: { Authorization: `Bearer ${API_TOKEN}` },
      });
      if (!response.ok) throw new Error("Failed to fetch course details");
      const result = await response.json();
      return result.data;
    },
    enabled: !!courseId,
  });

  // Mutation for creating a new course
  const createCourseMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(COURSE_API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${API_TOKEN}` },
        body: data,
      });
      if (!response.ok) {
         const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create course");
      }
      return response.json();
    },
    onSuccess: () => {
      // Use a unique query key for your main course list
      queryClient.invalidateQueries({ queryKey: ["courses-all"] });
    },
  });

  // Mutation for updating an existing course
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      // Note: Some backends use POST with method override for FormData updates
      const response = await fetch(`${COURSE_API_URL}/${id}`, {
        method: "PUT", 
        headers: { Authorization: `Bearer ${API_TOKEN}` },
        body: data,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update course");
      }
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["courses-all"] });
      queryClient.invalidateQueries({ queryKey: ["course-details", id] });
    },
  });

  return {
    getCourseByIdQuery,
    createCourseMutation,
    updateCourseMutation,
  };
}