import { useListOrders, useUpdateOrderStatus, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Package, Clock, CheckCircle2, Truck, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OrderStatusUpdateStatus } from "@workspace/api-client-react";

export default function BrandOrders() {
  const { data: orders, isLoading } = useListOrders();
  const updateStatus = useUpdateOrderStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStatusUpdate = (orderId: number, status: OrderStatusUpdateStatus) => {
    updateStatus.mutate({ id: orderId, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Order Updated" });
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      },
      onError: (err) => {
        toast({ title: "Update Failed", description: err?.data?.error, variant: "destructive" });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case 'confirmed': return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case 'dispatched': return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case 'delivered': return "bg-success/10 text-success border-success/20";
      default: return "bg-secondary text-foreground border-border";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-heading">Orders Received</h1>
        <p className="text-muted-foreground">Manage and dispatch orders to kirana stores.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : orders?.length === 0 ? (
        <div className="text-center py-24 bg-secondary/50 rounded-xl border border-border">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold">No orders yet</h3>
          <p className="text-muted-foreground">When retailers buy your products, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders?.map(order => (
            <Card key={order.id} className="bg-card border-card-border/30 overflow-hidden">
              <div className="flex flex-col md:flex-row border-b border-border bg-secondary/30 p-4 gap-4 justify-between md:items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{order.retailer_name}</h3>
                    <p className="text-xs text-muted-foreground">{order.retailer_city}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-numbers text-muted-foreground">
                    #{order.id.toString().padStart(6, '0')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {order.created_at ? format(new Date(order.created_at), 'MMM dd, yyyy') : ''}
                  </span>
                  <Badge variant="outline" className={`capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Order Items</h4>
                  <ul className="space-y-2">
                    {order.items?.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm items-center">
                        <span className="flex-1">{item.product_name}</span>
                        <span className="text-muted-foreground font-numbers bg-secondary px-2 py-0.5 rounded mx-4">x{item.quantity}</span>
                        <span className="font-numbers">₹{(item.unit_price * item.quantity).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:w-64 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 flex flex-col">
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">Order Total</p>
                    <p className="text-2xl font-bold font-numbers text-primary">₹{order.total_amount.toLocaleString('en-IN')}</p>
                  </div>
                  
                  <div className="mt-auto space-y-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Update Status</p>
                    <Select 
                      value={order.status} 
                      onValueChange={(val: any) => handleStatusUpdate(order.id, val)}
                      disabled={order.status === 'delivered' || order.status === 'exchange_requested'}
                    >
                      <SelectTrigger className="w-full bg-background border-border">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirm Order</SelectItem>
                        <SelectItem value="dispatched">Dispatch Order</SelectItem>
                        <SelectItem value="delivered">Mark Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
