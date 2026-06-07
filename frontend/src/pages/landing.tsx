import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Truck, CreditCard, ShoppingBag, Store, Building2, ChevronRight, ShoppingCart } from "lucide-react";
import { Link } from "wouter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Subtle Hexagonal Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'100\' viewBox=\'0 0 60 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0l25.98 15v30L30 60 4.02 45V15L30 0zm0 100l25.98-15v-30L30 40 4.02 55v30L30 100z\' fill=\'%23FFD700\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }} 
        />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading mb-6 tracking-tight">
            India's Retail <span className="text-primary">Supply Engine</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect directly with FMCG brands. Get instant credit up to 60 days. Stock your kirana shop effortlessly and grow your business with zero friction.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register/retailer">
              <Button size="lg" className="h-14 px-8 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto shadow-xl shadow-primary/20">
                <Store className="mr-2 h-5 w-5" />
                I am a Retailer
              </Button>
            </Link>
            <Link href="/register/brand">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-2 border-primary/50 text-foreground hover:bg-primary/10 w-full sm:w-auto backdrop-blur">
                <Building2 className="mr-2 h-5 w-5" />
                I am a Brand
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-secondary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50 text-center">
            <div className="px-4">
              <div className="text-3xl font-bold font-numbers text-primary mb-1">130+</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Retailers</div>
            </div>
            <div className="px-4">
              <div className="text-3xl font-bold font-numbers text-primary mb-1">₹15L+</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Revenue Processed</div>
            </div>
            <div className="px-4">
              <div className="text-3xl font-bold font-numbers text-primary mb-1">2</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Cities</div>
            </div>
            <div className="px-4">
              <div className="text-3xl font-bold font-numbers text-primary mb-1">60-Day</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Exchange Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Three simple steps to transform your retail sourcing.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: "01", title: "Register & KYC", desc: "Sign up in 2 minutes. Complete fast digital KYC to unlock your credit limit." },
              { step: "02", title: "Browse & Order", desc: "Discover products at wholesale rates. Add to cart and choose your credit term." },
              { step: "03", title: "Credit & Grow", desc: "Get delivery. Pay later with Net-15, 30, or 60 days. Enjoy 60-day exchange." }
            ].map((s, i) => (
              <div key={i} className="relative p-6 text-center group">
                <div className="w-16 h-16 rounded-full bg-secondary border border-primary/30 flex items-center justify-center mx-auto mb-6 text-2xl font-bold font-numbers text-primary group-hover:scale-110 transition-transform">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                {i < 2 && <ChevronRight className="hidden md:block absolute top-14 -right-4 w-8 h-8 text-border" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Platform Features</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Built for the modern Indian retailer.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShoppingBag, title: "Curated Catalog", desc: "Access high-margin FMCG, snacks, and local brands directly." },
              { icon: CreditCard, title: "Instant Credit", desc: "Dynamic credit limits tailored to your shop's performance." },
              { icon: ShieldCheck, title: "60-Day Exchange", desc: "Unsold inventory? Exchange it hassle-free within 60 days." },
              { icon: Truck, title: "Fast Delivery", desc: "Optimized logistics ensuring your shelves are never empty." }
            ].map((f, i) => (
              <Card key={i} className="bg-card border-card-border/30 hover:border-primary/60 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Brands */}
      <section id="brands" className="py-24 bg-background border-t border-border">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Building2 className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Get distribution without a sales team</h2>
          <p className="text-lg text-muted-foreground mb-8">
            List your products on FERI and instantly reach hundreds of verified kirana stores. We handle the credit risk, logistics, and payments.
          </p>
          <Link href="/register/brand">
            <Button size="lg" className="bg-primary text-primary-foreground font-bold h-12 px-8">
              List Your Products Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary border-t border-border py-12 mt-auto">
        <div className="container mx-auto px-4 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <span className="font-heading text-lg font-bold">FERI</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-muted-foreground">
            <a href="mailto:anas983shaikh@gmail.com" className="hover:text-primary transition-colors">anas983shaikh@gmail.com</a>
            <Link href="/login" className="hover:text-primary transition-colors">Retailer Login</Link>
            <Link href="/login" className="hover:text-primary transition-colors">Brand Portal</Link>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2025 Feri Wholesale
          </div>
        </div>
      </footer>
    </div>
  );
}
