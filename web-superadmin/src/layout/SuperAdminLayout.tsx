import React from "react";
import { Outlet } from "react-router-dom";
import { SuperAdminSidebar } from "./SuperAdminSidebar";
import { SuperAdminHeader } from "./SuperAdminHeader";

interface LayoutProps {
  pendingApprovalsCount?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const SuperAdminLayout: React.FC<LayoutProps> = ({
  pendingApprovalsCount = 0,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="h-screen w-screen flex bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar fijo */}
      <SuperAdminSidebar pendingApprovalsCount={pendingApprovalsCount} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <SuperAdminHeader onRefresh={onRefresh} isRefreshing={isRefreshing} />

        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
