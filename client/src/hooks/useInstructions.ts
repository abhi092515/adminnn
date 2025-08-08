import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:5099/api'; // Adjust if needed

// ✅ UPDATED: The interface now matches your new, more detailed model
export interface Instruction {
  _id: string;
  status: 'active' | 'inactive';
  series?: { // Can be undefined or null
      _id: string;
      name: string;
  } | null;
  generalInstructionEnglish?: string;
  specificInstructionEnglish?: string;
  generalInstructionHindi?: string;
  specificInstructionHindi?: string;
}

export interface Series {
    _id: string;
    name: string;
}

// --- API Functions ---

const fetchInstructions = async (seriesName: string = ''): Promise<Instruction[]> => {
    const url = new URL(`${API_BASE_URL}/instructions`);
    if (seriesName) {
        url.searchParams.append('seriesName', seriesName);
    }
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch instructions');
    const result = await response.json();
    return result.data || [];
};

const fetchSeriesList = async (): Promise<Series[]> => {
    const response = await fetch(`${API_BASE_URL}/series/list`);
    if (!response.ok) throw new Error('Failed to fetch series list');
    const result = await response.json();
    return result.data || [];
};

const updateInstruction = async ({ id, data }: { id: string, data: Partial<Instruction> }) => {
    const response = await fetch(`${API_BASE_URL}/instructions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update instruction');
    return response.json();
};
const fetchInstructionById = async (id: string): Promise<Instruction> => {
  const response = await fetch(`${API_BASE_URL}/instructions/${id}`);
  if (!response.ok) throw new Error('Failed to fetch instruction details');
  const result = await response.json();
  return result.data;
};

const createInstruction = async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/instructions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create instruction');
    }
    return response.json();
};
const getInstructionById = (id?: string) => useQuery({
  queryKey: ['instruction', id],
  queryFn: () => fetchInstructionById(id!),
  enabled: !!id, // The query will not run until an ID is provided
});


// --- React Query Hooks ---

// ✅ This hook is for the LIST PAGE (get all, update status, delete)
export function useInstructions(seriesName: string = '') {
    const queryClient = useQueryClient();

    const instructionsQuery = useQuery({
        queryKey: ['instructions', seriesName],
        queryFn: () => fetchInstructions(seriesName),
    });

    const createMutation = useMutation({
        mutationFn: createInstruction,
        onSuccess: () => {
            toast.success('Instruction created successfully!');
            queryClient.invalidateQueries({ queryKey: ['instructions'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const updateMutation = useMutation({
        mutationFn: updateInstruction,
        onSuccess: () => {
            toast.success('Instruction status updated!');
            queryClient.invalidateQueries({ queryKey: ['instructions'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    return {
        instructions: instructionsQuery.data,
        isLoading: instructionsQuery.isLoading,
        updateInstruction: updateMutation,
        createInstruction: createMutation,
        getInstructionById
    };
}

// ✅ This hook is for the FORM PAGE (get dropdown data)
export function useInstructionFormData() {
    const seriesListQuery = useQuery({
        queryKey: ['seriesList'],
        queryFn: fetchSeriesList,
    });

    return {
        seriesList: seriesListQuery.data,
        isLoadingSeries: seriesListQuery.isLoading,
    };
}