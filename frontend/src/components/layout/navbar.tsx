import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="w-full border-b border-border bg-secondary/80 backdrop-blur supports-[backdrop-filter]:bg-secondary/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-primary" />
          <div className="flex flex-col leading-none">
            <span className="font-heading text-xl font-bold text-foreground">FERI</span>
            <span className="text-[10px] text-primary uppercase tracking-widest font-bold">Wholesale</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
          <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link href="/#brands" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">For Brands</Link>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link href={`/dashboard/${user?.role}`}>
              <Button className="font-semibold">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">Login</Button>
              </Link>
              <Link href="/register/retailer">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">Register Free</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
