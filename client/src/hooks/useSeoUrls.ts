import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ✅ FIX: Updated the base URL to match your server's address and path.
const API_BASE_URL = 'http://localhost:5099/api/seourls';

export interface SeoUrl {
  _id: string;
  page_url: string;
  page_title: string;
  description: string;
  seo_keywords: string[];
  no_index: boolean;
  no_follow: boolean;
  canonical_url?: string;
  redirection_url?: string;
  isActive: boolean;
}

// --- API Functions ---
const fetchSeoUrls = async (): Promise<SeoUrl[]> => {
  const response = await fetch(`${API_BASE_URL}/list`, {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error('Failed to fetch SEO URLs');
  return response.json();
};

const fetchSeoUrlById = async (id: string): Promise<SeoUrl> => {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  if (!response.ok) throw new Error('Failed to fetch SEO URL details');
  const result = await response.json();
  return result.data;
};

const createSeoUrl = async (data: Omit<SeoUrl, '_id'>) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create SEO URL');
  return response.json();
};

// ✅ FIX: This function now correctly targets your PUT endpoint for updates.
const updateSeoUrl = async ({ id, data }: { id: string; data: Partial<SeoUrl> }) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update SEO URL');
  return response.json();
};

const deleteSeoUrl = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete SEO URL');
  return response.json();
};

// --- React Query Hook ---
export function useSeoUrls() {
  const queryClient = useQueryClient();

  const seoUrlsQuery = useQuery({
    queryKey: ['seoUrls'],
    queryFn: fetchSeoUrls,
  });

  const getSeoUrlById = (id?: string) => useQuery({
    queryKey: ['seoUrl', id],
    queryFn: () => fetchSeoUrlById(id!),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: createSeoUrl,
    onSuccess: () => {
      toast.success('SEO URL created successfully!');
      queryClient.invalidateQueries({ queryKey: ['seoUrls'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateSeoUrl,
    onSuccess: (_, { id }) => {
      toast.success('SEO URL updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['seoUrls'] });
      queryClient.invalidateQueries({ queryKey: ['seoUrl', id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSeoUrl,
    onSuccess: () => {
      toast.success('SEO URL deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['seoUrls'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    seoUrls: seoUrlsQuery.data,
    isLoading: seoUrlsQuery.isLoading,
    getSeoUrlById,
    createSeoUrl: createMutation,
    updateSeoUrl: updateMutation,
    deleteSeoUrl: deleteMutation,
  };
}