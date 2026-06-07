import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, ArrowRight, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCreateOrder, OrderInputPaymentType } from "@workspace/api-client-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProductTile } from "@/components/product-tile";

const PAYMENT_OPTIONS = [
  { id: "pay_now", label: "Pay now", sub: "UPI / Bank transfer", icon: "₹", highlight: false },
  { id: "net_15", label: "Net-15 days", sub: "Pay in 15 days", icon: "15", highlight: false },
  { id: "net_30", label: "Net-30 days", sub: "Pay in 30 days", icon: "30", highlight: false },
  { id: "net_60", label: "Net-60 days", sub: "Includes 60-day exchange", icon: "60", highlight: true },
] as const;

export default function RetailerCart() {
  const { cart, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const [paymentType, setPaymentType] = useState<OrderInputPaymentType>("net_15");
  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    if (cart.length === 0) return;
    createOrder.mutate(
      {
        data: {
          items: cart.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
          payment_type: paymentType,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Order placed!", description: "Your order has been confirmed." });
          clearCart();
          setLocation("/dashboard/retailer/orders");
        },
        onError: (err: any) => {
          toast({
            title: "Order failed",
            description: err?.message || "Could not place order",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center" data-testid="empty-cart">
        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="font-heading text-2xl font-extrabold text-slate-900 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 mb-7 max-w-sm">Browse our wholesale catalog and add products to start a new order.</p>
        <Link href="/dashboard/retailer/products">
          <Button className="h-12 px-7 bg-[#003087] text-white hover:bg-[#002060] font-bold rounded-xl" data-testid="browse-products-btn">
            <ShoppingBag className="w-4 h-4 mr-2" /> Browse products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto" data-testid="retailer-cart">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Shopping cart</h1>
        <p className="text-sm text-slate-500">{cart.length} unique products · ₹{totalAmount.toLocaleString("en-IN")} total</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* ITEMS */}
        <div className="lg:col-span-2 space-y-3" data-testid="cart-items-list">
          {cart.map((item) => (
            <div key={item.product.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4" data-testid={`cart-item-${item.product.id}`}>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0">
                <ProductTile productId={item.product.id} category={item.product.category} size="sm" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{item.product.brand_name}</div>
                    <h3 className="font-semibold text-sm text-slate-900 line-clamp-2 leading-snug">{item.product.name}</h3>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center shrink-0"
                    data-testid={`remove-${item.product.id}`}
                    aria-label="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-end justify-between pt-3">
                  <div>
                    <div className="font-numbers font-extrabold text-[#003087] text-base">
                      ₹{(item.product.wholesale_price * item.quantity).toLocaleString("en-IN")}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      ₹{item.product.wholesale_price} × {item.quantity}
                    </div>
                  </div>
                  <div className="inline-flex items-center bg-slate-100 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, Math.max(item.product.moq || 1, item.quantity - 1))}
                      disabled={item.quantity <= (item.product.moq || 1)}
                      className="w-8 h-8 rounded-lg bg-white text-slate-700 disabled:opacity-40 hover:bg-white shadow-sm flex items-center justify-center"
                      data-testid={`qty-minus-${item.product.id}`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-numbers font-bold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-white text-slate-700 hover:bg-white shadow-sm flex items-center justify-center"
                      data-testid={`qty-plus-${item.product.id}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SUMMARY */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:sticky lg:top-32" data-testid="cart-summary">
            <h3 className="font-heading text-lg font-extrabold text-slate-900 mb-4">Order summary</h3>

            <div className="space-y-2.5 text-sm mb-5">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-numbers">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-3 border-t border-slate-100">
                <span className="text-slate-900">Total</span>
                <span className="font-numbers text-[#003087] text-xl" data-testid="cart-total">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="mb-5">
              <div className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-2.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Payment terms
              </div>
              <div className="space-y-2" data-testid="payment-options">
                {PAYMENT_OPTIONS.map((opt) => {
                  const active = paymentType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentType(opt.id)}
                      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        active
                          ? "border-[#003087] bg-[#003087]/5"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                      data-testid={`payment-${opt.id}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                          active ? "bg-[#003087] text-[#FFD700]" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {opt.icon}
                      </div>
                      <div className="flex-1">
                        <div className={`font-bold text-sm ${active ? "text-[#003087]" : "text-slate-900"}`}>
                          {opt.label}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          {opt.highlight && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                          {opt.sub}
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          active ? "border-[#003087] bg-[#003087]" : "border-slate-300"
                        } flex items-center justify-center`}
                      >
                        {active && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={createOrder.isPending}
              className="w-full h-12 bg-[#003087] text-white hover:bg-[#002060] font-bold rounded-xl text-base"
              data-testid="place-order-btn"
            >
              {createOrder.isPending ? "Placing order…" : "Place order"}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
            <p className="text-[11px] text-slate-500 text-center mt-3">
              By placing the order you agree to FERI's terms & return policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
