import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { MoreVertical, CheckCircle, XCircle, Eye, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface Transaction {
  id: string;
  date: string;
  type: "income" | "expense" | "transfer";
  company: string;
  category: string;
  amount: string;
  currency: string;
  status: "pending" | "approved" | "rejected";
  client?: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  isAdmin?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TransactionTable({ 
  transactions, 
  isAdmin = false, 
  onApprove, 
  onReject,
  onView,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "income": return "text-green-500";
      case "expense": return "text-red-500";
      case "transfer": return "text-blue-500";
      default: return "";
    }
  };

  return (
    <div className="rounded-md border" data-testid="table-transactions">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Client</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                <TableCell className="text-sm">{transaction.date}</TableCell>
                <TableCell>
                  <span className={`text-sm font-medium capitalize ${getTypeColor(transaction.type)}`}>
                    {transaction.type}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{transaction.company}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{transaction.category}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{transaction.client || "-"}</TableCell>
                <TableCell className="text-right font-mono font-medium tabular-nums">
                  {transaction.currency === "USD" ? "$" : "₹"}{transaction.amount}
                </TableCell>
                <TableCell>
                  <StatusBadge status={transaction.status} size="sm" />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-actions-${transaction.id}`}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isAdmin && transaction.status === "pending" && (
                        <>
                          <DropdownMenuItem 
                            onClick={() => onApprove?.(transaction.id)}
                            data-testid={`button-approve-${transaction.id}`}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onReject?.(transaction.id)}
                            className="text-destructive"
                            data-testid={`button-reject-${transaction.id}`}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem 
                        onClick={() => onView?.(transaction.id)}
                        data-testid={`button-view-${transaction.id}`}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {transaction.status === "pending" && (
                        <DropdownMenuItem 
                          onClick={() => onEdit?.(transaction.id)}
                          data-testid={`button-edit-${transaction.id}`}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => onDelete?.(transaction.id)}
                        className="text-destructive"
                        data-testid={`button-delete-${transaction.id}`}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
