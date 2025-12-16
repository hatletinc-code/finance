import { ProfitLossChart } from "../ProfitLossChart";

const mockData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  income: [45000, 52000, 48000, 61000, 55000, 67000],
  expense: [32000, 38000, 35000, 42000, 40000, 45000],
};

export default function ProfitLossChartExample() {
  return (
    <div className="container max-w-4xl p-8 space-y-4">
      <ProfitLossChart data={mockData} type="bar" />
      <ProfitLossChart data={mockData} type="line" />
    </div>
  );
}
