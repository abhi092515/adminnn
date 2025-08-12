// src/pages/EditQuestionPage.tsx

"use client";

import { QuestionForm } from "@/components/forms/QuestionForm";
import { useQuestions } from "@/hooks/useQuestions";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// This interface must match the one in your QuestionForm
interface BackendPayload {
    mainCategory: string;
    category: string;
    sectionId: string;
    topicId: string;
    // ... include all other properties
}

// This function transforms the detailed API response into the flat structure the form expects
const transformApiDataToFormValues = (question: any) => {
    if (!question) return null;

    // Set up default empty options
    const optionsEnglish = Array(5).fill({ text: "", isCorrect: false });
    const optionsHindi = Array(5).fill({ text: "", isCorrect: false });

    // Populate the options arrays with actual data if it exists
    if (Array.isArray(question.options)) {
        question.options.forEach((opt: any, index: number) => {
            if (index < 5) {
                optionsEnglish[index] = {
                    text: opt.en || "",
                    // The answer from the backend is the index of the correct option
                    isCorrect: String(index) === question.answer?.en, 
                };
                optionsHindi[index] = {
                    text: opt.hi || "",
                    isCorrect: String(index) === question.answer?.en,
                };
            }
        });
    }

    return {
        mainCategory: question.mainCategory,
        category: question.category,
        sectionId: question.sectionId,
        topicId: question.topicId,
        subTopicId: question.subTopicId,
        quesType: question.quesType || "single_choice",
        answerType: question.answerType || "optional",
        difficultyLevel: String(question.difficultyLevel || "3"),
        verificationStatus: question.isVerified ? "verified" : "not_verified",
        comprehensionEnglish: question.comprehension?.en || "",
        questionEnglish: question.question?.en || "",
        solutionEnglish: question.solution?.en || "",
        optionsEnglish,
        comprehensionHindi: question.comprehension?.hi || "",
        questionHindi: question.question?.hi || "",
        solutionHindi: question.solution?.hi || "",
        optionsHindi,
        numericalAnswerRange: question.answerType === 'numerical' ? question.answer?.en : "",
        marks: question.marks || 4,
        priority: question.priority || 1,
        customerId: question.customerId || "",
        quesStatus: question.quesStatus || "fresh",
    };
};

export default function EditQuestionPage() {
    const [, params] = useRoute("/questions/edit/:id");
    const questionId = params?.id || '';
    
    const [, setLocation] = useLocation();
    const { updateQuestion, useQuestionById } = useQuestions();

    // Fetch the specific question's data
    const { data: questionData, isLoading } = useQuestionById(questionId);

    // Prepare the data for the form
    const initialValues = transformApiDataToFormValues(questionData);

    // Define the submit handler for the edit action
    const handleSubmit = (data: BackendPayload) => {
        updateQuestion.mutate({ id: questionId, data }, {
            onSuccess: () => {
                // On success, navigate back to the list of questions
                setLocation('/questions');
            }
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-4 p-8">
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 sm:p-6 md:p-8">
            <header className="pb-6">
                <h1 className="text-3xl font-bold tracking-tight">Edit Question</h1>
                <p className="text-muted-foreground pt-1">Modify the details of the question below.</p>
            </header>
            <div className="flex-1">
                <QuestionForm 
                    onSubmit={(data) => handleSubmit(data)}
                    isPending={updateQuestion.isPending} 
                    initialValues={initialValues}
                />
            </div>
        </div>
    );
}