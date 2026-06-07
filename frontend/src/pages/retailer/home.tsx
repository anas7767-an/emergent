import { useAuth } from "@/hooks/use-auth";
import {
  useGetRetailerSummary,
  useGetFeaturedProducts,
  useGetRecentOrders,
} from "@workspace/api-client-react";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Truck,
  CreditCard,
  ChevronRight,
  Plus,
  TrendingUp,
  Sparkles,
  Calendar,
  Package,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
};

export default function RetailerHome() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: summary, isLoading: isLoadingSummary } = useGetRetailerSummary({ query: { enabled: !!user } });
  const { data: featuredProducts, isLoading: isLoadingFeatured } = useGetFeaturedProducts({ query: { enabled: !!user } });
  const { data: recentOrders, isLoading: isLoadingOrders } = useGetRecentOrders({ query: { enabled: !!user } });

  const handleAdd = (p: any) => {
    addToCart(p, p.moq || 1);
    toast({ title: "Added to cart", description: `${p.moq || 1}× ${p.name}` });
  };

  return (
    <div className="space-y-8" data-testid="retailer-home">
      {/* WELCOME BANNER */}
      <motion.div {...fadeUp} className="rounded-3xl bg-gradient-to-br from-[#003087] to-[#1a3a8a] text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-60 h-60 bg-[#FFD700]/20 blur-3xl rounded-full" />
        <div className="absolute -right-4 top-4 opacity-20">
          <Sparkles className="w-32 h-32 text-[#FFD700]" />
        </div>
        <div className="relative">
          <p className="text-blue-100/90 text-sm font-medium mb-1">Namaste 🙏</p>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5" data-testid="welcome-shop">
            {user?.shop_name}
          </h1>
          <p className="text-blue-100/90 text-sm">{user?.city} · KYC {user?.kyc_status}</p>
          <Link href="/dashboard/retailer/products">
            <Button className="mt-5 h-11 bg-[#FFD700] text-[#003087] hover:bg-[#FFC700] font-bold rounded-xl" data-testid="start-shopping-btn">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Start shopping
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div {...fadeUp} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-slate-900/5 transition-shadow" data-testid="stat-total-orders">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-[#003087]/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#003087]" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-widest font-bold text-slate-500">Total orders</p>
          {isLoadingSummary ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-3xl font-heading font-extrabold text-slate-900 mt-1">{summary?.total_orders ?? 0}</p>
          )}
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-slate-900/5 transition-shadow" data-testid="stat-pending">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-[#FF9933]/15 flex items-center justify-center">
              <Truck className="w-5 h-5 text-[#FF9933]" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-widest font-bold text-slate-500">Pending deliveries</p>
          {isLoadingSummary ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-3xl font-heading font-extrabold text-slate-900 mt-1">{summary?.pending_deliveries ?? 0}</p>
          )}
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.16 }} className="bg-[#003087] text-white rounded-2xl p-5 relative overflow-hidden hover:shadow-xl hover:shadow-[#003087]/20 transition-shadow" data-testid="stat-credit">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#FFD700]/15 blur-2xl rounded-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-[#FFD700] flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#003087]" />
              </div>
            </div>
            <p className="text-xs uppercase tracking-widest font-bold text-blue-100">Available credit</p>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-28 mt-1 bg-white/20" />
            ) : (
              <p className="text-3xl font-heading font-extrabold text-[#FFD700] mt-1">
                ₹{(summary?.available_credit ?? 0).toLocaleString("en-IN")}
              </p>
            )}
            <Link href="/dashboard/retailer/credit" className="mt-3 inline-flex items-center gap-1 text-xs text-blue-100 font-semibold hover:text-[#FFD700]">
              View history <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* FEATURED PRODUCTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900">Featured products</h2>
            <p className="text-sm text-slate-500">Top-selling SKUs across all categories</p>
          </div>
          <Link href="/dashboard/retailer/products" className="text-sm font-bold text-[#003087] hover:underline whitespace-nowrap" data-testid="view-all-products">
            View all →
          </Link>
        </div>

        {isLoadingFeatured ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {featuredProducts?.slice(0, 8).map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-[#003087]/30 hover:shadow-lg hover:shadow-slate-900/5 transition-all group" data-testid={`featured-product-${p.id}`}>
                <div className="aspect-square bg-slate-50 overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{p.brand_name}</div>
                  <h3 className="font-semibold text-sm text-slate-900 line-clamp-2 mt-0.5 leading-snug" title={p.name}>
                    {p.name}
                  </h3>
                  <div className="flex items-end justify-between mt-3">
                    <div>
                      <div className="text-[10px] text-slate-400 line-through font-numbers">₹{p.mrp}</div>
                      <div className="font-heading font-extrabold text-[#003087] text-lg leading-tight">₹{p.wholesale_price}</div>
                    </div>
                    <button
                      onClick={() => handleAdd(p)}
                      className="w-9 h-9 rounded-lg bg-[#003087] text-white flex items-center justify-center hover:bg-[#002060] transition-colors"
                      data-testid={`add-featured-${p.id}`}
                      aria-label={`Add ${p.name} to cart`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    <TrendingUp className="w-3 h-3" /> {p.margin_percent}% margin
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECENT ORDERS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900">Recent orders</h2>
            <p className="text-sm text-slate-500">Your latest 5 orders</p>
          </div>
          <Link href="/dashboard/retailer/orders" className="text-sm font-bold text-[#003087] hover:underline">
            All orders →
          </Link>
        </div>

        {isLoadingOrders ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : !recentOrders || recentOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">No orders yet</p>
            <p className="text-xs text-slate-500 mt-1">Browse products to place your first order</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {recentOrders.slice(0, 5).map((o) => (
              <Link
                key={o.id}
                href="/dashboard/retailer/orders"
                className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-colors"
                data-testid={`recent-order-${o.id}`}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#003087]/10 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-[#003087]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm">#{o.id.toString().padStart(5, "0")}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {o.created_at ? format(new Date(o.created_at), "dd MMM yyyy") : "—"}
                      <span>·</span>
                      <span>{o.items?.length || 0} items</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-numbers font-extrabold text-[#003087] text-base">
                    ₹{o.total_amount.toLocaleString("en-IN")}
                  </div>
                  <div className={`text-[10px] uppercase tracking-wider font-bold mt-0.5 ${
                    o.status === "delivered" ? "text-emerald-600" : o.status === "dispatched" ? "text-blue-600" : "text-amber-600"
                  }`}>
                    {o.status}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
