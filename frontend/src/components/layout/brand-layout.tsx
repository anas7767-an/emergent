import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingCart, LayoutDashboard, PackageSearch, ListOrdered, BarChart3, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BrandLayout({ children, currentTab }: { children: React.ReactNode, currentTab: string }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const tabs = [
    { id: "home", label: "Overview", icon: LayoutDashboard, path: "/dashboard/brand" },
    { id: "products", label: "My Products", icon: PackageSearch, path: "/dashboard/brand/products" },
    { id: "orders", label: "Orders", icon: ListOrdered, path: "/dashboard/brand/orders" },
    { id: "analytics", label: "Analytics", icon: BarChart3, path: "/dashboard/brand/analytics" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:pb-0 pb-16">
      <header className="sticky top-0 z-40 bg-secondary/95 backdrop-blur border-b border-border h-16 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <div className="flex flex-col leading-none">
            <span className="font-heading text-lg font-bold text-foreground">FERI Brand</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold">{user?.brand_name}</div>
            <div className="text-xs text-muted-foreground">{user?.product_category}</div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { logout(); setLocation("/"); }}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

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
    </div>
  );
}
