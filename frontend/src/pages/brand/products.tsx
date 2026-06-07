import { useState } from "react";
import { useListProducts, useCreateProduct, useDeleteProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Tag, Trash2, Edit, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.string().min(2, "Category is required"),
  mrp: z.coerce.number().min(1, "Valid MRP required"),
  wholesale_price: z.coerce.number().min(1, "Valid price required"),
  moq: z.coerce.number().min(1, "Minimum MOQ is 1"),
  description: z.string().optional(),
  image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  exchange_eligible: z.boolean().default(false)
});

export default function BrandProducts() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useListProducts({
    search: search.length > 2 ? search : undefined,
  }, { query: { queryKey: ['/api/products', { search }] } });

  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", category: "", mrp: 0, wholesale_price: 0, moq: 1, description: "", image_url: "", exchange_eligible: false
    }
  });

  const onSubmit = (values: z.infer<typeof productSchema>) => {
    createProduct.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Product Listed", description: "Your product is pending admin approval." });
        setOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      },
      onError: (err) => {
        toast({ title: "Listing Failed", description: err?.data?.error || "Could not list product.", variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: number) => {
    if(confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Product Deleted" });
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">My Products</h1>
          <p className="text-muted-foreground">Manage your product catalog.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>List New Product</DialogTitle>
              <DialogDescription>Add a product to the FERI marketplace.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="FMCG">FMCG</SelectItem>
                        <SelectItem value="Snacks">Snacks & Namkeen</SelectItem>
                        <SelectItem value="Spices">Spices & Masala</SelectItem>
                        <SelectItem value="Local Products">Local Products</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="mrp" render={({ field }) => (
                    <FormItem>
                      <FormLabel>MRP (₹)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="wholesale_price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wholesale Price (₹)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="moq" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Order Quantity (MOQ)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="image_url" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="exchange_eligible" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 bg-secondary">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">60-Day Exchange Guarantee</FormLabel>
                      <div className="text-sm text-muted-foreground">Allow kiranas to exchange unsold stock.</div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
                <Button type="submit" className="w-full font-bold" disabled={createProduct.isPending}>
                  {createProduct.isPending ? "Saving..." : "List Product"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          placeholder="Search your products..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-secondary border-border"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[250px] rounded-xl" />)}
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-24 bg-secondary/50 rounded-xl border border-border">
          <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold">No products listed</h3>
          <p className="text-muted-foreground">Add your first product to start selling.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products?.map(product => (
            <Card key={product.id} className="bg-card border-card-border/20 flex flex-col">
              <div className="p-4 bg-secondary/50 flex justify-between items-center border-b border-border">
                <Badge variant="outline" className={product.is_approved ? "bg-success/10 text-success border-success/30" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"}>
                  {product.is_approved ? "Active" : "Pending"}
                </Badge>
                <div className="flex gap-2">
                  <button className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-muted-foreground hover:text-destructive transition-colors" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="mb-2">
                  <h3 className="font-bold line-clamp-2" title={product.name}>{product.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                </div>
                
                <div className="mt-auto pt-4 border-t border-border">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-muted-foreground line-through">MRP ₹{product.mrp}</p>
                      <p className="font-bold font-numbers text-xl text-primary">₹{product.wholesale_price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">Margin</p>
                      <p className="font-bold text-success">{product.margin_percent}%</p>
                    </div>
                  </div>
                  {product.exchange_eligible && (
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      <ShieldCheck className="w-3 h-3" /> Exchange Eligible
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
