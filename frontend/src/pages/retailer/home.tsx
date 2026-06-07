import { useAuth } from "@/hooks/use-auth";
import { useGetRetailerSummary, useGetFeaturedProducts, useGetRecentOrders } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Truck, CreditCard, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function RetailerHome() {
  const { user } = useAuth();
  
  const { data: summary, isLoading: isLoadingSummary } = useGetRetailerSummary({
    query: { enabled: !!user }
  });
  
  const { data: featuredProducts, isLoading: isLoadingFeatured } = useGetFeaturedProducts({
    query: { enabled: !!user }
  });

  const { data: recentOrders, isLoading: isLoadingOrders } = useGetRecentOrders({
    query: { enabled: !!user }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading">Namaste, {user?.shop_name}!</h1>
        <p className="text-muted-foreground">Here is your shop's overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-card-border/30 shadow-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Orders</p>
              {isLoadingSummary ? <Skeleton className="h-8 w-16" /> : (
                <p className="text-3xl font-bold font-numbers">{summary?.total_orders || 0}</p>
              )}
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-card-border/30 shadow-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Pending Deliveries</p>
              {isLoadingSummary ? <Skeleton className="h-8 w-16" /> : (
                <p className="text-3xl font-bold font-numbers">{summary?.pending_deliveries || 0}</p>
              )}
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-primary shadow-md shadow-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CreditCard className="w-24 h-24 text-primary" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-medium text-primary mb-1">Available Credit</p>
            {isLoadingSummary ? <Skeleton className="h-8 w-32 bg-primary/20" /> : (
              <p className="text-3xl font-bold font-numbers text-foreground">₹{summary?.available_credit?.toLocaleString('en-IN') || 0}</p>
            )}
            <Link href="/dashboard/retailer/credit" className="text-xs text-primary mt-2 flex items-center font-medium hover:underline">
              View Credit History <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-heading">Featured Products</h2>
          <Link href="/dashboard/retailer/products" className="text-sm text-primary hover:underline">View All</Link>
        </div>
        
        {isLoadingFeatured ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map(i => <Skeleton key={i} className="min-w-[250px] h-[300px] rounded-xl" />)}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {featuredProducts?.map(product => (
              <Card key={product.id} className="min-w-[250px] md:min-w-[280px] bg-card border-card-border/20 snap-start flex-shrink-0 hover:border-primary/50 transition-colors">
                <div className="aspect-square bg-secondary rounded-t-xl overflow-hidden flex items-center justify-center p-4">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="object-contain h-full w-full" />
                  ) : (
                    <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold truncate" title={product.name}>{product.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{product.brand_name || 'Generic Brand'}</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-muted-foreground line-through">MRP ₹{product.mrp}</p>
                      <p className="font-bold font-numbers text-primary">₹{product.wholesale_price}</p>
                    </div>
                    <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded">
                      {product.margin_percent}% Margin
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
