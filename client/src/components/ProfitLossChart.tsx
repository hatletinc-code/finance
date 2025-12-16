import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  labels: string[];
  income: number[];
  expense: number[];
}

interface ProfitLossChartProps {
  data: ChartData;
  type?: "bar" | "line";
}

export function ProfitLossChart({ data, type = "bar" }: ProfitLossChartProps) {
  const isDark = document.documentElement.classList.contains("dark");
  
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Income",
        data: data.income,
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 2,
      },
      {
        label: "Expense",
        data: data.expense,
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        borderColor: "rgb(239, 68, 68)",
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: isDark ? "rgb(226, 232, 240)" : "rgb(15, 23, 42)",
          font: {
            family: "Inter",
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: isDark ? "rgb(30, 41, 59)" : "rgb(255, 255, 255)",
        titleColor: isDark ? "rgb(226, 232, 240)" : "rgb(15, 23, 42)",
        bodyColor: isDark ? "rgb(226, 232, 240)" : "rgb(15, 23, 42)",
        borderColor: isDark ? "rgb(51, 65, 85)" : "rgb(226, 232, 240)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? "rgb(148, 163, 184)" : "rgb(100, 116, 139)",
        },
      },
      y: {
        grid: {
          color: isDark ? "rgba(51, 65, 85, 0.5)" : "rgba(226, 232, 240, 0.5)",
        },
        ticks: {
          color: isDark ? "rgb(148, 163, 184)" : "rgb(100, 116, 139)",
          callback: (value) => `₹${value}`,
        },
      },
    },
  };

  const ChartComponent = type === "bar" ? Bar : Line;

  return (
    <Card data-testid="card-profit-loss-chart">
      <CardHeader>
        <CardTitle>Income vs Expense Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartComponent data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
