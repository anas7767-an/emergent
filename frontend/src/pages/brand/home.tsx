import { useAuth } from "@/hooks/use-auth";
import { useGetBrandSummary, useGetRecentOrders } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ListOrdered, DollarSign, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrandHome() {
  const { user } = useAuth();
  
  const { data: summary, isLoading } = useGetBrandSummary({
    query: { enabled: !!user }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading">Welcome, {user?.brand_name}</h1>
        <p className="text-muted-foreground">Monitor your brand's performance across kiranas.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-card-border/30">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-secondary rounded-lg border border-border">
                <Package className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Products</p>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-3xl font-bold font-numbers">{summary?.total_products || 0}</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-card-border/30">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-secondary rounded-lg border border-border">
                <ListOrdered className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Orders</p>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-3xl font-bold font-numbers">{summary?.total_orders || 0}</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-card-border/30">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-secondary rounded-lg border border-border">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Revenue This Month</p>
            {isLoading ? <Skeleton className="h-8 w-24" /> : (
              <p className="text-3xl font-bold font-numbers">₹{summary?.revenue_this_month?.toLocaleString('en-IN') || 0}</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-card-border/30">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-secondary rounded-lg border border-border">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Top Product</p>
            {isLoading ? <Skeleton className="h-8 w-full" /> : (
              <p className="text-lg font-bold leading-tight truncate" title={summary?.top_selling_product || 'None'}>
                {summary?.top_selling_product || 'No sales yet'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-8 border border-border rounded-xl bg-secondary/50 text-center">
        <h3 className="text-xl font-bold mb-2">Grow your distribution</h3>
        <p className="text-muted-foreground mb-4">List more products to reach over 130+ active retailers on FERI.</p>
        <button className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90">
          Add New Product
        </button>
      </div>
    </div>
  );
}
