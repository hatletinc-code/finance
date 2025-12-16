import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  ArrowLeftRight,
  CheckSquare,
  Wallet,
  Users,
  Tag,
  Building2,
  BarChart3,
  UserPlus,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth, logout as logoutUser } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface AppSidebarProps {
  role?: "admin" | "team";
}

export function AppSidebar({ role = "admin" }: AppSidebarProps) {
  const user = useAuth((state) => state.user);
  const logoutStore = useAuth((state) => state.logout);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const adminMenuItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
    { title: "Approvals", url: "/approvals", icon: CheckSquare },
    { title: "Bank Accounts", url: "/accounts", icon: Wallet },
    { title: "Clients", url: "/clients", icon: Users },
    { title: "Categories", url: "/categories", icon: Tag },
    { title: "Companies", url: "/companies", icon: Building2 },
    { title: "Reports", url: "/reports", icon: BarChart3 },
    { title: "Team Members", url: "/team", icon: UserPlus },
  ];

  const teamMenuItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  ];

  const menuItems = role === "admin" ? adminMenuItems : teamMenuItems;

  const handleLogout = async () => {
    try {
      await logoutUser();
      logoutStore();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">FinanceHub</h2>
            <p className="text-xs text-muted-foreground capitalize">{role} Portal</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {user?.name.substring(0, 2).toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || ""}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
