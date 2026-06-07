import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./contexts/cart-context";
import { useAuth } from "./hooks/use-auth";
import NotFound from "@/pages/not-found";

// Auth/Public Pages
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterRetailerPage from "@/pages/register-retailer";
import RegisterBrandPage from "@/pages/register-brand";

// Layouts
import { RetailerLayout } from "@/components/layout/retailer-layout";
import { BrandLayout } from "@/components/layout/brand-layout";
import { AdminLayout } from "@/components/layout/admin-layout";

// Retailer Pages
import RetailerHome from "@/pages/retailer/home";
import RetailerProducts from "@/pages/retailer/products";
import RetailerCart from "@/pages/retailer/cart";
import RetailerOrders from "@/pages/retailer/orders";
import RetailerCredit from "@/pages/retailer/credit";

// Brand Pages
import BrandHome from "@/pages/brand/home";
import BrandProducts from "@/pages/brand/products";
import BrandOrders from "@/pages/brand/orders";
import BrandAnalytics from "@/pages/brand/analytics";

// Admin Pages
import AdminHome from "@/pages/admin/home";
import AdminOrders from "@/pages/admin/orders";
import AdminRetailers from "@/pages/admin/retailers";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, role, layout: Layout, tab, ...rest }: any) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  if (role && user?.role !== role) {
    return <Redirect to={`/dashboard/${user?.role}`} />;
  }
  
  if (Layout) {
    return (
      <Layout currentTab={tab}>
        <Component {...rest} />
      </Layout>
    );
  }
  
  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register/retailer" component={RegisterRetailerPage} />
      <Route path="/register/brand" component={RegisterBrandPage} />
      
      {/* Retailer Routes */}
      <Route path="/dashboard/retailer">
        <ProtectedRoute component={RetailerHome} role="retailer" layout={RetailerLayout} tab="home" />
      </Route>
      <Route path="/dashboard/retailer/products">
        <ProtectedRoute component={RetailerProducts} role="retailer" layout={RetailerLayout} tab="products" />
      </Route>
      <Route path="/dashboard/retailer/cart">
        <ProtectedRoute component={RetailerCart} role="retailer" layout={RetailerLayout} tab="cart" />
      </Route>
      <Route path="/dashboard/retailer/orders">
        <ProtectedRoute component={RetailerOrders} role="retailer" layout={RetailerLayout} tab="orders" />
      </Route>
      <Route path="/dashboard/retailer/credit">
        <ProtectedRoute component={RetailerCredit} role="retailer" layout={RetailerLayout} tab="credit" />
      </Route>
      
      {/* Brand Routes */}
      <Route path="/dashboard/brand">
        <ProtectedRoute component={BrandHome} role="brand" layout={BrandLayout} tab="home" />
      </Route>
      <Route path="/dashboard/brand/products">
        <ProtectedRoute component={BrandProducts} role="brand" layout={BrandLayout} tab="products" />
      </Route>
      <Route path="/dashboard/brand/orders">
        <ProtectedRoute component={BrandOrders} role="brand" layout={BrandLayout} tab="orders" />
      </Route>
      <Route path="/dashboard/brand/analytics">
        <ProtectedRoute component={BrandAnalytics} role="brand" layout={BrandLayout} tab="analytics" />
      </Route>

      {/* Admin Routes */}
      <Route path="/dashboard/admin">
        <ProtectedRoute component={AdminHome} role="admin" layout={AdminLayout} tab="overview" />
      </Route>
      <Route path="/dashboard/admin/orders">
        <ProtectedRoute component={AdminOrders} role="admin" layout={AdminLayout} tab="orders" />
      </Route>
      <Route path="/dashboard/admin/retailers">
        <ProtectedRoute component={AdminRetailers} role="admin" layout={AdminLayout} tab="retailers" />
      </Route>

      {/* Profile Catch-all */}
      <Route path="/dashboard/:role/profile">
        {() => (
          <div className="p-8 text-center text-muted-foreground">Profile Settings placeholder</div>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </CartProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
