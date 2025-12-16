import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";

type Status = "pending" | "approved" | "rejected";

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "default";
}

export function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const config = {
    pending: {
      label: "Pending",
      className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: Clock,
    },
    approved: {
      label: "Approved",
      className: "bg-green-500/10 text-green-500 border-green-500/20",
      icon: CheckCircle,
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-500/10 text-red-500 border-red-500/20",
      icon: XCircle,
    },
  };

  const { label, className, icon: Icon } = config[status];

  return (
    <Badge
      variant="outline"
      className={`${className} ${size === "sm" ? "text-xs" : ""}`}
      data-testid={`badge-status-${status}`}
    >
      <Icon className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />
      {label}
    </Badge>
  );
}
