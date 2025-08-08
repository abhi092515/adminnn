"use client";

import { CourseForm } from "@/components/forms/course-form";
import { useCourseForm } from "@/hooks/use-course-form"; // Assuming this is your hook with the mutations
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const [_, setLocation] = useLocation();
  const courseId = params.id;
  const { toast } = useToast();
  
  // Get the query and mutation from your form hook
  const { getCourseByIdQuery, updateCourseMutation } = useCourseForm(courseId);

  // This function now correctly expects a FormData object directly from the form.
  const handleUpdateCourse = (formData: FormData) => {
    if (!courseId) return;
    
    // Pass the FormData directly to the mutation
    updateCourseMutation.mutate(
      { id: courseId, data: formData }, 
      {
        onSuccess: () => {
          toast({
            title: "Course Updated!",
            description: "The course details have been saved.",
          });
          setLocation("/courses");
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to update course: ${error.message}`,
            variant: "destructive",
          });
        },
      }
    );
  };

  if (getCourseByIdQuery.isLoading) {
    return (
        <div className="space-y-6 max-w-5xl">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-10 w-32 ml-auto" />
        </div>
    );
  }

  // The CourseForm component remains the same, passing the FormData to our handler
  return (
    <CourseForm 
      onSubmit={handleUpdateCourse}
      initialData={getCourseByIdQuery.data}
      isLoading={updateCourseMutation.isPending}
      mode="edit" 
    />
  );
}