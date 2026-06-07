import { useState } from "react";
import { useListProducts } from "@workspace/api-client-react";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Plus,
  ShieldCheck,
  TrendingUp,
  PackageSearch,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { ProductTile } from "@/components/product-tile";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "Snacks", label: "Snacks" },
  { key: "Biscuits", label: "Biscuits" },
  { key: "Noodles", label: "Noodles" },
  { key: "Staples", label: "Staples" },
  { key: "Detergent", label: "Detergent" },
  { key: "Beverages", label: "Beverages" },
  { key: "Candy", label: "Candy" },
  { key: "Spices", label: "Spices" },
];

export default function RetailerProducts() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState("popular");

  const { addToCart, cart } = useCart();
  const { toast } = useToast();

  const { data: products, isLoading } = useListProducts({
    search: search.length > 2 ? search : undefined,
    category: category !== "all" ? category : undefined,
    sort,
  });

  const handleAdd = (p: any) => {
    addToCart(p, p.moq || 1);
    toast({ title: "Added to cart", description: `${p.moq || 1}× ${p.name}` });
  };

  const cartQty = (pid: number) => cart.find((c) => c.product.id === pid)?.quantity ?? 0;

  return (
    <div className="space-y-6" data-testid="retailer-products">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Wholesale catalog</h1>
          <p className="text-sm text-slate-500">Browse {products?.length ?? 0}+ SKUs at retailer pricing</p>
        </div>
      </div>

      {/* SEARCH + SORT */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by name, brand or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 bg-white border-slate-200 rounded-xl focus-visible:border-[#003087] focus-visible:ring-[#003087]/20"
            data-testid="products-search"
          />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-[200px] h-12 bg-white border-slate-200 rounded-xl" data-testid="products-sort">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Popularity</SelectItem>
            <SelectItem value="new">Newest first</SelectItem>
            <SelectItem value="price_asc">Price: low → high</SelectItem>
            <SelectItem value="margin_desc">Margin: high → low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CATEGORY CHIPS */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" data-testid="category-chips">
        {CATEGORIES.map((c) => {
          const active = category === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`shrink-0 px-4 h-10 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                active
                  ? "bg-[#003087] text-white border border-[#003087] shadow-md shadow-[#003087]/20"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-[#003087]/40"
              }`}
              data-testid={`chip-${c.key}`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* GRID */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <PackageSearch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700">No products found</h3>
          <p className="text-sm text-slate-500 mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4" data-testid="products-grid">
          {products.map((p, i) => {
            const qty = cartQty(p.id);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.4) }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-[#003087]/30 hover:shadow-lg hover:shadow-slate-900/5 transition-all group flex flex-col"
                data-testid={`product-card-${p.id}`}
              >
                <div className="aspect-square relative overflow-hidden">
                  <ProductTile productId={p.id} category={p.category} size="md" />
                  {p.exchange_eligible && (
                    <div className="absolute top-2 left-2 bg-[#FFD700] text-[#003087] text-[10px] font-bold px-2 py-1 rounded-md inline-flex items-center gap-1 shadow-sm" data-testid={`exchange-badge-${p.id}`}>
                      <ShieldCheck className="w-3 h-3" />
                      60-day exchange
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-700 border border-emerald-300 text-[10px] font-bold px-2 py-1 rounded-md inline-flex items-center gap-1 shadow-sm" data-testid={`margin-badge-${p.id}`}>
                    <TrendingUp className="w-3 h-3" /> {p.margin_percent}%
                  </div>
                </div>
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{p.brand_name}</div>
                  <h3 className="font-semibold text-sm text-slate-900 line-clamp-2 mt-0.5 leading-snug" title={p.name}>
                    {p.name}
                  </h3>
                  <div className="mt-auto pt-3">
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <div className="text-[10px] text-slate-400 line-through font-numbers">MRP ₹{p.mrp}</div>
                        <div className="font-heading font-extrabold text-[#003087] text-lg leading-tight">₹{p.wholesale_price}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] uppercase tracking-widest font-bold text-slate-400">MOQ</div>
                        <div className="font-numbers font-bold text-slate-800 text-sm leading-none">{p.moq}</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAdd(p)}
                      className="w-full h-10 bg-[#003087] text-white hover:bg-[#002060] font-bold rounded-xl text-sm"
                      data-testid={`add-product-${p.id}`}
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      {qty > 0 ? `In cart · ${qty}` : "Add"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
