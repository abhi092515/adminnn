import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type Banner } from "@/types";

const API_BASE_URL = "http://localhost:5099/api/v2/banners";

// --- API Functions ---

const fetchBanners = async (): Promise<Banner[]> => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) throw new Error("Failed to fetch banners");
  const result = await response.json();
  return result.data || [];
};

const fetchBannerById = async (bannerId: string): Promise<Banner> => {
  const response = await fetch(`${API_BASE_URL}/${bannerId}`);
  if (!response.ok) throw new Error("Failed to fetch banner details");
  const result = await response.json();
  return result.data;
};

const createBanner = async (formData: FormData): Promise<any> => {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || "Failed to create banner");
  }
  return response.json();
};

const updateBanner = async ({ bannerId, formData }: { bannerId: string, formData: FormData }): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/${bannerId}`, {
    method: "PUT",
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || "Failed to update banner");
  }
  return response.json();
};

const updateBannerStatus = async ({ bannerId, isActive }: { bannerId: string, isActive: boolean }): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/${bannerId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || "Failed to update banner status");
  }
  return response.json();
};

const deleteBanner = async (bannerId: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/${bannerId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || "Failed to delete banner");
  }
  return response.json();
};

// --- Custom Hook ---

export function useBanners() {
  const queryClient = useQueryClient();

  // Query to fetch all banners
  const bannersQuery = useQuery({
    queryKey: ["banners"],
    queryFn: fetchBanners,
  });

  // Query to fetch a single banner by ID
  const getBannerByIdQuery = (bannerId: string | undefined) => useQuery({
    queryKey: ['banner-details', bannerId],
    queryFn: () => fetchBannerById(bannerId!),
    enabled: !!bannerId, // Only run if bannerId is provided
  });

  // Mutation to create a new banner
  const createBannerMutation = useMutation({
    mutationFn: createBanner,
    onSuccess: (res) => {
      toast.success(res.msg || "Banner created successfully!");
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Mutation to update a banner's full details
  const updateBannerMutation = useMutation({
    mutationFn: updateBanner,
    onSuccess: (res, { bannerId }) => {
      toast.success(res.msg || "Banner updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      queryClient.invalidateQueries({ queryKey: ["banner-details", bannerId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Mutation to update only a banner's status
  const updateStatusMutation = useMutation({
    mutationFn: updateBannerStatus,
    onSuccess: (res) => {
      toast.success(res.msg || "Banner status updated!");
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Mutation to delete a banner
  const deleteBannerMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: (res) => {
      toast.success(res.msg || "Banner deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    // Queries
    banners: bannersQuery.data,
    isLoading: bannersQuery.isLoading,
    error: bannersQuery.error,
    getBannerById: getBannerByIdQuery,

    // Mutations
    createBanner: createBannerMutation,
    updateBanner: updateBannerMutation,
    updateStatus: updateStatusMutation,
    deleteBanner: deleteBannerMutation,
  };
}