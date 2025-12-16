import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DashboardCard } from "@/components/DashboardCard";
import { TransactionTable } from "@/components/TransactionTable";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionDetailsDialog } from "@/components/TransactionDetailsDialog";
import { ArrowLeftRight, CheckCircle, Clock, XCircle } from "lucide-react";
import { formatDateIST } from "@/lib/dateUtils";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

export default function TeamDashboard() {
  const { toast } = useToast();
  const user = useAuth((state) => state.user);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [viewTransactionId, setViewTransactionId] = useState<string | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/transactions", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return await res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/transactions/${id}`);
      if (!res.ok) {
        throw new Error("Failed to delete transaction");
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
      setDeleteTransactionId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete transaction",
        variant: "destructive",
      });
    },
  });

  const stats = {
    total: transactions.length,
    approved: transactions.filter(t => t.status === "approved").length,
    pending: transactions.filter(t => t.status === "pending").length,
    rejected: transactions.filter(t => t.status === "rejected").length,
  };

  const formattedTransactions = transactions.map((t) => ({
    id: t.id,
    date: formatDateIST(t.transactionDate),
    type: t.type,
    company: t.company.name,
    category: t.category?.name || "-",
    amount: parseFloat(t.amount).toLocaleString(),
    currency: t.currency,
    status: t.status,
    client: t.client?.name,
  }));

  if (isLoading) {
    return <div className="text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6" data-testid="page-team-dashboard">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track your submitted transactions and their status
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Submitted"
          value={stats.total.toString()}
          icon={ArrowLeftRight}
          subtitle="All time"
        />
        <DashboardCard
          title="Approved"
          value={stats.approved.toString()}
          icon={CheckCircle}
        />
        <DashboardCard
          title="Pending"
          value={stats.pending.toString()}
          icon={Clock}
        />
        <DashboardCard
          title="Rejected"
          value={stats.rejected.toString()}
          icon={XCircle}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">My Transactions</h2>
        <TransactionTable 
          transactions={formattedTransactions} 
          isAdmin={false}
          onView={(id) => setViewTransactionId(id)}
          onEdit={(id) => {
            setEditingTransactionId(id);
            setEditDialogOpen(true);
          }}
          onDelete={(id) => setDeleteTransactionId(id)}
        />
      </div>

      <Dialog open={editDialogOpen} onOpenChange={(isOpen) => {
        setEditDialogOpen(isOpen);
        if (!isOpen) setEditingTransactionId(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm 
            transactionId={editingTransactionId} 
            onSuccess={() => {
              setEditDialogOpen(false);
              setEditingTransactionId(null);
            }} 
          />
        </DialogContent>
      </Dialog>

      <TransactionDetailsDialog
        transactionId={viewTransactionId}
        open={!!viewTransactionId}
        onOpenChange={(open) => !open && setViewTransactionId(null)}
      />

      <AlertDialog open={!!deleteTransactionId} onOpenChange={(open) => !open && setDeleteTransactionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTransactionId && deleteMutation.mutate(deleteTransactionId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
