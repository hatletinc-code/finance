import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReportData {
  id: string;
  name: string;
  income: string;
  expense: string;
  netProfit: string;
  transferIn?: string;
  transferOut?: string;
}

interface OverallData {
  income: string;
  expense: string;
  netProfit: string;
}

export default function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: overallData, isLoading: loadingOverall } = useQuery<OverallData>({
    queryKey: ["/api/reports/profit-loss", startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const res = await fetch(`/api/reports/profit-loss?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch overall report");
      return await res.json();
    },
  });

  const { data: companyData = [], isLoading: loadingCompanies } = useQuery<ReportData[]>({
    queryKey: ["/api/reports/by-company", startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const res = await fetch(`/api/reports/by-company?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch company report");
      return await res.json();
    },
  });

  const { data: clientData = [], isLoading: loadingClients } = useQuery<ReportData[]>({
    queryKey: ["/api/reports/by-client", startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const res = await fetch(`/api/reports/by-client?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch client report");
      return await res.json();
    },
  });

  const { data: categoryData = [], isLoading: loadingCategories } = useQuery<ReportData[]>({
    queryKey: ["/api/reports/by-category", startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const res = await fetch(`/api/reports/by-category?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch category report");
      return await res.json();
    },
  });

  const { data: bankAccountData = [], isLoading: loadingBankAccounts } = useQuery<ReportData[]>({
    queryKey: ["/api/reports/by-bank-account", startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const res = await fetch(`/api/reports/by-bank-account?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch bank account report");
      return await res.json();
    },
  });

  const handleExportCSV = async () => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    
    const res = await fetch(`/api/reports/export-csv?${params}`, {
      credentials: "include",
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${startDate || "all"}-${endDate || "all"}.csv`;
    a.click();
  };

  const renderReportTable = (data: ReportData[], showTransfers = false) => {
    if (data.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No data available for the selected period
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0">
            <div className="flex-1">
              <p className="font-medium" data-testid={`text-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>{item.name}</p>
              <div className="flex gap-6 mt-1 text-sm">
                <span className="text-green-500">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  Income: ₹{parseFloat(item.income).toLocaleString()}
                </span>
                <span className="text-red-500">
                  <TrendingDown className="inline h-3 w-3 mr-1" />
                  Expense: ₹{parseFloat(item.expense).toLocaleString()}
                </span>
                {showTransfers && item.transferIn && item.transferOut && (
                  <>
                    <span className="text-blue-500">
                      <ArrowLeftRight className="inline h-3 w-3 mr-1" />
                      Transfer In: ₹{parseFloat(item.transferIn).toLocaleString()}
                    </span>
                    <span className="text-orange-500">
                      <ArrowLeftRight className="inline h-3 w-3 mr-1" />
                      Transfer Out: ₹{parseFloat(item.transferOut).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className={`text-lg font-mono font-bold tabular-nums ${parseFloat(item.netProfit) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ₹{parseFloat(item.netProfit).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6" data-testid="page-reports">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Profit & Loss statements and financial insights
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV} data-testid="button-export-csv">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date">Start Date</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            data-testid="input-start-date"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date">End Date</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            data-testid="input-end-date"
          />
        </div>
        {(startDate || endDate) && (
          <div className="flex items-end">
            <Button 
              variant="ghost" 
              onClick={() => { setStartDate(""); setEndDate(""); }}
              data-testid="button-clear-dates"
            >
              Clear Dates
            </Button>
          </div>
        )}
      </div>

      {loadingOverall ? (
        <div className="text-muted-foreground">Loading overall stats...</div>
      ) : overallData && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card data-testid="card-total-income">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold tabular-nums text-green-500">
                ₹{parseFloat(overallData.income).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-expense">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Expense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold tabular-nums text-red-500">
                ₹{parseFloat(overallData.expense).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-net-profit">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-mono font-bold tabular-nums ${parseFloat(overallData.netProfit) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ₹{parseFloat(overallData.netProfit).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="companies" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="companies" data-testid="tab-companies">Companies</TabsTrigger>
          <TabsTrigger value="clients" data-testid="tab-clients">Clients</TabsTrigger>
          <TabsTrigger value="categories" data-testid="tab-categories">Categories</TabsTrigger>
          <TabsTrigger value="bank-accounts" data-testid="tab-bank-accounts">Bank Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          <Card data-testid="card-company-report">
            <CardHeader>
              <CardTitle>Company-wise P&L</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCompanies ? (
                <div className="text-muted-foreground">Loading companies...</div>
              ) : (
                renderReportTable(companyData)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card data-testid="card-client-report">
            <CardHeader>
              <CardTitle>Client-wise P&L</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingClients ? (
                <div className="text-muted-foreground">Loading clients...</div>
              ) : (
                renderReportTable(clientData)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card data-testid="card-category-report">
            <CardHeader>
              <CardTitle>Category-wise P&L</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCategories ? (
                <div className="text-muted-foreground">Loading categories...</div>
              ) : (
                renderReportTable(categoryData)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank-accounts">
          <Card data-testid="card-bank-account-report">
            <CardHeader>
              <CardTitle>Bank Account-wise P&L</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingBankAccounts ? (
                <div className="text-muted-foreground">Loading bank accounts...</div>
              ) : (
                renderReportTable(bankAccountData, true)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
