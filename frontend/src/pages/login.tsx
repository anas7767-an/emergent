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
import { ShoppingCart, ArrowLeft, Store, Building2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  phone: z.string().min(3, "Phone or username required"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  role: z.enum(["retailer", "brand", "admin"]),
});

const ROLE_META = {
  retailer: { icon: Store, label: "Retailer", color: "text-[#003087]", desc: "Kirana shop owner" },
  brand: { icon: Building2, label: "Brand", color: "text-[#FF9933]", desc: "FMCG / D2C brand" },
  admin: { icon: ShieldCheck, label: "Admin", color: "text-emerald-700", desc: "FERI operator" },
};

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [activeRole, setActiveRole] = useState<"retailer" | "brand" | "admin">("retailer");

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "", role: "retailer" },
  });

  const loginMutation = useLogin();

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
          toast({ title: "Welcome back!", description: `Logged in as ${data.user.name}` });
          setLocation(`/dashboard/${data.user.role}`);
        },
        onError: (error: any) => {
          toast({
            title: "Login failed",
            description: error?.message || "Invalid credentials",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col" data-testid="login-page">
      {/* Top bar */}
      <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-slate-600 hover:text-[#003087]" data-testid="back-home">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Back to home</span>
          </Link>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#003087] flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-[#FFD700]" />
            </div>
            <span className="font-heading text-xl font-extrabold text-[#003087]">FERI</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 p-7 sm:p-9">
            <div className="text-center mb-7">
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900">Welcome back</h1>
              <p className="text-slate-500 text-sm mt-2">Login to your FERI account</p>
            </div>

            {/* Role tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl mb-7" data-testid="role-tabs">
              {(["retailer", "brand", "admin"] as const).map((role) => {
                const Meta = ROLE_META[role];
                const Icon = Meta.icon;
                const active = activeRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setActiveRole(role);
                      form.setValue("role", role);
                    }}
                    className={`relative flex flex-col items-center justify-center gap-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      active
                        ? "bg-white shadow-sm border border-slate-200 text-slate-900"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                    data-testid={`role-tab-${role}`}
                  >
                    <Icon className={`w-4 h-4 ${active ? Meta.color : ""}`} />
                    <span className="capitalize">{Meta.label}</span>
                  </button>
                );
              })}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="login-form">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold text-sm">
                        {activeRole === "admin" ? "Username" : "Phone number"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={activeRole === "admin" ? "admin" : "10-digit mobile"}
                          {...field}
                          className="h-12 bg-slate-50 border-slate-200 focus-visible:border-[#003087] focus-visible:ring-[#003087]/20 rounded-xl"
                          data-testid="login-phone-input"
                        />
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
                      <FormLabel className="text-slate-700 font-semibold text-sm">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                          className="h-12 bg-slate-50 border-slate-200 focus-visible:border-[#003087] focus-visible:ring-[#003087]/20 rounded-xl"
                          data-testid="login-password-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <a href="#" className="text-xs text-[#003087] hover:underline font-semibold">Forgot password?</a>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#003087] text-white hover:bg-[#002060] font-bold rounded-xl text-base mt-2"
                  disabled={loginMutation.isPending}
                  data-testid="login-submit-btn"
                >
                  {loginMutation.isPending ? "Logging in…" : `Login as ${ROLE_META[activeRole].label}`}
                </Button>
              </form>
            </Form>

            {activeRole !== "admin" && (
              <div className="mt-7 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
                Don't have an account?{" "}
                <Link
                  href={`/register/${activeRole}`}
                  className="text-[#003087] hover:underline font-bold"
                  data-testid={`register-${activeRole}-link`}
                >
                  Register as {ROLE_META[activeRole].label}
                </Link>
              </div>
            )}
          </div>

          {/* Demo creds hint */}
          <div className="mt-5 px-5 py-4 bg-[#FFD700]/15 border border-[#FFD700]/40 rounded-2xl text-xs text-slate-700" data-testid="demo-creds-hint">
            <div className="font-bold text-[#003087] mb-1.5">Demo credentials</div>
            <div className="space-y-0.5 font-mono">
              <div>Retailer: <b>9876543210</b> / <b>test123</b></div>
              <div>Brand: <b>9800000001</b> / <b>test123</b></div>
              <div>Admin: <b>admin</b> / <b>feri@2025</b></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
