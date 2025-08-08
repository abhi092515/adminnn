import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { type Sale } from "@/types";

interface RecentSalesProps {
  sales: Sale[];
  salesCount: number;
}

export function RecentSales({ sales, salesCount }: RecentSalesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>
          You made {salesCount.toLocaleString()} sales this month.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {sales.map((sale) => (
          <div key={sale.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src={sale.user.avatarUrl} alt="Avatar" />
              <AvatarFallback>{sale.user.initials}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{sale.user.name}</p>
              <p className="text-sm text-muted-foreground">{sale.user.email}</p>
            </div>
            <div className="ml-auto font-medium">+${sale.amount.toFixed(2)}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}