import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

const loginSchema = z.object({
  phone: z.string().min(10, "Valid phone number required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["retailer", "brand", "admin"]),
});

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [activeRole, setActiveRole] = useState<"retailer" | "brand" | "admin">("retailer");

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
      role: "retailer",
    },
  });

  const loginMutation = useLogin();

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
          toast({ title: "Login successful", description: `Welcome back, ${data.user.name}` });
          setLocation(`/dashboard/${data.user.role}`);
        },
        onError: (error) => {
          toast({
            title: "Login failed",
            description: error?.data?.error || "Invalid credentials",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <ShoppingCart className="w-8 h-8 text-primary" />
        <div className="flex flex-col leading-none">
          <span className="font-heading text-2xl font-bold text-foreground">FERI</span>
          <span className="text-xs text-primary uppercase tracking-widest font-bold">Wholesale</span>
        </div>
      </Link>

      <Card className="w-full max-w-md bg-card border-card-border/50 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading">Welcome Back</CardTitle>
          <CardDescription>Login to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex rounded-md p-1 bg-secondary mb-6 border border-border">
            {["retailer", "brand", "admin"].map((role) => (
              <button
                key={role}
                type="button"
                className={`flex-1 text-sm font-medium py-2 rounded capitalize transition-all ${
                  activeRole === role
                    ? "bg-card text-foreground shadow border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => {
                  setActiveRole(role as any);
                  form.setValue("role", role as any);
                }}
              >
                {role}
              </button>
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number {activeRole === "admin" && "(Username)"}</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} className="bg-secondary border-border" />
                    </FormControl>
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
                      <Input type="password" placeholder="Enter your password" {...field} className="bg-secondary border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground font-bold h-12 mt-4 hover:bg-primary/90"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>

          {activeRole !== "admin" && (
            <div className="mt-6 text-center text-sm text-muted-foreground border-t border-border pt-6">
              Don't have an account?{" "}
              <Link 
                href={`/register/${activeRole}`} 
                className="text-primary hover:underline font-medium"
              >
                Register as {activeRole}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
