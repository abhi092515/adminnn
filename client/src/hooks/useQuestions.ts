import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:5099/api'; // Adjust if needed

// --- Interfaces ---
export interface Question {
    _id: string;
    questionId: string;
    question: string;
    topic: { name: string };
    section: { name: string };
    difficultyLevel: number;
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

// ✅ ADD: API function to create a question
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

// --- React Query Hook ---
export function useQuestions(filters: QuestionFilters = {}) {
    const queryClient = useQueryClient();

    const questionsQuery = useQuery({
        queryKey: ['questions', filters],
        queryFn: () => fetchQuestions(filters),
        keepPreviousData: true,
    });

    // ✅ ADD: The mutation for creating a new question
    const createMutation = useMutation({
        mutationFn: createQuestion,
        onSuccess: () => {
            toast.success("Question created successfully!");
            queryClient.invalidateQueries({ queryKey: ['questions'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    // ✅ UPDATED: The hook now returns the mutations alongside the query results
    return {
        data: questionsQuery.data,
        isLoading: questionsQuery.isLoading,
        isFetching: questionsQuery.isFetching,
        createQuestion: createMutation,
        // updateQuestion: updateMutation, // You would add update/delete mutations here as well
    };
}