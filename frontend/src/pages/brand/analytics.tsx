import { useGetBrandAnalytics } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, TrendingUp, RefreshCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function BrandAnalytics() {
  const { data: analytics, isLoading } = useGetBrandAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-xl" />
          <div className="space-y-6">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-heading">Analytics</h1>
        <p className="text-muted-foreground">Insights into your brand's performance.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card border-card-border/30 h-full flex flex-col">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-primary" /> City Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.city_breakdown || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a3a7a" vertical={false} />
                  <XAxis dataKey="city" stroke="#b0bec5" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#b0bec5" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255, 215, 0, 0.1)'}}
                    contentStyle={{ backgroundColor: '#0a1f5c', borderColor: '#1a3a7a', color: '#fff' }}
                  />
                  <Bar dataKey="revenue" fill="#FFD700" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 flex flex-col">
          <Card className="bg-card border-card-border/30 flex-1">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-primary" /> Top Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {analytics?.top_products?.map((product, i) => (
                  <div key={i} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center font-bold text-muted-foreground text-xs">
                        #{i+1}
                      </div>
                      <p className="font-medium text-sm line-clamp-1">{product.product_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold font-numbers text-sm text-primary">₹{product.revenue.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-muted-foreground">{product.units_sold} units</p>
                    </div>
                  </div>
                ))}
                {(!analytics?.top_products || analytics.top_products.length === 0) && (
                  <div className="p-8 text-center text-muted-foreground text-sm">No sales data available.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-card-border/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <RefreshCcw className="w-24 h-24 text-orange-500" />
            </div>
            <CardContent className="p-6 relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Exchange Rate</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold font-numbers text-orange-400">{analytics?.exchange_rate || 0}%</p>
                  <p className="text-xs text-muted-foreground mb-1">of total orders</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <RefreshCcw className="w-6 h-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
