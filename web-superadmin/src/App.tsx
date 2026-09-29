import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SuperAdminLayout } from "./layout/SuperAdminLayout";
import { DashboardConsolidated } from "./pages/DashboardConsolidated";
import { TenantsManagement } from "./pages/TenantsManagement";
import { InfrastructureMonitoring } from "./pages/InfrastructureMonitoring";
import { GlobalUsers } from "./pages/GlobalUsers";

export function App() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleGlobalRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 600);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <SuperAdminLayout
              pendingApprovalsCount={2}
              onRefresh={handleGlobalRefresh}
              isRefreshing={isRefreshing}
            />
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardConsolidated />} />
          <Route path="/tenants" element={<TenantsManagement />} />
          <Route path="/monitoring" element={<InfrastructureMonitoring />} />
          <Route path="/users" element={<GlobalUsers />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
