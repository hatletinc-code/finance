import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowRight, ArrowDownUp } from "lucide-react";

interface ApprovalCardProps {
  transaction: {
    id: string;
    type: "income" | "expense" | "transfer";
    amount: string;
    currency: string;
    company: string;
    category: string;
    description: string;
    client?: string;
    submittedBy: string;
    fromAccount?: string;
    toAccount?: string;
  };
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function ApprovalCard({ transaction, onApprove, onReject }: ApprovalCardProps) {
  const typeConfig = {
    income: { label: "Income", color: "text-green-500", bg: "bg-green-500/10" },
    expense: { label: "Expense", color: "text-red-500", bg: "bg-red-500/10" },
    transfer: { label: "Transfer", color: "text-blue-500", bg: "bg-blue-500/10" },
  };

  const config = typeConfig[transaction.type];

  return (
    <Card data-testid={`card-approval-${transaction.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl font-mono font-bold tabular-nums">
                {transaction.currency === "USD" ? "$" : "₹"}{transaction.amount}
              </span>
              <Badge variant="outline" className={`${config.bg} ${config.color} border-transparent`}>
                {config.label}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Submitted by {transaction.submittedBy}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Company:</span>
            <span className="font-medium">{transaction.company}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Category:</span>
            <span className="font-medium">{transaction.category}</span>
          </div>
          {transaction.client && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client:</span>
              <span className="font-medium">{transaction.client}</span>
            </div>
          )}
          {transaction.type === "transfer" && (
            <div className="flex items-center justify-between rounded-md bg-muted/50 p-2">
              <span className="text-xs font-medium">{transaction.fromAccount}</span>
              <ArrowRight className="h-4 w-4" />
              <span className="text-xs font-medium">{transaction.toAccount}</span>
            </div>
          )}
        </div>

        {transaction.description && (
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">{transaction.description}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            onClick={() => { onApprove?.(transaction.id); console.log("Approved:", transaction.id); }}
            data-testid={`button-approve-${transaction.id}`}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </Button>
          <Button 
            variant="destructive" 
            className="flex-1"
            onClick={() => { onReject?.(transaction.id); console.log("Rejected:", transaction.id); }}
            data-testid={`button-reject-${transaction.id}`}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
