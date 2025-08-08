"use client";

import { ClassForm } from "@/components/forms/class-form";
import { useClassForm } from "@/hooks/use-class-form";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function NewCourseClassPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { createClassMutation } = useClassForm();

  const handleCreateClass = async (data: any) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    createClassMutation.mutate(formData, {
      onSuccess: () => {
        toast({
          title: "Class Created!",
          description: "The new class has been successfully added.",
        });
        setLocation("/course-classes")
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to create class: ${error.message}`,
          variant: "destructive",
        });
      },
    });
  };
  
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add New Class</h1>
      </div>
      <div className="max-w-4xl">
        <ClassForm 
          onSubmit={handleCreateClass}
          isLoading={createClassMutation.isPending}
          mode="create" 
        />
      </div>
    </div>
  );
}