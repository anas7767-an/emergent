import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useRegisterBrand } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

const registerSchema = z.object({
  brand_name: z.string().min(2, "Brand name is required"),
  contact_person: z.string().min(2, "Contact person name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  product_category: z.string().min(2, "Category is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function RegisterBrandPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      brand_name: "",
      contact_person: "",
      phone: "",
      product_category: "",
      password: "",
    },
  });

  const registerMutation = useRegisterBrand();

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
          toast({ title: "Registration successful", description: "Welcome to FERI Brands!" });
          setLocation(`/dashboard/brand`);
        },
        onError: (error: any) => {
          toast({
            title: "Registration failed",
            description: error?.data?.error || "Could not complete registration",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <ShoppingCart className="w-8 h-8 text-primary" />
        <div className="flex flex-col leading-none">
          <span className="font-heading text-2xl font-bold text-foreground">FERI</span>
          <span className="text-xs text-primary uppercase tracking-widest font-bold">Wholesale</span>
        </div>
      </Link>

      <Card className="w-full max-w-md bg-card border-card-border/50 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-heading">Brand Registration</CardTitle>
          <CardDescription>Distribute your products directly to kirana stores</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="brand_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand / Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Balaji Wafers" {...field} className="bg-secondary border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Amit Patel" {...field} className="bg-secondary border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="10-digit mobile number" {...field} className="bg-secondary border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="product_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Product Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue placeholder="Select primary category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FMCG">FMCG</SelectItem>
                        <SelectItem value="Snacks">Snacks & Namkeen</SelectItem>
                        <SelectItem value="Spices">Spices & Masala</SelectItem>
                        <SelectItem value="Local Products">Local Products</SelectItem>
                        <SelectItem value="D2C">D2C Brand</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Create a strong password" {...field} className="bg-secondary border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground font-bold h-12 mt-6 hover:bg-primary/90"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Registering..." : "Register as Brand"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground border-t border-border pt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
