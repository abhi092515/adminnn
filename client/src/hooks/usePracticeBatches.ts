import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:5099/api/practice-batches'; // Adjust if needed

export interface PracticeBatch {
    _id: string;
    title: string;
    shortDescription: string;
    image?: string;
    status: 'active' | 'inactive';
}

// --- API Functions ---
const fetchPracticeBatches = async (): Promise<PracticeBatch[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch practice batches');
    const result = await response.json();
    return result.data;
};

const updatePracticeBatch = async ({ id, data }: { id: string, data: Partial<PracticeBatch> }) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update practice batch');
    return response.json();
};

// ✅ ADD: API function to create a batch using FormData
const createPracticeBatch = async (formData: FormData) => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create batch');
    }
    return response.json();
};


// --- React Query Hook ---
export function usePracticeBatches() {
    const queryClient = useQueryClient();

    const practiceBatchesQuery = useQuery({
        queryKey: ['practiceBatches'],
        queryFn: fetchPracticeBatches,
    });

    const updateMutation = useMutation({
        mutationFn: updatePracticeBatch,
        onSuccess: () => {
            toast.success('Batch status updated!');
            queryClient.invalidateQueries({ queryKey: ['practiceBatches'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });
    
    // ✅ ADD: The mutation for creating a new batch
    const createMutation = useMutation({
        mutationFn: createPracticeBatch,
        onSuccess: () => {
            toast.success('Batch created successfully!');
            queryClient.invalidateQueries({ queryKey: ['practiceBatches'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    return {
        batches: practiceBatchesQuery.data,
        isLoading: practiceBatchesQuery.isLoading,
        updatePracticeBatch: updateMutation,
        createPracticeBatch: createMutation, // ✅ ADD: Return the mutation from the hook
    };
}