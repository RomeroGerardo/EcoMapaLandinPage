import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { MapPin, BarChart3, Settings, Menu, LogOut, Leaf } from "lucide-react";
import { useState } from "react";
import { UserChip } from "../components/shared/UserChip";
import { useAuthStore } from "../store/useAuthStore";

const SECTIONS = [
  { id: "myPoints", label: "Mis Puntos", icon: MapPin, path: "/backoffice" },
  { id: "stats", label: "Estadísticas", icon: BarChart3, path: "/backoffice/stats" },
  { id: "settings", label: "Ajustes", icon: Settings, path: "/backoffice/settings" },
];

export function TenantLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { activeTenant, clearActiveTenant } = useAuthStore();

  if (!activeTenant) {
    return <Navigate to="/dashboard/users" replace />;
  }

  const handleLogout = () => {
    clearActiveTenant();
    navigate('/dashboard/users');
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-[220px] flex-col bg-[#F0F7F0] border-r md:flex">
        {/* Branding */}
        <div className="flex h-16 items-center px-5 bg-green-600/[0.06]">
          <Leaf className="mr-2 h-[22px] w-[22px] text-green-600" />
          <span className="font-bold text-green-600">Admin Panel</span>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3">
          <ul className="space-y-1 px-2">
            {SECTIONS.map((section) => {
              const isActive = location.pathname === section.path || (section.path !== "/backoffice" && location.pathname.startsWith(section.path));
              return (
                <li key={section.id}>
                  <Link
                    to={section.path}
                    className={`flex items-center rounded-[10px] px-3.5 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-green-600/[0.12] text-green-700"
                        : "text-muted-foreground hover:bg-green-600/5"
                    }`}
                  >
                    <section.icon className={`mr-3 h-5 w-5 ${isActive ? "text-green-700" : "text-muted-foreground"}`} />
                    {section.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="border-t p-4">
          <p className="text-[11px] text-muted-foreground">EcoMapa v1.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between bg-green-600 px-4 shadow-sm">
          <div className="flex items-center gap-3 text-white">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 md:hidden">
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden md:flex items-center justify-center p-2">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[17px] font-bold leading-tight">EcoMapa Backoffice</span>
              <span className="text-[11px] text-white/70 leading-tight">Tenant: {activeTenant.name}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <UserChip email={`${activeTenant.name.toLowerCase().replace(/\s+/g, '')}@ecomapa.com`} role={activeTenant.type} />
            
            <button className="p-2 text-white/80 hover:text-white transition-colors" title="Ver mapa público">
              <MapPin className="h-5 w-5" />
            </button>
            
            <button onClick={handleLogout} className="p-2 text-white/80 hover:text-white transition-colors" title="Cerrar sesión">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="absolute inset-0 z-50 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-white shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="flex h-32 flex-col justify-center bg-green-600 px-6 text-white">
                <div className="flex items-center gap-3">
                  <Leaf className="h-8 w-8" />
                  <div>
                    <h2 className="text-xl font-bold">EcoMapa</h2>
                    <p className="text-[13px] text-white/70">Admin Panel</p>
                  </div>
                </div>
              </div>
              <nav className="p-3">
                <ul className="space-y-1">
                  {SECTIONS.map((section) => {
                    const isActive = location.pathname === section.path || (section.path !== "/backoffice" && location.pathname.startsWith(section.path));
                    return (
                      <li key={section.id}>
                        <Link
                          to={section.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center rounded-[10px] px-4 py-3 text-sm font-medium ${
                            isActive
                              ? "bg-green-600/[0.08] text-green-700"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <section.icon className={`mr-4 h-6 w-6 ${isActive ? "text-green-700" : "text-muted-foreground"}`} />
                          {section.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
