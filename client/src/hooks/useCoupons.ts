import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type Coupon } from "@/types";

const API_BASE_URL = "http://localhost:5099/api/coupons";

// --- API Functions ---
const fetchCoupons = async (): Promise<Coupon[]> => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) throw new Error("Failed to fetch coupons");
  const result = await response.json();
  return result.data || [];
};

const fetchCouponById = async (couponId: string): Promise<Coupon> => {
  const response = await fetch(`${API_BASE_URL}/${couponId}`);
  if (!response.ok) throw new Error("Failed to fetch coupon details");
  const result = await response.json();
  return result.data;
};

// Note: Coupon data is JSON, not FormData
const createCoupon = async (couponData: Omit<Coupon, 'id'>): Promise<any> => {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(couponData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || "Failed to create coupon");
  }
  return response.json();
};

const updateCoupon = async ({ couponId, couponData }: { couponId: string, couponData: Partial<Coupon> }): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/${couponId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(couponData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || "Failed to update coupon");
  }
  return response.json();
};

const deleteCoupon = async (couponId: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/${couponId}`, { method: "DELETE" });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || "Failed to delete coupon");
  }
  return response.json();
};

// --- Custom Hook ---
export function useCoupons() {
  const queryClient = useQueryClient();

  const couponsQuery = useQuery({ queryKey: ["coupons"], queryFn: fetchCoupons });

  const getCouponByIdQuery = (couponId: string | undefined) => useQuery({
    queryKey: ['coupon-details', couponId],
    queryFn: () => fetchCouponById(couponId!),
    enabled: !!couponId,
  });

  const createCouponMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: (res) => {
      toast.success(res.msg || "Coupon created successfully!");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateCouponMutation = useMutation({
    mutationFn: updateCoupon,
    onSuccess: (res, { couponId }) => {
      toast.success(res.msg || "Coupon updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      queryClient.invalidateQueries({ queryKey: ["coupon-details", couponId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
  
  const deleteCouponMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: (res) => {
      toast.success(res.msg || "Coupon deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    coupons: couponsQuery.data,
    isLoading: couponsQuery.isLoading,
    getCouponById: getCouponByIdQuery,
    createCoupon: createCouponMutation,
    updateCoupon: updateCouponMutation,
    deleteCoupon: deleteCouponMutation,
  };
}