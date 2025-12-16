import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

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
  currentBalance: string;
}

interface TransactionFormProps {
  transactionId?: string | null;
  onSuccess?: () => void;
}

interface Transaction {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: string;
  currency: "INR" | "USD";
  conversionRate: string | null;
  description: string;
  companyId: string;
  categoryId: string | null;
  clientId: string | null;
  fromBankAccountId: string | null;
  toBankAccountId: string | null;
}

export function TransactionForm({ transactionId, onSuccess }: TransactionFormProps) {
  const { toast } = useToast();
  const user = useAuth((state) => state.user);
  const [type, setType] = useState<"income" | "expense" | "transfer">("income");
  const [currency, setCurrency] = useState("INR");
  const [amount, setAmount] = useState("");
  const [conversionRate, setConversionRate] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [clientId, setClientId] = useState("");
  const [fromBankAccountId, setFromBankAccountId] = useState("");
  const [toBankAccountId, setToBankAccountId] = useState("");
  const [description, setDescription] = useState("");

  // Fetch transaction data if editing
  const { data: transaction, isLoading: isLoadingTransaction } = useQuery<Transaction>({
    queryKey: ["/api/transactions", transactionId],
    queryFn: async () => {
      if (!transactionId) return null;
      const res = await fetch(`/api/transactions/${transactionId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch transaction");
      return await res.json();
    },
    enabled: !!transactionId,
  });

  // Pre-fill form when transaction data is loaded
  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setCurrency(transaction.currency);
      setAmount(transaction.amount);
      setConversionRate(transaction.conversionRate || "");
      setCompanyId(transaction.companyId || "");
      setCategoryId(transaction.categoryId || "");
      setClientId(transaction.clientId || "");
      setFromBankAccountId(transaction.fromBankAccountId || "");
      setToBankAccountId(transaction.toBankAccountId || "");
      setDescription(transaction.description || "");
    }
  }, [transaction]);

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

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/transactions", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Success",
        description: "Transaction created successfully. Pending approval.",
      });
      // Reset form
      setAmount("");
      setConversionRate("");
      setCompanyId("");
      setCategoryId("");
      setClientId("");
      setFromBankAccountId("");
      setToBankAccountId("");
      setDescription("");
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create transaction",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/transactions/${transactionId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      if (transactionId) {
        queryClient.invalidateQueries({ queryKey: ["/api/transactions", transactionId] });
      }
      toast({
        title: "Success",
        description: "Transaction updated successfully.",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update transaction",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyId || !amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (type === "transfer" && (!fromBankAccountId || !toBankAccountId)) {
      toast({
        title: "Validation Error",
        description: "Please select both from and to accounts for transfer",
        variant: "destructive",
      });
      return;
    }

    if (type !== "transfer" && !fromBankAccountId) {
      toast({
        title: "Validation Error",
        description: "Please select a bank account",
        variant: "destructive",
      });
      return;
    }

    if (currency === "USD" && !conversionRate) {
      toast({
        title: "Validation Error",
        description: "Please enter conversion rate for USD transactions",
        variant: "destructive",
      });
      return;
    }

    const transactionData: any = {
      type,
      amount,
      currency,
      companyId,
      description: description || null,
      categoryId: categoryId || null,
      clientId: clientId || null,
      fromBankAccountId: type !== "transfer" ? fromBankAccountId : fromBankAccountId || null,
      toBankAccountId: type === "transfer" ? toBankAccountId : null,
    };

    if (currency === "USD") {
      transactionData.conversionRate = conversionRate;
    }

    if (transactionId) {
      updateMutation.mutate(transactionData);
    } else {
      createMutation.mutate(transactionData);
    }
  };

  if (isLoadingTransaction) {
    return <div className="text-muted-foreground">Loading transaction...</div>;
  }

  return (
    <Card data-testid="card-transaction-form">
      <CardHeader>
        <CardTitle>{transactionId ? "Edit Transaction" : "Add Transaction"}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Form key ensures proper reset when switching between create/edit modes */}
        <form className="space-y-4" onSubmit={handleSubmit} key={transactionId || "new"}>
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <RadioGroup value={type} onValueChange={(v) => setType(v as any)} className="flex gap-4" data-testid="radio-transaction-type">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="font-normal cursor-pointer">Income</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="font-normal cursor-pointer">Expense</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="transfer" id="transfer" />
                <Label htmlFor="transfer" className="font-normal cursor-pointer">Transfer</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              {/* Key based on value forces Radix Select to remount when value changes from empty to UUID, ensuring proper display */}
              <Select key={companyId || "company"} value={companyId || undefined} onValueChange={setCompanyId} data-testid="select-company">
                <SelectTrigger id="company">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select key={categoryId || "category"} value={categoryId} onValueChange={(value) => setCategoryId(value === "none" ? "" : value)} data-testid="select-category">
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-muted-foreground italic">
                    Clear selection
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency} data-testid="select-currency">
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {currency === "USD" && (
            <div className="space-y-2">
              <Label htmlFor="conversion">Conversion Rate (1 USD = ? INR) *</Label>
              <Input
                id="conversion"
                type="number"
                step="0.01"
                placeholder="83.50"
                value={conversionRate}
                onChange={(e) => setConversionRate(e.target.value)}
                data-testid="input-conversion-rate"
              />
            </div>
          )}

          {type === "transfer" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="from-account">From Account *</Label>
                <Select key={fromBankAccountId || "from-account"} value={fromBankAccountId || undefined} onValueChange={setFromBankAccountId} data-testid="select-from-account">
                  <SelectTrigger id="from-account">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.accountName} (₹{parseFloat(account.currentBalance || "0").toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to-account">To Account *</Label>
                <Select key={toBankAccountId || "to-account"} value={toBankAccountId || undefined} onValueChange={setToBankAccountId} data-testid="select-to-account">
                  <SelectTrigger id="to-account">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.accountName} (₹{parseFloat(account.currentBalance || "0").toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="bank-account">Bank Account *</Label>
              <Select key={fromBankAccountId || "bank-account"} value={fromBankAccountId || undefined} onValueChange={setFromBankAccountId} data-testid="select-bank-account">
                <SelectTrigger id="bank-account">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountName} (₹{parseFloat(account.currentBalance || "0").toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="client">Client (Optional)</Label>
            <Select key={clientId || "client"} value={clientId} onValueChange={(value) => setClientId(value === "none" ? "" : value)} data-testid="select-client">
              <SelectTrigger id="client">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-muted-foreground italic">
                  Clear selection
                </SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="input-description"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending} 
              data-testid="button-submit-transaction"
            >
              {createMutation.isPending || updateMutation.isPending 
                ? "Saving..." 
                : transactionId 
                  ? "Update Transaction" 
                  : "Submit Transaction"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
