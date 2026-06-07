import { useState } from "react";
import { useListProducts } from "@workspace/api-client-react";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShoppingCart, Plus, ShieldCheck, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function RetailerProducts() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("popular");
  
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: products, isLoading } = useListProducts({
    search: search.length > 2 ? search : undefined,
    category: category !== "all" ? category : undefined,
    sort
  }, { query: { queryKey: ['/api/products', { search, category, sort }] } });

  const handleAddToCart = (product: any) => {
    addToCart(product, product.moq || 1);
    toast({
      title: "Added to Cart",
      description: `${product.moq || 1} units of ${product.name} added.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Wholesale Catalog</h1>
        <p className="text-muted-foreground">Browse and order stock for your kirana.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search products, brands..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[180px] bg-secondary border-border">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="FMCG">FMCG</SelectItem>
            <SelectItem value="Snacks">Snacks & Namkeen</SelectItem>
            <SelectItem value="Spices">Spices & Masala</SelectItem>
            <SelectItem value="Local Products">Local Brands</SelectItem>
            <SelectItem value="D2C">D2C Brands</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-[180px] bg-secondary border-border">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Popularity</SelectItem>
            <SelectItem value="new">Newest First</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="margin_desc">Margin: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-[340px] rounded-xl" />)}
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-24 bg-secondary/50 rounded-xl border border-border">
          <PackageSearch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products?.map(product => (
            <Card key={product.id} className="bg-card border-card-border/20 flex flex-col hover:border-primary/50 transition-all group">
              <div className="aspect-square bg-secondary rounded-t-xl overflow-hidden relative p-4 flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <Tag className="w-12 h-12 text-muted-foreground/30" />
                )}
                {product.exchange_eligible && (
                  <div className="absolute top-2 left-2 bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm border border-primary/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    60-Day Exchange
                  </div>
                )}
              </div>
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="mb-2">
                  <h3 className="font-bold line-clamp-2" title={product.name}>{product.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{product.brand_name || 'Generic'}</p>
                </div>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground line-through">MRP ₹{product.mrp}</p>
                      <p className="font-bold font-numbers text-xl text-primary">₹{product.wholesale_price}</p>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30 font-bold">
                      {product.margin_percent}% Margin
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      className="flex-1 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                      onClick={() => handleAddToCart(product)}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add
                    </Button>
                    <div className="text-[10px] text-muted-foreground text-center bg-secondary px-2 py-1 rounded border border-border">
                      MOQ<br/><span className="font-bold text-foreground">{product.moq}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Temporary placeholder for missing import
function PackageSearch(props: any) {
  return <Search {...props} />;
}
