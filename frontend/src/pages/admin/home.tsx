import { useGetAdminSummary } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ShoppingBag, DollarSign, CreditCard, RefreshCcw, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminHome() {
  const { data: summary, isLoading } = useGetAdminSummary();

  const statCards = [
    { title: "Total Retailers", value: summary?.total_retailers, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Orders Today", value: summary?.orders_today, icon: ShoppingBag, color: "text-purple-400", bg: "bg-purple-400/10" },
    { title: "Revenue Today", value: summary?.revenue_today ? `₹${summary.revenue_today.toLocaleString('en-IN')}` : '₹0', icon: DollarSign, color: "text-success", bg: "bg-success/10" },
    { title: "Active Credits", value: summary?.active_credits, icon: CreditCard, color: "text-primary", bg: "bg-primary/10" },
    { title: "Pending Exchanges", value: summary?.pending_exchanges, icon: RefreshCcw, color: "text-orange-400", bg: "bg-orange-400/10" },
    { title: "New Registrations", value: summary?.new_registrations, icon: UserPlus, color: "text-pink-400", bg: "bg-pink-400/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading">Admin Overview</h1>
        <p className="text-muted-foreground">Platform-wide metrics and operations.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="bg-card border-card-border/30">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <p className="text-3xl font-bold font-numbers">{stat.value || 0}</p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholders for Charts/Recent activity since requirements focus on general overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card border-card-border/30 h-96 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Revenue Chart (Available in Analytics)</p>
          </div>
        </Card>
        <Card className="bg-card border-card-border/30 h-96 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Recent Retailer KYC Requests</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Quick fallback for missing icon
function BarChart3(props: any) {
  return <DollarSign {...props} />;
}
