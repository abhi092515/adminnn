// src/pages/AddNewQuestionPage.tsx

"use client";

import { QuestionForm } from "@/components/forms/QuestionForm"; // Adjust path if needed
import { useQuestions } from "@/hooks/useQuestions";
import { useLocation } from "wouter";
import { toast } from "sonner";

// This interface must match the one in your QuestionForm
interface BackendPayload {
    mainCategory: string;
    category: string;
    sectionId: string;
    topicId: string;
    // ... include all other properties from your form's payload
}

export default function AddNewQuestionPage() {
    const { createQuestion } = useQuestions();
    const [_, setLocation] = useLocation();

    // ✅ This single function handles both "Finish" and "Next Question" clicks.
    const handleSubmit = (data: BackendPayload, isFinished: boolean) => {
        
        createQuestion.mutate(data, {
            onSuccess: () => {
                // This block runs after the API call is successful.
                
                if (isFinished) {
                    // If the user clicked "Finish", show a final success message and redirect.
                    toast.success("Question created successfully! Redirecting...");
                    setLocation('/questions');
                }
                // If the user clicked "Next Question" (isFinished is false),
                // the form will handle its own toast message and reset.
                // No action is needed here.
            },
            onError: (error) => {
                // The error toast is already handled globally in your useQuestions hook.
                console.error("Failed to create question:", error);
            }
        });
    };

    return (
      <div className="flex flex-col min-h-screen p-4 sm:p-6 md:p-8">
          <header className="pb-6">
              <h1 className="text-3xl font-bold tracking-tight">Add New Question</h1>
              <p className="text-muted-foreground pt-1">Fill out the form to add a new question to the database.</p>
          </header>
          <div className="flex-1">
              {/* ✅ The form receives the single 'onSubmit' prop and the loading state. */}
              <QuestionForm 
                  onSubmit={handleSubmit} 
                  isPending={createQuestion.isPending} 
              />
          </div>
      </div>
  );
}