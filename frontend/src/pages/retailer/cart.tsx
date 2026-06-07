import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingBag, CreditCard } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCreateOrder } from "@workspace/api-client-react";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { OrderInputPaymentType } from "@workspace/api-client-react";

export default function RetailerCart() {
  const { cart, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const [paymentType, setPaymentType] = useState<OrderInputPaymentType>("net_15");
  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    if (cart.length === 0) return;

    createOrder.mutate({
      data: {
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        payment_type: paymentType
      }
    }, {
      onSuccess: () => {
        toast({ title: "Order Placed Successfully", description: "Your order has been confirmed." });
        clearCart();
        setLocation("/dashboard/retailer/orders");
      },
      onError: (err) => {
        toast({ 
          title: "Order Failed", 
          description: err?.data?.error || "Could not place order.",
          variant: "destructive"
        });
      }
    });
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold font-heading mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/dashboard/retailer/products">
          <Button className="font-bold">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-heading">Shopping Cart</h1>
        <p className="text-muted-foreground">Review your items and checkout.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.product.id} className="bg-card border-card-border/30">
              <CardContent className="p-4 flex gap-4">
                <div className="w-20 h-20 bg-secondary rounded flex-shrink-0 flex items-center justify-center">
                  {item.product.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
                  )}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm line-clamp-2">{item.product.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.product.brand_name || 'Generic'}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.product.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-auto flex justify-between items-end">
                    <p className="font-bold font-numbers text-primary">₹{item.product.wholesale_price}</p>
                    
                    <div className="flex items-center gap-1 bg-secondary rounded-lg border border-border p-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => updateQuantity(item.product.id, Math.max(item.product.moq || 1, item.quantity - 1))}
                        disabled={item.quantity <= (item.product.moq || 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-numbers font-medium w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-card-border/50 sticky top-24">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 font-heading border-b border-border pb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items Total</span>
                  <span className="font-numbers">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-success font-medium">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-border pt-3 mt-3">
                  <span>Total Amount</span>
                  <span className="text-primary font-numbers">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-3 text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Select Payment Term
                </h4>
                <RadioGroup value={paymentType} onValueChange={(v: any) => setPaymentType(v)} className="space-y-2">
                  <div className="flex items-center space-x-2 border border-border p-3 rounded bg-secondary">
                    <RadioGroupItem value="pay_now" id="pay_now" />
                    <Label htmlFor="pay_now" className="flex-1 cursor-pointer">Pay Now (UPI/Bank)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border border-border p-3 rounded bg-secondary">
                    <RadioGroupItem value="net_15" id="net_15" />
                    <Label htmlFor="net_15" className="flex-1 cursor-pointer">Net-15 Days</Label>
                  </div>
                  <div className="flex items-center space-x-2 border border-border p-3 rounded bg-secondary">
                    <RadioGroupItem value="net_30" id="net_30" />
                    <Label htmlFor="net_30" className="flex-1 cursor-pointer">Net-30 Days</Label>
                  </div>
                  <div className="flex items-center space-x-2 border border-primary/50 p-3 rounded bg-primary/5">
                    <RadioGroupItem value="net_60" id="net_60" />
                    <Label htmlFor="net_60" className="flex-1 cursor-pointer">
                      <div className="font-medium text-primary">Net-60 Days</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Includes 60-Day Exchange Guarantee</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button 
                className="w-full font-bold h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleCheckout}
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? "Processing..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
