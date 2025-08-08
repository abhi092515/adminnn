import { DollarSign, Users, ShoppingCart, UserCheck } from "lucide-react";
import { AnalyticsCard } from "@/components/ui/analytics-card";
import { RecentSales } from "@/components/ui/recent-sales";
import { RevenueChart } from "@/components/ui/revenue-chart";
import { useAnalytics } from "@/hooks/use-analytics";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  
  const { data: recentSales, isLoading: salesLoading } = useQuery({
    queryKey: ["/api/sales/recent?limit=5"],
  });

  if (analyticsLoading || salesLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="col-span-2 h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  const formatCurrency = (amount: string) => {
    return `$${parseFloat(amount).toLocaleString()}`;
  };

  return (
    <div className="space-y-8">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <AnalyticsCard
          title="Subscriptions"
          value={analytics.subscriptions.toLocaleString()}
          icon={Users}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <AnalyticsCard
          title="Sales"
          value={analytics.salesCount.toLocaleString()}
          icon={ShoppingCart}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <AnalyticsCard
          title="Users Count"
          value={analytics.usersCount.toLocaleString()}
          icon={UserCheck}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <RevenueChart />

        {/* Recent Sales */}
        <RecentSales 
          sales={recentSales || []} 
          salesCount={analytics.salesCount}
        />
      </div>
    </div>
  );
}
