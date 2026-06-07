import { useListAllOrders, useUpdateOrderStatus, getListAllOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Package, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OrderStatusUpdateStatus } from "@workspace/api-client-react";
import { useState } from "react";

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: orders, isLoading } = useListAllOrders({ status: statusFilter !== "all" ? statusFilter : undefined });
  const updateStatus = useUpdateOrderStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStatusUpdate = (orderId: number, status: OrderStatusUpdateStatus) => {
    updateStatus.mutate({ id: orderId, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Order Updated" });
        queryClient.invalidateQueries({ queryKey: getListAllOrdersQueryKey() });
      },
      onError: (err) => {
        toast({ title: "Update Failed", description: err?.data?.error, variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Order Management</h1>
          <p className="text-muted-foreground">Monitor and manage all platform orders.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-secondary border-border">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-border hover:bg-secondary">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : orders?.length === 0 ? (
        <div className="text-center py-24 bg-secondary/50 rounded-xl border border-border">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold">No orders found</h3>
        </div>
      ) : (
        <div className="bg-card border border-card-border/30 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/80 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Retailer</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders?.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-numbers font-medium text-primary">#{order.id.toString().padStart(6, '0')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.created_at ? format(new Date(order.created_at), 'MMM dd, yyyy') : '-'}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.retailer_name}</div>
                      <div className="text-xs text-muted-foreground">{order.retailer_city}</div>
                    </td>
                    <td className="px-6 py-4 font-numbers font-bold">₹{order.total_amount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-secondary font-numbers border-border uppercase text-[10px]">
                        {order.payment_type.replace('_', '-')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`capitalize ${
                        order.status === 'delivered' ? 'bg-success/10 text-success border-success/30' :
                        order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/30'
                      }`}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Select 
                        value={order.status} 
                        onValueChange={(val: any) => handleStatusUpdate(order.id, val)}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="dispatched">Dispatched</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
