import { AppSidebar } from "../AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar role="admin" />
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-semibold">Admin Sidebar Example</h1>
          <p className="text-muted-foreground mt-2">
            The sidebar shows all admin menu items
          </p>
        </div>
      </div>
    </SidebarProvider>
  );
}
