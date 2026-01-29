"use client";

import DashboardHeader from "@/components/Headers/DashboardHeader";
import { SidebarProvider, useSidebar } from "@/providers/SidebarContext";
import { AuthGuard } from "@/components/AuthGuard";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <DashboardHeader />

      {/* Sidebar */}

      {/* Main Content */}
      <main className={`flex-1 pt-20 pb-8 transition-all duration-300 `}>
        <div className="p-10">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["teacher", "admin"]}>
      <SidebarProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </SidebarProvider>
    </AuthGuard>
  );
}
