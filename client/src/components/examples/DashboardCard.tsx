import { DashboardCard } from "../DashboardCard";
import { Wallet, TrendingUp, Users, Building2 } from "lucide-react";

export default function DashboardCardExample() {
  return (
    <div className="grid gap-4 p-8 md:grid-cols-2 lg:grid-cols-4">
      <DashboardCard
        title="Total Balance"
        value="₹2,45,350"
        icon={Wallet}
        trend={{ value: "12.5%", isPositive: true }}
        subtitle="vs last month"
      />
      <DashboardCard
        title="Total Income"
        value="₹1,25,000"
        icon={TrendingUp}
        trend={{ value: "8.2%", isPositive: true }}
      />
      <DashboardCard
        title="Total Clients"
        value="24"
        icon={Users}
        subtitle="Active clients"
      />
      <DashboardCard
        title="Companies"
        value="5"
        icon={Building2}
      />
    </div>
  );
}
