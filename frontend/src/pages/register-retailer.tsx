import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useRegisterRetailer } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, ArrowLeft, Store, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const registerSchema = z.object({
  shop_name: z.string().min(2, "Shop name is required"),
  owner_name: z.string().min(2, "Owner name is required"),
  phone: z.string().min(10, "Valid 10-digit phone required"),
  city: z.string().min(2, "City is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function RegisterRetailerPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { shop_name: "", owner_name: "", phone: "", city: "", password: "" },
  });

  const registerMutation = useRegisterRetailer();

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
          toast({ title: "Welcome to FERI!", description: "Your account is ready." });
          setLocation("/dashboard/retailer");
        },
        onError: (error: any) => {
          toast({
            title: "Registration failed",
            description: error?.message || "Could not register",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col" data-testid="register-retailer-page">
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

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-5 gap-10 items-start">
        {/* LEFT — Hero */}
        <div className="lg:col-span-2 lg:sticky lg:top-24">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#003087]/5 border border-[#003087]/10 mb-5">
              <Store className="w-3.5 h-3.5 text-[#003087]" />
              <span className="text-xs font-bold tracking-widest text-[#003087] uppercase">Retailer signup</span>
            </div>
            <h1 className="font-heading text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
              Start sourcing smarter — in <span className="text-[#003087]">2 minutes.</span>
            </h1>
            <p className="text-slate-600 mb-7">
              Join 130+ kirana shops stocking up at wholesale rates with up to 60 days credit and zero risk on exchanges.
            </p>
            <ul className="space-y-3">
              {[
                "Instant credit limit on signup (₹50,000 default)",
                "Same-day KYC review by FERI team",
                "Free pickup & delivery in your city",
                "60-day exchange on every order",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* RIGHT — Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-3"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 p-7 sm:p-9">
            <h2 className="font-heading text-2xl font-extrabold text-slate-900 mb-1">Create your retailer account</h2>
            <p className="text-sm text-slate-500 mb-7">Fill in your shop details — we'll verify in minutes.</p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" data-testid="register-retailer-form">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="shop_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold text-sm">Shop name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Gupta Provision Store" {...field} className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:border-[#003087] focus-visible:ring-[#003087]/20" data-testid="reg-shop-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="owner_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold text-sm">Owner name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Rahul Gupta" {...field} className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:border-[#003087] focus-visible:ring-[#003087]/20" data-testid="reg-owner-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold text-sm">Phone number</FormLabel>
                        <FormControl>
                          <Input placeholder="10-digit mobile" {...field} className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:border-[#003087] focus-visible:ring-[#003087]/20" data-testid="reg-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold text-sm">City</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl" data-testid="reg-city">
                              <SelectValue placeholder="Select your city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Malegaon">Malegaon</SelectItem>
                            <SelectItem value="Nashik">Nashik</SelectItem>
                            <SelectItem value="Pune">Pune</SelectItem>
                            <SelectItem value="Mumbai">Mumbai</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold text-sm">Create a password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="At least 6 characters" {...field} className="h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:border-[#003087] focus-visible:ring-[#003087]/20" data-testid="reg-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#003087] text-white hover:bg-[#002060] font-bold rounded-xl text-base mt-3"
                  disabled={registerMutation.isPending}
                  data-testid="reg-submit-btn"
                >
                  {registerMutation.isPending ? "Creating account…" : "Create my account"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-sm text-slate-600">
              Already on FERI?{" "}
              <Link href="/login" className="text-[#003087] hover:underline font-bold">Login</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
