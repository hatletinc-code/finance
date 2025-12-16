import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTimeIST } from "@/lib/dateUtils";
import { ArrowRight } from "lucide-react";

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
  createdAt: string;
}

interface TransactionDetailsDialogProps {
  transactionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailsDialog({
  transactionId,
  open,
  onOpenChange,
}: TransactionDetailsDialogProps) {
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: open && !!transactionId,
  });

  const transaction = transactions.find((t) => t.id === transactionId);

  const typeConfig = {
    income: { label: "Income", color: "text-green-500", variant: "default" as const },
    expense: { label: "Expense", color: "text-red-500", variant: "destructive" as const },
    transfer: { label: "Transfer", color: "text-blue-500", variant: "secondary" as const },
  };

  const statusConfig = {
    pending: { label: "Pending", variant: "secondary" as const },
    approved: { label: "Approved", variant: "default" as const },
    rejected: { label: "Rejected", variant: "destructive" as const },
  };

  if (!transaction && !isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-transaction-details">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : transaction ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-3xl font-mono font-bold">
                  {transaction.currency === "USD" ? "$" : "₹"}
                  {parseFloat(transaction.amount).toLocaleString()}
                </div>
                {transaction.currency === "USD" && (
                  <div className="text-sm text-muted-foreground mt-1">
                    ₹{parseFloat(transaction.convertedInrAmount).toLocaleString()} at rate {transaction.conversionRate}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Badge variant={typeConfig[transaction.type].variant}>
                  {typeConfig[transaction.type].label}
                </Badge>
                <Badge variant={statusConfig[transaction.status].variant}>
                  {statusConfig[transaction.status].label}
                </Badge>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{transaction.company.name}</p>
                  </div>

                  {transaction.category && (
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{transaction.category.name}</p>
                    </div>
                  )}

                  {transaction.client && (
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-medium">{transaction.client.name}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-muted-foreground">Transaction Date</p>
                    <p className="font-medium">{formatDateTimeIST(transaction.transactionDate)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Created By</p>
                    <p className="font-medium">{transaction.user.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Created At</p>
                    <p className="font-medium">{formatDateTimeIST(transaction.createdAt)}</p>
                  </div>
                </div>

                {transaction.type === "transfer" ? (
                  <div className="mt-4 p-3 rounded-md bg-muted/50">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">From Account</p>
                        <p className="font-medium">{transaction.fromBankAccount?.accountName}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 text-right">
                        <p className="text-xs text-muted-foreground">To Account</p>
                        <p className="font-medium">{transaction.toBankAccount?.accountName}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  transaction.fromBankAccount && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Bank Account</p>
                      <p className="font-medium">{transaction.fromBankAccount.accountName}</p>
                    </div>
                  )
                )}

                {transaction.description && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm mt-1">{transaction.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
