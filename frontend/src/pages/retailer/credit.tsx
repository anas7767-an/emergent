import { useGetRetailerCredit } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, TrendingUp, AlertCircle, History, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

const STATUS_PILL = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  overdue: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
} as const;

export default function RetailerCredit() {
  const { data: credit, isLoading } = useGetRetailerCredit();

  const used = credit?.used_amount ?? 0;
  const limit = credit?.credit_limit ?? 0;
  const available = credit?.available_limit ?? 0;
  const usagePct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto" data-testid="retailer-credit">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Credit & payments</h1>
        <p className="text-sm text-slate-500">Manage your credit limit and track payment dues</p>
      </div>

      {/* TOP CARDS */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Big credit card */}
        <div className="lg:col-span-2 bg-[#003087] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden" data-testid="credit-main-card">
          <div className="absolute -right-16 -top-16 w-72 h-72 bg-[#FFD700]/20 blur-3xl rounded-full" />
          <div className="absolute right-6 top-6 opacity-15">
            <CreditCard className="w-32 h-32 text-[#FFD700]" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 text-blue-100 mb-2">
              <CreditCard className="w-4 h-4 text-[#FFD700]" />
              <span className="text-xs uppercase tracking-widest font-bold">Available credit</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-14 w-64 bg-white/20" />
            ) : (
              <div className="font-heading text-5xl sm:text-6xl font-extrabold text-[#FFD700] tracking-tight">
                ₹{available.toLocaleString("en-IN")}
              </div>
            )}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-blue-100 mb-2">
                <span>Used: ₹{used.toLocaleString("en-IN")}</span>
                <span>Limit: ₹{limit.toLocaleString("en-IN")}</span>
              </div>
              <div className="h-2 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FFD700] rounded-full transition-all duration-700"
                  style={{ width: `${usagePct}%` }}
                />
              </div>
              <div className="text-[11px] text-blue-100 mt-2">{usagePct.toFixed(1)}% of limit utilized</div>
            </div>
          </div>
        </div>

        {/* Increase request card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 flex flex-col" data-testid="credit-increase-card">
          <div className="w-12 h-12 rounded-xl bg-[#FF9933]/15 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-[#FF9933]" />
          </div>
          <h3 className="font-heading text-lg font-extrabold text-slate-900 mb-2">Need more credit?</h3>
          <p className="text-sm text-slate-600 mb-5 flex-1">
            FERI auto-increases your limit based on payment history. Pay 3 orders on time to unlock ₹50,000 more.
          </p>
          <button
            className="h-11 px-4 bg-[#003087] text-white hover:bg-[#002060] font-bold rounded-xl text-sm w-full disabled:opacity-50"
            disabled
            data-testid="request-increase-btn"
          >
            Request increase (soon)
          </button>
        </div>
      </div>

      {/* HISTORY */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-[#003087]" />
          <h2 className="font-heading text-lg font-extrabold text-slate-900">Payment history</h2>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : !credit?.entries || credit.entries.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No credit history</p>
            <p className="text-xs text-slate-500 mt-1">Place a credit-based order to see entries here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100" data-testid="credit-entries-list">
            {credit.entries.map((e) => {
              const dueDate = new Date(e.due_date);
              const overdue = e.status === "pending" && dueDate < new Date();
              const StatusIcon = e.status === "paid" ? CheckCircle2 : overdue ? AlertCircle : Clock;
              const statusClass = STATUS_PILL[overdue ? "overdue" : (e.status as keyof typeof STATUS_PILL)] || STATUS_PILL.pending;
              return (
                <div key={e.id} className="px-5 sm:px-6 py-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors" data-testid={`credit-entry-${e.id}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Order #{(e.order_id ?? 0).toString().padStart(5, "0")}</div>
                      <div className="text-xs text-slate-500">
                        Due {format(dueDate, "dd MMM yyyy")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className={`text-[10px] uppercase tracking-widest font-bold border px-2 py-1 rounded-md inline-flex items-center gap-1 ${statusClass}`}>
                      <StatusIcon className="w-3 h-3" />
                      {overdue ? "overdue" : e.status}
                    </span>
                    <div className="font-numbers font-extrabold text-slate-900 text-base sm:text-lg w-24 text-right">
                      ₹{e.amount.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
