import { useListOrders } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  Truck,
  RefreshCcw,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const STATUS = {
  pending: { color: "text-amber-700 bg-amber-50 border-amber-200", icon: Clock, label: "Pending" },
  confirmed: { color: "text-blue-700 bg-blue-50 border-blue-200", icon: CheckCircle2, label: "Confirmed" },
  dispatched: { color: "text-indigo-700 bg-indigo-50 border-indigo-200", icon: Truck, label: "Dispatched" },
  delivered: { color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle2, label: "Delivered" },
  exchange_requested: { color: "text-orange-700 bg-orange-50 border-orange-200", icon: RefreshCcw, label: "Exchange" },
} as const;

const PAYMENT = {
  pay_now: "Pay now",
  net_15: "Net-15",
  net_30: "Net-30",
  net_60: "Net-60",
} as const;

export default function RetailerOrders() {
  const { data: orders, isLoading } = useListOrders();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-6 max-w-5xl mx-auto" data-testid="retailer-orders">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">My orders</h1>
        <p className="text-sm text-slate-500">Track your past and current deliveries</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700">No orders yet</h3>
          <p className="text-sm text-slate-500 mt-1">Place your first order to see it here</p>
        </div>
      ) : (
        <div className="space-y-3" data-testid="orders-list">
          {orders.map((o) => {
            const cfg = STATUS[o.status as keyof typeof STATUS] || STATUS.pending;
            const StatusIcon = cfg.icon;
            const open = expanded === o.id;
            return (
              <div key={o.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden" data-testid={`order-${o.id}`}>
                <button
                  onClick={() => setExpanded(open ? null : o.id)}
                  className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#003087]/10 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-[#003087]" />
                    </div>
                    <div>
                      <div className="font-heading font-extrabold text-slate-900 text-base sm:text-lg">
                        #{o.id.toString().padStart(5, "0")}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {o.created_at ? format(new Date(o.created_at), "dd MMM yyyy") : "—"}
                        <span>·</span>
                        <span>{o.items?.length || 0} items</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                      {PAYMENT[o.payment_type as keyof typeof PAYMENT]}
                    </span>
                    <span className={`text-xs font-bold border px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 ${cfg.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                    <div className="text-right">
                      <div className="font-numbers font-extrabold text-[#003087] text-lg">
                        ₹{o.total_amount.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {open && (
                  <div className="border-t border-slate-100 p-4 sm:p-5 bg-slate-50/50">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Items</div>
                    <div className="space-y-2">
                      {o.items?.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-b-0">
                          <div className="font-medium text-slate-800 flex-1 truncate pr-3">{it.product_name}</div>
                          <div className="font-numbers text-slate-500 mr-4">× {it.quantity}</div>
                          <div className="font-numbers font-bold text-slate-800 w-20 text-right">
                            ₹{(it.unit_price * it.quantity).toLocaleString("en-IN")}
                          </div>
                        </div>
                      ))}
                    </div>
                    {o.status === "delivered" && o.payment_type === "net_60" && (
                      <button
                        className="mt-4 text-xs font-bold text-[#003087] hover:underline inline-flex items-center gap-1.5"
                        data-testid={`exchange-${o.id}`}
                      >
                        <RefreshCcw className="w-3 h-3" /> Request exchange
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
