import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionTable } from "@/components/TransactionTable";
import { TransactionDetailsDialog } from "@/components/TransactionDetailsDialog";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { formatDateIST } from "@/lib/dateUtils";
import { useToast } from "@/hooks/use-toast";
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

interface Company {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Client {
  id: string;
  name: string;
}

interface BankAccount {
  id: string;
  accountName: string;
}

export default function Transactions() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewTransactionId, setViewTransactionId] = useState<string | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);
  const user = useAuth((state) => state.user);

  // Filter states
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>("all");

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

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: bankAccounts = [] } = useQuery<BankAccount[]>({
    queryKey: ["/api/bank-accounts"],
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

  // Apply filters
  const filteredTransactions = transactions.filter((t) => {
    if (selectedCompany !== "all" && t.company.id !== selectedCompany) {
      return false;
    }
    if (selectedCategory !== "all" && t.category?.id !== selectedCategory) {
      return false;
    }
    if (selectedClient !== "all" && t.client?.id !== selectedClient) {
      return false;
    }
    if (selectedBankAccount !== "all") {
      const matchesFromAccount = t.fromBankAccount?.id === selectedBankAccount;
      const matchesToAccount = t.toBankAccount?.id === selectedBankAccount;
      if (!matchesFromAccount && !matchesToAccount) {
        return false;
      }
    }
    return true;
  });

  const formattedTransactions = filteredTransactions.map((t) => ({
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

  const clearFilters = () => {
    setSelectedCompany("all");
    setSelectedCategory("all");
    setSelectedClient("all");
    setSelectedBankAccount("all");
  };

  const activeFilterCount = [
    selectedCompany !== "all",
    selectedCategory !== "all",
    selectedClient !== "all",
    selectedBankAccount !== "all",
  ].filter(Boolean).length;

  if (isLoading) {
    return <div className="text-muted-foreground">Loading transactions...</div>;
  }

  return (
    <div className="space-y-6" data-testid="page-transactions">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Manage all income, expenses, and transfers
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-toggle-filters"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs font-medium">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) setEditingTransactionId(null);
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-transaction">
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTransactionId ? "Edit Transaction" : "New Transaction"}</DialogTitle>
              </DialogHeader>
              <TransactionForm 
                transactionId={editingTransactionId} 
                onSuccess={() => {
                  setOpen(false);
                  setEditingTransactionId(null);
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showFilters && (
        <Card data-testid="card-filters">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="filter-company">Company</Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger id="filter-company" data-testid="select-filter-company">
                    <SelectValue placeholder="All Companies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="filter-category" data-testid="select-filter-category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-client">Client</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger id="filter-client" data-testid="select-filter-client">
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-bank-account">Bank Account</Label>
                <Select value={selectedBankAccount} onValueChange={setSelectedBankAccount}>
                  <SelectTrigger id="filter-bank-account" data-testid="select-filter-bank-account">
                    <SelectValue placeholder="All Accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.accountName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  data-testid="button-clear-filters"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {formattedTransactions.length} of {transactions.length} transactions
        </p>
      </div>

      <TransactionTable 
        transactions={formattedTransactions} 
        isAdmin={user?.role === "admin"}
        onApprove={(id) => approveMutation.mutate(id)}
        onReject={(id) => rejectMutation.mutate(id)}
        onView={(id) => setViewTransactionId(id)}
        onEdit={(id) => {
          setEditingTransactionId(id);
          setOpen(true);
        }}
        onDelete={(id) => setDeleteTransactionId(id)}
      />

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
