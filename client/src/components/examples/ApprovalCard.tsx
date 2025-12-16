import { ApprovalCard } from "../ApprovalCard";

const mockTransaction = {
  id: "1",
  type: "income" as const,
  amount: "50,000",
  currency: "INR",
  company: "Acme Corp",
  category: "Sales",
  description: "Payment received for Q4 consulting services",
  client: "TechStart Inc",
  submittedBy: "John Doe (Team)",
};

export default function ApprovalCardExample() {
  return (
    <div className="container max-w-md p-8">
      <ApprovalCard transaction={mockTransaction} />
    </div>
  );
}
