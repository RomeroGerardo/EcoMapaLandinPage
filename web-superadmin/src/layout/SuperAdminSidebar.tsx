import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Cpu,
  Users2,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Crown,
} from "lucide-react";

interface SidebarProps {
  pendingApprovalsCount?: number;
}

export const SuperAdminSidebar: React.FC<SidebarProps> = ({ pendingApprovalsCount = 0 }) => {
  const navItems = [
    {
      to: "/dashboard",
      label: "Consola Consolidada",
      icon: LayoutDashboard,
      description: "KPIs globales y mapa de calor",
    },
    {
      to: "/tenants",
      label: "Gestión Multi-Tenant",
      icon: Building2,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} pendientes` : undefined,
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      description: "Municipios, empresas y cuotas",
    },
    {
      to: "/monitoring",
      label: "Infraestructura & IA",
      icon: Cpu,
      description: "Groq API, Supabase y PostGIS",
    },
    {
      to: "/users",
      label: "Usuarios y Roles",
      icon: Users2,
      description: "Admins de tenants y auditores",
    },
  ];

  return (
    <aside className="w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/20">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">EcoMapa</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-300">
                MASTER
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Crown className="h-3 w-3 text-amber-400" />
              Romero Labs GovTech
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3.5 flex-1 space-y-1.5 overflow-y-auto">
        <div className="px-3 pt-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Supervisión Global
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-start gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-5 w-5 mt-0.5 transition-colors ${
                      isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-slate-100">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold border ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Security & Version Footprint */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Sesión Root Cifrada
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              RLS OK
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Ambiente de producción multi-tenant. Todas las acciones quedan auditadas.
          </p>
        </div>
      </div>
    </aside>
  );
};
