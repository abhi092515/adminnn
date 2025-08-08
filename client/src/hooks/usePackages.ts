import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';

const API_BASE_URL = 'http://localhost:5099/api'; // Adjust if needed

// Interface for a single package
export interface Package {
    _id: string;
    name: string;
    price: number;
    image?: string;
    priority: number;
    status: 'active' | 'inactive';
}

// Interface for the API response which includes pagination
interface PackagesApiResponse {
    packages: Package[];
    totalPages: number;
    currentPage: number;
}

// --- API Functions ---
const fetchPackages = async (page = 1, search = ''): Promise<PackagesApiResponse> => {
    const response = await fetch(`${API_BASE_URL}?page=${page}&search=${search}`);
    if (!response.ok) throw new Error('Failed to fetch packages');
    const result = await response.json();
    return result.data;
};

const updatePackage = async ({ id, data }: { id: string, data: Partial<Package> }) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update package');
    return response.json();
};
const createPackage = async (formData: FormData) => {
  const response = await fetch(`${API_BASE_URL}/packages`, {
      method: 'POST',
      body: formData,
  });
  if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create package');
  }
  return response.json();
}
const fetchMainCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/main-categories`);
  if (!response.ok) throw new Error('Failed to fetch main categories');
  const result = await response.json();
  return result.data || []; // Return the data array
};
const fetchCategoriesByMain = async (mainCategoryId: string) => {
  if (!mainCategoryId) return [];
  const response = await fetch(`${API_BASE_URL}/categories?mainCategoryId=${mainCategoryId}`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  const result = await response.json();
  return result.data || []; // Return the data array
};
// ... (You would add create, delete API functions here)

// --- React Query Hook ---
export function usePackages(page: number, search: string) {
    const queryClient = useQueryClient();

    const packagesQuery = useQuery({
        queryKey: ['packages', { page, search }],
        queryFn: () => fetchPackages(page, search),
        keepPreviousData: true, // Smooth pagination experience
    });
    const createMutation = useMutation({
      mutationFn: createPackage,
      onSuccess: () => {
          toast.success('Package created successfully!');
          queryClient.invalidateQueries({ queryKey: ['packages'] });
      },
      onError: (err: Error) => toast.error(err.message),
  });


    const updateMutation = useMutation({
        mutationFn: updatePackage,
        onSuccess: () => {
            toast.success('Package status updated!');
            queryClient.invalidateQueries({ queryKey: ['packages'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    return {
        ...packagesQuery,
        updatePackage: updateMutation,
        createPackage: createMutation,
        // ... return createPackage, deletePackage mutations
    };
}
export function usePackageFormData() {
  const [mainCategoryId, setMainCategoryId] = useState<string>('');

  const mainCategoriesQuery = useQuery({
      queryKey: ['mainCategories'],
      queryFn: fetchMainCategories,
  });

  const categoriesQuery = useQuery({
      queryKey: ['categories', mainCategoryId],
      queryFn: () => fetchCategoriesByMain(mainCategoryId),
      enabled: !!mainCategoryId,
  });
  
  return {
      mainCategories: mainCategoriesQuery.data,
      categories: categoriesQuery.data,
      setMainCategoryId,
      isLoadingCategories: categoriesQuery.isLoading,
  };
}