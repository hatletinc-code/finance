import { TransactionTable } from "../TransactionTable";

const mockTransactions = [
  {
    id: "1",
    date: "2025-10-10",
    type: "income" as const,
    company: "Acme Corp",
    category: "Sales",
    amount: "50,000",
    currency: "INR",
    status: "approved" as const,
    client: "TechStart Inc",
  },
  {
    id: "2",
    date: "2025-10-09",
    type: "expense" as const,
    company: "Tech Solutions",
    category: "Marketing",
    amount: "15,000",
    currency: "INR",
    status: "pending" as const,
  },
  {
    id: "3",
    date: "2025-10-08",
    type: "transfer" as const,
    company: "Retail Plus",
    category: "Operations",
    amount: "25,000",
    currency: "INR",
    status: "approved" as const,
  },
];

export default function TransactionTableExample() {
  return (
    <div className="container max-w-6xl p-8">
      <TransactionTable transactions={mockTransactions} isAdmin={true} />
    </div>
  );
}
