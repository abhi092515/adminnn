import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:5099/api/series';

export interface Series {
    _id: string;
    name: string;
    durationMinutes: number;
    questionCount: number;
    attemptLimit: number;
    status: 'active' | 'inactive';
}

// --- API Functions ---
const fetchSeries = async (search: string = ''): Promise<Series[]> => {
    const url = new URL(API_BASE_URL);
    if (search) {
        url.searchParams.append('search', search);
    }
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch series');
    const result = await response.json();
    return result.data;
};

// ✅ ADD: API function for creating a series (handles FormData)
const createSeries = async (formData: FormData) => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create series');
    }
    return response.json();
};

const updateSeries = async ({ id, data }: { id: string, data: Partial<Series> }) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update series');
    return response.json();
};

// --- React Query Hook ---
export function useSeries(search: string = '') {
    const queryClient = useQueryClient();

    const seriesQuery = useQuery({
        queryKey: ['series', search],
        queryFn: () => fetchSeries(search),
    });

    // ✅ ADD: The mutation for creating a new series
    const createMutation = useMutation({
        mutationFn: createSeries,
        onSuccess: () => {
            toast.success('Series created successfully!');
            queryClient.invalidateQueries({ queryKey: ['series'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const updateMutation = useMutation({
        mutationFn: updateSeries,
        onSuccess: () => {
            toast.success('Series status updated!');
            queryClient.invalidateQueries({ queryKey: ['series'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    return {
        series: seriesQuery.data,
        isLoading: seriesQuery.isLoading,
        updateSeries: updateMutation,
        createSeries: createMutation, // ✅ ADD: Return the mutation from the hook
    };
}