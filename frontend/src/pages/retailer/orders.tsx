import { useState } from "react";
import { useListOrders, useUpdateOrderStatus } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Calendar, Clock, CheckCircle2, Truck, RefreshCcw } from "lucide-react";
import { format } from "date-fns";

export default function RetailerOrders() {
  const { data: orders, isLoading } = useListOrders();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock, label: "Pending" };
      case 'confirmed': return { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: CheckCircle2, label: "Confirmed" };
      case 'dispatched': return { color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Truck, label: "Dispatched" };
      case 'delivered': return { color: "bg-success/10 text-success border-success/20", icon: CheckCircle2, label: "Delivered" };
      case 'exchange_requested': return { color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: RefreshCcw, label: "Exchange Requested" };
      default: return { color: "bg-secondary text-foreground border-border", icon: Package, label: status };
    }
  };

  const getPaymentLabel = (type: string) => {
    switch(type) {
      case 'pay_now': return 'Pay Now';
      case 'net_15': return 'Net-15';
      case 'net_30': return 'Net-30';
      case 'net_60': return 'Net-60';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-heading">My Orders</h1>
        <p className="text-muted-foreground">Track your past and current deliveries.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
        </div>
      ) : orders?.length === 0 ? (
        <div className="text-center py-24 bg-secondary/50 rounded-xl border border-border">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold">No orders yet</h3>
          <p className="text-muted-foreground">Start buying products to see them here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders?.map(order => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <Card key={order.id} className="bg-card border-card-border/30 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-border bg-secondary/30 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-bold font-numbers text-lg">#{order.id.toString().padStart(6, '0')}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {order.created_at ? format(new Date(order.created_at), 'MMM dd, yyyy') : 'Unknown Date'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`${statusConfig.color} font-medium flex items-center gap-1 px-3 py-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </Badge>
                      <Badge variant="secondary" className="font-numbers bg-secondary border-border">
                        {getPaymentLabel(order.payment_type)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 flex flex-col sm:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Items</h4>
                      <ul className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-sm">
                            <span className="flex-1">{item.product_name}</span>
                            <span className="text-muted-foreground font-numbers mx-4">x{item.quantity}</span>
                            <span className="font-numbers">₹{item.unit_price}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6 min-w-[200px] flex flex-col justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                        <p className="text-2xl font-bold font-numbers text-primary">₹{order.total_amount.toLocaleString('en-IN')}</p>
                      </div>
                      
                      {order.status === 'delivered' && order.payment_type === 'net_60' && (
                        <button className="text-xs text-primary font-bold hover:underline mt-4 flex items-center sm:justify-end gap-1">
                          <RefreshCcw className="w-3 h-3" />
                          Request Exchange
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
