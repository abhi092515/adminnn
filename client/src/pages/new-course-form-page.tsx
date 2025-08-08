"use client";

import { CourseForm } from "@/components/forms/course-form";
import { useCourseForm } from "@/hooks/use-course-form";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function NewCoursePage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { createCourseMutation } = useCourseForm();

  const handleCreateCourse = async (data: any) => {

    console.log("Attempting to create course with data:", data);

    const formData = new FormData();

    // Append all fields to FormData
    Object.keys(data).forEach(key => {
      const value = data[key];

      if (key === 'banner' && value instanceof File) {
          formData.append(key, value);
      } else if (Array.isArray(value)) {
          // Send arrays with "[]" notation
          value.forEach((item: string) => {
              formData.append(`${key}[]`, item);
          });
      } else if (typeof value === 'boolean') {
          // Send booleans as 'true' or 'false' strings
          formData.append(key, String(value));
      } else if (value !== null && value !== undefined) {
          formData.append(key, value);
      }
  });

    createCourseMutation.mutate(formData, {
      onSuccess: () => {
        toast({
          title: "Course Created!",
          description: "The new course has been successfully added.",
        });
        setLocation("/courses"); 
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to create course: ${error.message}`,
          variant: "destructive",
        });
      },
    });
  };
  
  return (
    <CourseForm 
      onSubmit={handleCreateCourse}
      isLoading={createCourseMutation.isPending}
      mode="create" 
    />
  );
}