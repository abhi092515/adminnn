import { useQuery } from "@tanstack/react-query";
import { type Analytics } from "@/types";

const fetchAnalytics = async (): Promise<Analytics> => {
  // In a real app, you would fetch this from your API:
  // const response = await fetch("/api/analytics");
  // if (!response.ok) throw new Error("Failed to fetch analytics");
  // return response.json();

  // For now, we'll use mock data.
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        totalRevenue: "45231.89",
        subscriptions: 2350,
        salesCount: 12231,
        usersCount: 895,
      });
    }, 500); // Simulate network delay
  });
};

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
  });
}