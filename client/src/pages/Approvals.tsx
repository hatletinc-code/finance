import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, ArrowRight } from "lucide-react";
import { formatDateTimeIST } from "@/lib/dateUtils";
import { useAuth } from "@/lib/auth";

interface Transaction {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: string;
  currency: "INR" | "USD";
  conversionRate: string | null;
  convertedInrAmount: string;
  description: string;
  transactionDate: string;
  status: "pending" | "approved" | "rejected";
  category?: { id: string; name: string } | null;
  client?: { id: string; name: string } | null;
  company: { id: string; name: string };
  fromBankAccount?: { id: string; accountName: string } | null;
  toBankAccount?: { id: string; accountName: string } | null;
  user: { id: string; name: string };
}

export default function Approvals() {
  const { toast } = useToast();
  const user = useAuth((state) => state.user);

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/transactions", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return await res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/transactions/${id}/approve`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Success",
        description: "Transaction approved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve transaction",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/transactions/${id}/reject`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Success",
        description: "Transaction rejected",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject transaction",
        variant: "destructive",
      });
    },
  });

  const pendingTransactions = transactions?.filter((t) => t.status === "pending") || [];

  if (isLoading) {
    return <div className="text-muted-foreground">Loading approvals...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pending Approvals</h1>
        <p className="text-muted-foreground">Review and approve pending transactions</p>
      </div>

      {pendingTransactions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No pending approvals</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingTransactions.map((transaction) => (
            <Card key={transaction.id} data-testid={`card-approval-${transaction.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{transaction.description}</CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <span>{transaction.company.name}</span>
                      <span>•</span>
                      <span>{formatDateTimeIST(transaction.transactionDate)}</span>
                      <span>•</span>
                      <span>By {transaction.user.name}</span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      transaction.type === "income"
                        ? "default"
                        : transaction.type === "expense"
                        ? "destructive"
                        : "secondary"
                    }
                    data-testid={`badge-type-${transaction.id}`}
                  >
                    {transaction.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-mono font-semibold" data-testid={`text-amount-${transaction.id}`}>
                        {transaction.currency} {parseFloat(transaction.amount).toLocaleString()}
                        {transaction.currency === "USD" && (
                          <span className="text-muted-foreground text-xs ml-2">
                            (₹{parseFloat(transaction.convertedInrAmount).toLocaleString()})
                          </span>
                        )}
                      </p>
                    </div>
                    {transaction.category && (
                      <div>
                        <p className="text-muted-foreground">Category</p>
                        <p className="font-medium">{transaction.category.name}</p>
                      </div>
                    )}
                    {transaction.client && (
                      <div>
                        <p className="text-muted-foreground">Client</p>
                        <p className="font-medium">{transaction.client.name}</p>
                      </div>
                    )}
                    {transaction.type === "transfer" ? (
                      <>
                        <div>
                          <p className="text-muted-foreground">From Account</p>
                          <p className="font-medium">{transaction.fromBankAccount?.accountName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">To Account</p>
                            <p className="font-medium">{transaction.toBankAccount?.accountName}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      transaction.fromBankAccount && (
                        <div>
                          <p className="text-muted-foreground">Bank Account</p>
                          <p className="font-medium">{transaction.fromBankAccount.accountName}</p>
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => approveMutation.mutate(transaction.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      size="sm"
                      data-testid={`button-approve-${transaction.id}`}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => rejectMutation.mutate(transaction.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      variant="destructive"
                      size="sm"
                      data-testid={`button-reject-${transaction.id}`}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
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
