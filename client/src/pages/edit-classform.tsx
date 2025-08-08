"use client";

import { ClassForm } from "@/components/forms/class-form";
import { useClassForm } from "@/hooks/use-class-form";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditCourseClassPage({ params }: { params: { id: string } }) {
  const [_, setLocation] = useLocation();
  const classId = params.id;
  const { toast } = useToast();
  const { getClassByIdQuery, updateClassMutation } = useClassForm(classId);

  const handleUpdateClass = async (data: any) => {
    if (!classId) return;

    const formData = new FormData();
    Object.keys(data).forEach(key => {
        // Don't append the image if it's an old URL string from the database
        if (key === 'image' && typeof data.image === 'string') {
          return; 
        }
        formData.append(key, data[key]);
    });
    
    updateClassMutation.mutate({ id: classId, data: formData }, {
        onSuccess: () => {
          toast({
            title: "Class Updated!",
            description: "The class details have been saved.",
          });
          setLocation("/course-classes");
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to update class: ${error.message}`,
            variant: "destructive",
          });
        },
      });
  };

  if (getClassByIdQuery.isLoading) {
    return (
        <div className="space-y-6 max-w-4xl p-4 md:p-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-10 w-32" />
        </div>
    );
  }

  if (getClassByIdQuery.isError) {
    return <div className="text-red-600 p-6">Error loading class data. Please try again.</div>;
  }
  
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Class</h1>
      </div>
      <div className="max-w-4xl">
        <ClassForm 
          onSubmit={handleUpdateClass}
          initialData={getClassByIdQuery.data}
          isLoading={updateClassMutation.isPending}
          mode="edit" 
        />
      </div>
    </div>
  );
}