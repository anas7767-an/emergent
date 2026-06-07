import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useGetMyCredit } from "@workspace/api-client-react";
import { useCart } from "@/contexts/cart-context";
import {
  ShoppingCart,
  Bell,
  Home,
  Package,
  ShoppingBag,
  ListOrdered,
  CreditCard,
  LogOut,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function RetailerLayout({ children, currentTab }: { children: React.ReactNode; currentTab: string }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: credit } = useGetMyCredit({ query: { enabled: !!user } });
  const { totalItems } = useCart();

  const tabs = [
    { id: "home", label: "Home", icon: Home, path: "/dashboard/retailer" },
    { id: "products", label: "Products", icon: Package, path: "/dashboard/retailer/products" },
    { id: "cart", label: "Cart", icon: ShoppingBag, path: "/dashboard/retailer/cart", badge: totalItems },
    { id: "orders", label: "Orders", icon: ListOrdered, path: "/dashboard/retailer/orders" },
    { id: "credit", label: "Credit", icon: CreditCard, path: "/dashboard/retailer/credit" },
  ];

  const initials = (user?.name || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="min-h-screen bg-paper flex flex-col pb-16 md:pb-0" data-testid="retailer-layout">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard/retailer" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#003087] flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-[#FFD700]" />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-heading text-lg font-extrabold text-[#003087]">FERI</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-[0.18em] font-semibold">
                {user?.city}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {credit && (
              <div
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/40"
                data-testid="header-credit-pill"
              >
                <CreditCard className="w-3.5 h-3.5 text-[#003087]" />
                <div className="leading-none">
                  <div className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Credit</div>
                  <div className="font-numbers font-extrabold text-sm text-[#003087]">
                    ₹{credit.available_limit.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            )}

            <button className="relative p-2 rounded-lg hover:bg-slate-100" data-testid="header-bell">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF9933] rounded-full" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100" data-testid="header-user-menu">
                  <div className="w-9 h-9 rounded-full bg-[#003087] text-[#FFD700] font-bold flex items-center justify-center text-sm">
                    {initials}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-semibold text-slate-900">{user?.shop_name}</div>
                  <div className="text-xs text-slate-500 font-normal">{user?.name} · {user?.phone}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    setLocation("/");
                  }}
                  className="text-red-600 focus:text-red-700"
                  data-testid="logout-btn"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* DESKTOP TABS */}
        <div className="hidden md:block border-t border-slate-100 bg-white/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1">
            {tabs.map((tab) => {
              const active = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setLocation(tab.path)}
                  className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all ${
                    active ? "text-[#003087]" : "text-slate-500 hover:text-slate-900"
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.badge && tab.badge > 0 ? (
                    <span className="ml-1 text-[10px] bg-[#FF9933] text-white font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                      {tab.badge}
                    </span>
                  ) : null}
                  {active && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#003087] rounded-full" />}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</main>

      {/* MOBILE BOTTOM TABS */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex items-center justify-around h-16 px-1 md:hidden" data-testid="mobile-tabs">
        {tabs.map((tab) => {
          const active = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setLocation(tab.path)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 relative ${
                active ? "text-[#003087]" : "text-slate-500"
              }`}
              data-testid={`mobile-tab-${tab.id}`}
            >
              <div className="relative">
                <tab.icon className={`w-5 h-5 ${active ? "stroke-[2.4]" : ""}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 text-[9px] bg-[#FF9933] text-white font-bold rounded-full px-1.5 py-0.5 min-w-[16px] text-center leading-none">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-semibold">{tab.label}</span>
              {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#003087] rounded-full" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
