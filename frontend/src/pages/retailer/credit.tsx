import { useGetMyCredit, useGetCreditHistory, useRequestCreditIncrease } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { CreditCard, TrendingUp, AlertCircle, History } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const increaseSchema = z.object({
  requested_amount: z.coerce.number().min(1000, "Minimum request is ₹1,000"),
  reason: z.string().min(5, "Please provide a reason")
});

export default function RetailerCredit() {
  const { data: credit, isLoading: isCreditLoading, refetch: refetchCredit } = useGetMyCredit();
  const { data: history, isLoading: isHistoryLoading } = useGetCreditHistory();
  const requestIncrease = useRequestCreditIncrease();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof increaseSchema>>({
    resolver: zodResolver(increaseSchema),
    defaultValues: {
      requested_amount: 10000,
      reason: ""
    }
  });

  const onSubmit = (values: z.infer<typeof increaseSchema>) => {
    requestIncrease.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Request Submitted", description: "Your credit increase request is under review." });
        setOpen(false);
        refetchCredit();
      },
      onError: (err) => {
        toast({ title: "Request Failed", description: err?.data?.error || "Could not submit request.", variant: "destructive" });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return "bg-success/10 text-success border-success/20";
      case 'overdue': return "bg-destructive/10 text-destructive border-destructive/20";
      case 'pending': return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default: return "bg-secondary text-foreground";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-heading">Credit & Payments</h1>
        <p className="text-muted-foreground">Manage your credit limit and track payment dues.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card border-card-border/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <CreditCard className="w-32 h-32 text-primary" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              {credit?.pending_request && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                  Request Pending
                </Badge>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Available Credit Limit</p>
                {isCreditLoading ? <Skeleton className="h-10 w-40" /> : (
                  <p className="text-4xl font-bold font-numbers text-primary">₹{credit?.available_limit?.toLocaleString('en-IN') || 0}</p>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Total Limit</p>
                  <p className="font-bold font-numbers">₹{credit?.credit_limit?.toLocaleString('en-IN') || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Used Amount</p>
                  <p className="font-bold font-numbers">₹{credit?.used_amount?.toLocaleString('en-IN') || 0}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-card-border/30 flex flex-col justify-center">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Need more credit?
            </CardTitle>
            <CardDescription>
              Increase your purchasing power. Approvals are based on your transaction history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="w-full font-bold bg-primary text-primary-foreground hover:bg-primary/90" disabled={!!credit?.pending_request}>
                  Request Credit Increase
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Request Credit Increase</DialogTitle>
                  <DialogDescription>
                    Submit a request to increase your total credit limit.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="requested_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requested Amount (₹)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Festival season stocking" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full font-bold" disabled={requestIncrease.isPending}>
                      {requestIncrease.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-card-border/30">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5 text-primary" />
            Credit History & Dues
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isHistoryLoading ? (
            <div className="p-6 space-y-4">
              {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : history?.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No credit history found.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {history?.map((entry) => (
                <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(entry.status)}`}>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold">Order #{entry.order_id}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {format(new Date(entry.due_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold font-numbers text-lg">₹{entry.amount.toLocaleString('en-IN')}</p>
                    <Badge variant="outline" className={`mt-1 capitalize ${getStatusColor(entry.status)}`}>
                      {entry.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
