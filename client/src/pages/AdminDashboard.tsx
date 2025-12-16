import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DashboardCard } from "@/components/DashboardCard";
import { ApprovalCard } from "@/components/ApprovalCard";
import { TransactionTable } from "@/components/TransactionTable";
import { TransactionDetailsDialog } from "@/components/TransactionDetailsDialog";
import { Wallet, TrendingUp, Users, Building2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatDateIST } from "@/lib/dateUtils";
import { useAuth } from "@/lib/auth";
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

interface BankAccount {
  id: string;
  accountName: string;
  initialBalance: string;
  currentBalance: string;
  createdBy: string;
}

interface Company {
  id: string;
  name: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [viewTransactionId, setViewTransactionId] = useState<string | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);
  const user = useAuth((state) => state.user);

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/transactions", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return await res.json();
    },
  });

  const { data: bankAccounts = [] } = useQuery<BankAccount[]>({
    queryKey: ["/api/bank-accounts"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/transactions/${id}/approve`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/transactions/${id}`);
      return await res.json();
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

  const pendingTransactions = transactions.filter((t) => t.status === "pending");
  const approvedTransactions = transactions.filter((t) => t.status === "approved");

  const totalBalance = bankAccounts.reduce(
    (sum, acc) => sum + parseFloat(acc.currentBalance || "0"),
    0
  );

  const totalIncome = approvedTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.convertedInrAmount || "0"), 0);

  const totalExpense = approvedTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.convertedInrAmount || "0"), 0);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const pendingForApproval = pendingTransactions.map((t) => ({
    id: t.id,
    type: t.type,
    amount: parseFloat(t.amount).toLocaleString(),
    currency: t.currency,
    company: t.company.name,
    category: t.category?.name || "-",
    description: t.description || "-",
    client: t.client?.name,
    submittedBy: t.user.name,
  }));

  const recentActivity = recentTransactions.map((t) => ({
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

  return (
    <div className="space-y-6" data-testid="page-admin-dashboard">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your financial management system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Balance"
          value={`₹${totalBalance.toLocaleString()}`}
          icon={Wallet}
          subtitle="All bank accounts"
        />
        <DashboardCard
          title="Total Income"
          value={`₹${totalIncome.toLocaleString()}`}
          icon={TrendingUp}
          subtitle="Approved transactions"
        />
        <DashboardCard
          title="Pending Approvals"
          value={pendingTransactions.length.toString()}
          icon={Clock}
          subtitle="Requires action"
        />
        <DashboardCard
          title="Active Companies"
          value={companies.length.toString()}
          icon={Building2}
        />
      </div>

      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approvals" data-testid="tab-approvals">
            Pending Approvals ({pendingTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="accounts" data-testid="tab-accounts">
            Bank Accounts ({bankAccounts.length})
          </TabsTrigger>
          <TabsTrigger value="recent" data-testid="tab-recent">
            Recent Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="space-y-4">
          {pendingForApproval.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No pending approvals</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingForApproval.map((transaction) => (
                <ApprovalCard
                  key={transaction.id}
                  transaction={transaction}
                  onApprove={(id) => approveMutation.mutate(id)}
                  onReject={(id) => rejectMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {bankAccounts.map((account) => (
              <Card key={account.id}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    {account.accountName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono font-bold">
                    ₹{parseFloat(account.currentBalance || "0").toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Current Balance</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <TransactionTable 
            transactions={recentActivity} 
            isAdmin={true}
            onApprove={(id) => approveMutation.mutate(id)}
            onReject={(id) => rejectMutation.mutate(id)}
            onView={(id) => setViewTransactionId(id)}
            onEdit={(id) => {
              toast({
                title: "Coming Soon",
                description: "Edit functionality will be available soon",
              });
            }}
            onDelete={(id) => setDeleteTransactionId(id)}
          />
        </TabsContent>
      </Tabs>

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
