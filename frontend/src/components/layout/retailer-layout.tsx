import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useGetMyCredit } from "@workspace/api-client-react";
import { ShoppingCart, Bell, Home, Package, ShoppingBag, ListOrdered, CreditCard, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function RetailerLayout({ children, currentTab }: { children: React.ReactNode, currentTab: string }) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: credit } = useGetMyCredit({ query: { enabled: !!user } });

  const tabs = [
    { id: "home", label: "Home", icon: Home, path: "/dashboard/retailer" },
    { id: "products", label: "Products", icon: Package, path: "/dashboard/retailer/products" },
    { id: "cart", label: "Cart", icon: ShoppingBag, path: "/dashboard/retailer/cart" },
    { id: "orders", label: "Orders", icon: ListOrdered, path: "/dashboard/retailer/orders" },
    { id: "credit", label: "Credit", icon: CreditCard, path: "/dashboard/retailer/credit" },
    { id: "profile", label: "Profile", icon: UserCircle, path: "/dashboard/retailer/profile" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:pb-0 pb-16">
      {/* Mobile-first Header */}
      <header className="sticky top-0 z-40 bg-secondary/95 backdrop-blur border-b border-border h-16 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <div className="flex flex-col leading-none">
            <span className="font-heading text-lg font-bold text-foreground">FERI</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {credit && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/50 font-numbers hidden sm:inline-flex">
              Credit: ₹{credit.available_limit.toLocaleString('en-IN')}
            </Badge>
          )}
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold">{user?.shop_name}</div>
              <div className="text-xs text-muted-foreground">{user?.city}</div>
            </div>
            <button className="relative p-2 rounded-full hover:bg-secondary border border-transparent hover:border-border transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Mobile Bottom Tab Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-secondary border-t border-border flex items-center justify-around h-16 px-2 md:hidden">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setLocation(tab.path)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className={`w-5 h-5 ${isActive ? "fill-primary/20" : ""}`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Desktop Sidebar (optional, but requested layout is bottom tabs for mobile, let's keep it simple with bottom tabs for now, maybe add desktop top nav or left nav later. Since it's mobile first, let's stick to the brief: Bottom tab navigation.) */}
      {/* For desktop, we could show tabs below header */}
      <div className="hidden md:flex border-b border-border bg-secondary/50 sticky top-16 z-30">
        <div className="container mx-auto px-4 flex gap-1">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setLocation(tab.path)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors ${
                  isActive 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
