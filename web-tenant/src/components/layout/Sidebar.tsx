import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Map as MapIcon, 
  Settings, 
  Activity, 
  Leaf, 
  Layers, 
  Truck, 
  Gift, 
  Factory, 
  Crown, 
  Route, 
  Brain, 
  FileText,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  badge?: string | number;
  badgeColor?: string;
}

const SidebarItem = ({ to, icon, label, description, badge, badgeColor }: SidebarItemProps) => (
  <NavLink
    to={to}
    end={to === '/dashboard'}
    className={({ isActive }) =>
      `group flex items-start gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
      }`
    }
  >
    <div className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-1">
        <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">{label}</span>
        {badge !== undefined && (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold border ${
              badgeColor || 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      {description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
          {description}
        </p>
      )}
    </div>
  </NavLink>
);

export function Sidebar() {
  const activeTenant = useAuthStore((state) => state.activeTenant);

  return (
    <aside className="w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/80 flex flex-col shrink-0 select-none transition-colors duration-200">
      {/* Brand Header: EcoMapa en Grande con Logo de la App y Subtítulo de CivicLoop */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex flex-col gap-3">
        <div className="flex items-center gap-3.5">
          <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-lg shadow-emerald-950/20 border-2 border-emerald-500/30 p-1 shrink-0 overflow-hidden group">
            <img
              src="/ecomapa_logo.png"
              alt="EcoMapa App"
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-block px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 mb-0.5">
              Portal Operativo
            </span>
            <h1 className="font-extrabold text-xl leading-tight tracking-tight text-slate-900 dark:text-white truncate">
              EcoMapa
            </h1>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 -mt-0.5 flex items-center gap-1">
              por CivicLoop Technologies
            </p>
          </div>
        </div>

        {/* Indicador de Jurisdicción Activa */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5 min-w-0">
            <Building2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
              {activeTenant?.name || 'Municipio de Córdoba'}
            </span>
          </div>
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
            ACTIVO
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* Monitoreo Territorial */}
        <div className="space-y-1">
          <div className="px-3 pt-1 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Monitoreo Territorial
          </div>
          <SidebarItem
            to="/dashboard"
            icon={<Home className="h-4 w-4" />}
            label="Overview"
            description="KPIs en vivo y operaciones"
          />
          <SidebarItem
            to="/dashboard/map"
            icon={<MapIcon className="h-4 w-4 text-emerald-500" />}
            label="Puntos de Reciclaje"
            description="Mapeo de campanas y estado"
          />
          <SidebarItem
            to="/dashboard/routes"
            icon={<Route className="h-4 w-4 text-emerald-500" />}
            label="Rutas & Logística"
            description="Optimización de recorridos"
          />
          <SidebarItem
            to="/dashboard/impact"
            icon={<Leaf className="h-4 w-4 text-teal-500" />}
            label="Impacto B & Carbono"
            description="Balance CO₂ y auditoría ODS"
          />
          <SidebarItem
            to="/dashboard/insights"
            icon={<Brain className="h-4 w-4 text-purple-500" />}
            label="Insights de Vecinos"
            description="Patrones y tendencias vecinales"
          />
          <SidebarItem
            to="/dashboard/analytics"
            icon={<Activity className="h-4 w-4 text-blue-500" />}
            label="Telemetría IA"
            description="Consultas al motor Groq"
          />
          <SidebarItem
            to="/dashboard/report"
            icon={<FileText className="h-4 w-4 text-teal-500" />}
            label="Auditoría Ambiental"
            description="Reportes PDF descargables"
          />
        </div>

        {/* Operaciones & B2G */}
        <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <div className="px-3 pt-1 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Operaciones & Servicios
          </div>
          <SidebarItem
            to="/dashboard/pickups"
            icon={<Truck className="h-4 w-4 text-blue-500" />}
            label="Retiros a Domicilio"
            description="Solicitudes de voluminosos"
          />
          <SidebarItem
            to="/dashboard/rep"
            icon={<Factory className="h-4 w-4 text-purple-500" />}
            label="Productores REP"
            description="Empresas con responsabilidad"
          />
          <SidebarItem
            to="/dashboard/rewards"
            icon={<Gift className="h-4 w-4 text-emerald-500" />}
            label="Recompensas & Puntos"
            description="Canje en comercios locales"
          />
          <SidebarItem
            to="/dashboard/plan"
            icon={<Crown className="h-4 w-4 text-amber-500" />}
            label="Mi Plan & Cuotas"
            description="Consumo de límites del plan"
          />
        </div>

        {/* Configuración */}
        <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800/80">
          {activeTenant && (
            <SidebarItem
              to="/backoffice"
              icon={<Layers className="h-4 w-4 text-emerald-500" />}
              label="Backoffice de Puntos"
              description="Aprobación rápida de campo"
            />
          )}
          <SidebarItem
            to="/dashboard/settings"
            icon={<Settings className="h-4 w-4" />}
            label="Configuración"
            description="Ajustes de la jurisdicción"
          />
        </div>
      </div>

      {/* Security & Active Jurisdiction Footprint */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/60">
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Jurisdicción Conectada
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">
              EN LÍNEA
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {activeTenant?.name || 'Municipalidad de Córdoba Capital'}
          </p>
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between font-mono">
            <span>GovTech SaaS</span>
            <span>CivicLoop Technologies</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
