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
      label: "Jurisdicciones & Red",
      icon: Building2,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} pendientes` : undefined,
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      description: "Municipios, empresas y contratos",
    },
    {
      to: "/plans",
      label: "Planes SaaS & Negocio",
      icon: Crown,
      description: "Precios B2G, cuotas y MRR",
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
      description: "Admins de entidades y auditores",
    },
  ];

  return (
    <aside className="w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/80 flex flex-col shrink-0 select-none transition-colors duration-200">
      {/* Brand Header: CivicLoop Technologies en Grande con Logo de Empresa */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex flex-col gap-3">
        <div className="flex items-center gap-3.5">
          <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-lg shadow-indigo-950/20 border-2 border-indigo-500/30 p-1 shrink-0 overflow-hidden group">
            <img
              src="/civicloop_logo.jpg"
              alt="CivicLoop Technologies"
              className="h-full w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-block px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 mb-0.5">
              Matriz Corporativa
            </span>
            <h1 className="font-extrabold text-lg leading-tight tracking-tight text-slate-900 dark:text-white truncate">
              CivicLoop
            </h1>
            <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 -mt-0.5">
              Technologies S.A.
            </p>
          </div>
        </div>

        {/* Subtítulo EcoMapa */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">EcoMapa</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">· Suite Global</span>
          </div>
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-purple-500/20 border border-purple-500/40 text-purple-700 dark:text-purple-300">
            SUPERADMIN
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3.5 flex-1 space-y-1.5 overflow-y-auto">
        <div className="px-3 pt-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-5 w-5 mt-0.5 transition-colors ${
                      isActive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold border ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
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
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/60">
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Sesión Root Cifrada
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              RLS OK
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Ambiente multi-jurisdicción. Acciones auditadas bajo protocolo de seguridad.
          </p>
        </div>
      </div>
    </aside>
  );
};
