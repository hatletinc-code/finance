import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToggle";
import { AppSidebar } from "./components/AppSidebar";
import { useAuth, getCurrentUser } from "./lib/auth";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import TeamDashboard from "./pages/TeamDashboard";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Approvals from "./pages/Approvals";
import BankAccounts from "./pages/BankAccounts";
import Clients from "./pages/Clients";
import Categories from "./pages/Categories";
import Companies from "./pages/Companies";
import TeamMembers from "./pages/TeamMembers";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const user = useAuth((state) => state.user);
  const isLoading = useAuth((state) => state.isLoading);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  const user = useAuth((state) => state.user);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute component={user?.role === "admin" ? AdminDashboard : TeamDashboard} />
      </Route>
      <Route path="/transactions">
        <ProtectedRoute component={Transactions} />
      </Route>
      <Route path="/approvals">
        <ProtectedRoute component={Approvals} />
      </Route>
      <Route path="/accounts">
        <ProtectedRoute component={BankAccounts} />
      </Route>
      <Route path="/clients">
        <ProtectedRoute component={Clients} />
      </Route>
      <Route path="/categories">
        <ProtectedRoute component={Categories} />
      </Route>
      <Route path="/companies">
        <ProtectedRoute component={Companies} />
      </Route>
      <Route path="/team">
        <ProtectedRoute component={TeamMembers} />
      </Route>
      <Route path="/reports">
        <ProtectedRoute component={Reports} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const user = useAuth((state) => state.user);
  const setUser = useAuth((state) => state.setUser);
  const setLoading = useAuth((state) => state.setLoading);
  const isLoading = useAuth((state) => state.isLoading);
  const [location] = useLocation();

  useEffect(() => {
    getCurrentUser()
      .then((currentUser) => {
        if (currentUser) {
          setUser(currentUser);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setUser, setLoading]);

  const isLoginPage = location === "/login";

  if (isLoginPage) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <SidebarProvider style={sidebarStyle as React.CSSProperties}>
            <div className="flex h-screen w-full">
              {user && <AppSidebar role={user.role} />}
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between gap-4 border-b border-border p-4">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
