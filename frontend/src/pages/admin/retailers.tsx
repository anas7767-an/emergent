import { useListRetailers, useUpdateKycStatus, useUpdateCreditLimit, getListRetailersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Check, X, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserKycStatus } from "@workspace/api-client-react";

export default function AdminRetailers() {
  const { data: retailers, isLoading } = useListRetailers();
  const updateKyc = useUpdateKycStatus();
  const updateLimit = useUpdateCreditLimit();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState<any>(null);
  const [newLimit, setNewLimit] = useState("");

  const handleKycUpdate = (id: number, status: UserKycStatus) => {
    updateKyc.mutate({ id, data: { kyc_status: status } }, {
      onSuccess: () => {
        toast({ title: `KYC ${status}` });
        queryClient.invalidateQueries({ queryKey: getListRetailersQueryKey() });
      }
    });
  };

  const handleLimitUpdate = () => {
    if (!selectedRetailer || !newLimit) return;
    updateLimit.mutate({ id: selectedRetailer.id, data: { credit_limit: Number(newLimit) } }, {
      onSuccess: () => {
        toast({ title: "Credit Limit Updated" });
        setLimitDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: getListRetailersQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Retailer Management</h1>
        <p className="text-muted-foreground">Manage kirana stores, verify KYC, and set credit limits.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="bg-card border border-card-border/30 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/80 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Shop Info</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">KYC Status</th>
                  <th className="px-6 py-4 font-medium">Credit Limit</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {retailers?.map((r) => (
                  <tr key={r.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                          <Store className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-bold">{r.shop_name}</div>
                          <div className="text-xs text-muted-foreground">{r.city}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground font-numbers">{r.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`capitalize ${
                        r.kyc_status === 'verified' ? 'bg-success/10 text-success border-success/30' :
                        r.kyc_status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/30' :
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                      }`}>
                        {r.kyc_status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-numbers text-primary">₹{(r.credit_limit || 0).toLocaleString()}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => {
                          setSelectedRetailer(r);
                          setNewLimit(r.credit_limit?.toString() || "0");
                          setLimitDialogOpen(true);
                        }}>
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.kyc_status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-8 border-success/50 text-success hover:bg-success/10" onClick={() => handleKycUpdate(r.id, 'verified')}>
                            <Check className="w-4 h-4 mr-1" /> Verify
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => handleKycUpdate(r.id, 'rejected')}>
                            <X className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Credit Limit</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Retailer</p>
              <p className="font-bold">{selectedRetailer?.shop_name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">New Credit Limit (₹)</p>
              <Input 
                type="number" 
                value={newLimit} 
                onChange={(e) => setNewLimit(e.target.value)} 
                className="font-numbers bg-secondary border-border"
              />
            </div>
            <Button className="w-full font-bold" onClick={handleLimitUpdate} disabled={updateLimit.isPending}>
              {updateLimit.isPending ? "Updating..." : "Save Limit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
