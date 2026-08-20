import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { ProtectedRoute, PublicOnlyRoute, SuperAdminRoute } from "./components/auth/ProtectedRoute";

// Layouts
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { TenantLayout } from "./layout/TenantLayout";

// Public Pages
import { LandingPage } from "./pages/public/LandingPage";
import { Login } from "./pages/auth/Login";

// Main Dashboard Pages
import { Overview } from "./pages/Dashboard/Overview";
import { MapManager } from "./pages/Dashboard/MapManager";
import { Analytics } from "./pages/Dashboard/Analytics";
import { Users } from "./pages/Dashboard/Users";
import { Settings } from "./pages/Dashboard/Settings";

// Fase 2 Pages
import { Pickups } from "./pages/Dashboard/Pickups";
import { RewardsManager } from "./pages/Dashboard/RewardsManager";
import { RepProducers } from "./pages/Dashboard/RepProducers";

// Superadmin Exclusive Pages (Romero Labs Master)
import { Approvals } from "./pages/superadmin/Approvals";
import { Tenants } from "./pages/superadmin/Tenants";

// Tenant Pages
import { MyPoints } from "./pages/tenant/MyPoints";
import { Stats } from "./pages/tenant/Stats";
import { Settings as TenantSettings } from "./pages/tenant/Settings";

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => {
      unsubscribe();
    };
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ── 1. Public Landing Page ────────────────────── */}
        <Route path="/" element={<LandingPage />} />

        {/* ── 2. Public Auth Route ──────────────────────── */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* ── 3. Superadmin Exclusive Routes (Romero Labs Master) ── */}
        <Route element={<SuperAdminRoute />}>
          <Route path="/superadmin" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/superadmin/tenants" replace />} />
            <Route path="tenants" element={<Tenants />} />
            <Route path="approvals" element={<Approvals />} />
          </Route>
        </Route>

        {/* ── 4. Protected Operator / Tenant Dashboard ──── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="map" element={<MapManager />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="pickups" element={<Pickups />} />
            <Route path="rewards" element={<RewardsManager />} />
            <Route path="rep" element={<RepProducers />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Tenant Backoffice Branch */}
          <Route path="/backoffice" element={<TenantLayout />}>
            <Route index element={<MyPoints />} />
            <Route path="stats" element={<Stats />} />
            <Route path="settings" element={<TenantSettings />} />
          </Route>
        </Route>

        {/* Fallback wildcard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
