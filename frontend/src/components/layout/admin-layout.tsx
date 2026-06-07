import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  ShoppingCart, 
  LayoutDashboard, 
  ListOrdered, 
  Users, 
  Building2, 
  CreditCard, 
  RefreshCcw, 
  BarChart3, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function AdminLayout({ children, currentTab }: { children: React.ReactNode, currentTab: string }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/dashboard/admin" },
    { id: "orders", label: "Orders", icon: ListOrdered, path: "/dashboard/admin/orders" },
    { id: "retailers", label: "Retailers", icon: Users, path: "/dashboard/admin/retailers" },
    { id: "brands", label: "Brands", icon: Building2, path: "/dashboard/admin/brands" },
    { id: "credits", label: "Credits", icon: CreditCard, path: "/dashboard/admin/credits" },
    { id: "exchanges", label: "Exchanges", icon: RefreshCcw, path: "/dashboard/admin/exchanges" },
    { id: "analytics", label: "Analytics", icon: BarChart3, path: "/dashboard/admin/analytics" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-secondary/95 backdrop-blur border-b border-border h-16 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <span className="font-heading text-lg font-bold text-foreground">FERI Admin</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-secondary border-r border-border transform transition-transform duration-200 ease-in-out flex flex-col
        md:relative md:translate-x-0
        ${mobileMenuOpen ? "translate-x-0 pt-16 md:pt-0" : "-translate-x-full"}
      `}>
        <div className="hidden md:flex h-16 items-center px-6 border-b border-border gap-2">
          <ShoppingCart className="w-6 h-6 text-primary" />
          <span className="font-heading text-xl font-bold text-foreground">FERI Admin</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setLocation(tab.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                <tab.icon className={`w-5 h-5 ${isActive ? "" : "text-muted-foreground"}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.phone}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            onClick={() => { logout(); setLocation("/"); }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0 overflow-hidden flex flex-col">
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
      
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
