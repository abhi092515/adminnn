// src/hooks/useQuestions.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:5099/api'; // Adjust if needed

// --- Interfaces ---
export interface Question {
    _id: string;
    questionId: string;
    question: { en: string; hi: string };
    topic: { name: string; id: string };
    section: { name: string; id: string };
    difficultyLevel: number;
    [key: string]: any;
}

export interface QuestionFilters {
  page?: number;
  limit?: number;
  questionId?: string;
  keywords?: string;
  tags?: string;
  questionType?: 'single' | 'comprehension';
  status?: 'verified' | 'not_verified' | 'fresh' | 'in_use';
  sectionId?: string;
  topicId?: string;
  subTopicId?: string;
  options?: '4' | '5' | 'less_than_4';
  language?: 'hindi' | 'english';
  difficultyLevel?: string;
  answerType?: 'optional' | 'numerical' | 'multi-select';
  isReported?: boolean;
  isDuplicate?: 'only_duplicate' | 'only_original';
  reviewer?: string;
  admin?: string;
  reportedType?: 'formatting_issue' | 'no_solution' | 'others' | 'wrong_answer' | 'wrong_question';
}

interface QuestionsApiResponse {
    questions: Question[];
    totalPages: number;
    currentPage: number;
    totalResults: number;
}

// --- API Functions ---

const fetchQuestions = async (filters: QuestionFilters): Promise<QuestionsApiResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            params.append(key, String(value));
        }
    });
    const response = await fetch(`${API_BASE_URL}/questions?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch questions');
    const result = await response.json();
    return result.data;
};

const createQuestion = async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create question');
    }
    return response.json();
};

const fetchQuestionById = async (id: string): Promise<Question> => {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`);
    if (!response.ok) throw new Error('Failed to fetch question');
    const result = await response.json();
    return result.data;
};

const updateQuestion = async ({ id, data }: { id: string, data: any }) => {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update question');
    }
    return response.json();
};

const deleteQuestion = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete question');
    }
    return response.json();
};


// --- React Query Hook ---
export function useQuestions(filters: QuestionFilters = {}) {
    const queryClient = useQueryClient();

    const questionsQuery = useQuery({
        queryKey: ['questions', filters],
        queryFn: () => fetchQuestions(filters),
        keepPreviousData: true,
    });

    const createMutation = useMutation({
        mutationFn: createQuestion,
        onSuccess: () => {
            toast.success("Question created successfully!");
            queryClient.invalidateQueries({ queryKey: ['questions'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    // ✅ FIX: Moved the updateMutation logic inside the main hook.
    const updateMutation = useMutation({
        mutationFn: updateQuestion,
        onSuccess: (data, variables) => {
            toast.success("Question updated successfully!");
            queryClient.invalidateQueries({ queryKey: ['questions'] });
            queryClient.invalidateQueries({ queryKey: ['question', variables.id] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    // ✅ FIX: Moved the deleteMutation logic inside the main hook.
    const deleteMutation = useMutation({
        mutationFn: deleteQuestion,
        onSuccess: () => {
            toast.success("Question deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ['questions'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    // ✅ FIX: Moved the useQuestionById logic inside the main hook.
    const useQuestionById = (id: string) => {
        return useQuery({
            queryKey: ['question', id],
            queryFn: () => fetchQuestionById(id),
            enabled: !!id,
        });
    };

    return {
        data: questionsQuery.data,
        isLoading: questionsQuery.isLoading,
        isFetching: questionsQuery.isFetching,
        createQuestion: createMutation,
        updateQuestion: updateMutation,
        deleteQuestion: deleteMutation,
        useQuestionById,
    };
}