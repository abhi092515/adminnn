"use client";

import { QuestionForm } from "@/components/forms/QuestionForm";
import { useQuestions } from "@/hooks/useQuestions";
import { useLocation } from "wouter";

export default function NewQuestionPage() {
    const { createQuestion } = useQuestions();
    const [_, setLocation] = useLocation();

    const handleSubmit = (values: any) => {
        createQuestion.mutate(values);
    };

    const handleFinish = (values: any) => {
        createQuestion.mutate(values, {
            onSuccess: () => setLocation('/questions'),
        });
    };

    return (
      <div className="flex flex-col min-h-screen">
          <header className="px-4 pt-6">
              <h2 className="text-3xl font-bold tracking-tight mb-6">ADD Questions</h2>
          </header>
          <div className="flex-1 overflow-y-auto">
              <QuestionForm 
                  onSubmit={handleSubmit} 
                  onFinish={handleFinish}
                  isPending={createQuestion.isPending} 
              />
          </div>
      </div>
  );
}