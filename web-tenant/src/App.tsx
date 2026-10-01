import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { ProtectedRoute, PublicOnlyRoute } from "./components/auth/ProtectedRoute";

// Layouts
import { DashboardLayout } from "./components/layout/DashboardLayout";

// Auth Page
import { Login } from "./pages/auth/Login";

// Main Dashboard Pages
import { Overview } from "./pages/Dashboard/Overview";
import { MapManager } from "./pages/Dashboard/MapManager";
import { Analytics } from "./pages/Dashboard/Analytics";
import { Users } from "./pages/Dashboard/Users";
import { Settings } from "./pages/Dashboard/Settings";

// Fase 2 & Logística Pages
import { Pickups } from "./pages/Dashboard/Pickups";
import { RewardsManager } from "./pages/Dashboard/RewardsManager";
import { RepProducers } from "./pages/Dashboard/RepProducers";
import { LogisticsRoutes } from "./pages/Dashboard/LogisticsRoutes";
import { CitizenInsights } from "./pages/Dashboard/CitizenInsights";
import { SustainabilityReport } from "./pages/Dashboard/SustainabilityReport";
import { TripleImpactCarbon } from "./pages/Dashboard/TripleImpactCarbon";
import { SubscriptionPlan } from "./pages/Dashboard/SubscriptionPlan";

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
        {/* ── 1. Root redirect directly to Dashboard ────── */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ── 2. Public Auth Route ──────────────────────── */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* ── 3. Protected Jurisdiction / Municipality Dashboard ──── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="map" element={<MapManager />} />
            <Route path="routes" element={<LogisticsRoutes />} />
            <Route path="impact" element={<TripleImpactCarbon />} />
            <Route path="plan" element={<SubscriptionPlan />} />
            <Route path="insights" element={<CitizenInsights />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="report" element={<SustainabilityReport />} />
            <Route path="pickups" element={<Pickups />} />
            <Route path="rewards" element={<RewardsManager />} />
            <Route path="rep" element={<RepProducers />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Tenant Backoffice Branch (Unificado dentro de DashboardLayout) */}
          <Route path="/backoffice" element={<DashboardLayout />}>
            <Route index element={<MyPoints />} />
            <Route path="stats" element={<Stats />} />
            <Route path="settings" element={<TenantSettings />} />
          </Route>
        </Route>

        {/* Fallback wildcard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
