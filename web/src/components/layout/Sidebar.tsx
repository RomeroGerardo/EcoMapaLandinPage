import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Map as MapIcon, 
  Building2, 
  Settings, 
  Activity, 
  Leaf, 
  ShieldAlert, 
  Layers, 
  Truck, 
  Gift, 
  Factory,
  Crown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: string | number;
}

const SidebarItem = ({ to, icon, label, badge }: SidebarItemProps) => (
  <NavLink
    to={to}
    end={to === '/dashboard'}
    className={({ isActive }) =>
      cn(
        "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all hover:text-primary hover:bg-primary/5",
        isActive 
          ? "bg-primary/10 text-primary font-semibold" 
          : "text-muted-foreground"
      )
    }
  >
    <div className="flex items-center gap-3">
      {icon}
      <span>{label}</span>
    </div>
    {badge !== undefined && (
      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
        {badge}
      </span>
    )}
  </NavLink>
);

export function Sidebar() {
  const activeTenant = useAuthStore((state) => state.activeTenant);
  const isSuperAdmin = useAuthStore((state) => state.isSuperAdmin);

  return (
    <div className="flex h-full flex-col gap-3 border-r bg-card px-3 py-5 w-64 shadow-sm z-10">
      {/* Brand Header */}
      <div className="flex h-12 items-center border-b pb-3 px-2">
        <NavLink to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="tracking-tight">EcoMapa Pro</span>
        </NavLink>
      </div>
      
      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-1">
        <nav className="grid items-start gap-3">
          
          {/* Monitoreo Operativo */}
          <div className="space-y-1">
            <h2 className="mb-1.5 px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Monitoreo
            </h2>
            <SidebarItem to="/dashboard" icon={<Home className="h-4 w-4" />} label="Overview" />
            <SidebarItem to="/dashboard/map" icon={<MapIcon className="h-4 w-4" />} label="Mapa de Puntos" />
            <SidebarItem to="/dashboard/analytics" icon={<Activity className="h-4 w-4" />} label="Métricas IA" />
          </div>
          
          {/* Operaciones B2G */}
          <div className="space-y-1 pt-1">
            <h2 className="mb-1.5 px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Operaciones & B2G
            </h2>
            <SidebarItem to="/dashboard/pickups" icon={<Truck className="h-4 w-4 text-blue-500" />} label="Retiros a Domicilio" />
            <SidebarItem to="/dashboard/rep" icon={<Factory className="h-4 w-4 text-purple-500" />} label="Productores REP" />
            <SidebarItem to="/dashboard/rewards" icon={<Gift className="h-4 w-4 text-emerald-500" />} label="Recompensas & Cupones" />
          </div>

          {/* Sección Exclusiva Superadmin (Romero Labs) */}
          {isSuperAdmin && (
            <div className="space-y-1 pt-1 border-t mt-1">
              <h2 className="mb-1.5 px-3 text-[10px] font-bold tracking-wider text-purple-600 dark:text-purple-400 uppercase flex items-center gap-1">
                <Crown className="h-3 w-3" /> Control SaaS (Master)
              </h2>
              <SidebarItem to="/superadmin/tenants" icon={<Building2 className="h-4 w-4 text-purple-500" />} label="Entidades & Planes" />
              <SidebarItem to="/dashboard/approvals" icon={<ShieldAlert className="h-4 w-4 text-amber-500" />} label="Aprobaciones Globales" />
            </div>
          )}

          {/* Configuración */}
          <div className="space-y-1 pt-1 border-t mt-1">
            {activeTenant && (
              <SidebarItem 
                to="/backoffice" 
                icon={<Layers className="h-4 w-4 text-green-600" />} 
                label={`Panel: ${activeTenant.name.length > 14 ? `${activeTenant.name.substring(0, 12)}…` : activeTenant.name}`} 
              />
            )}
            <SidebarItem to="/dashboard/settings" icon={<Settings className="h-4 w-4" />} label="Configuración" />
          </div>
        </nav>
      </div>

      {/* Tenant Indicator or System Badge */}
      <div className="mt-auto border-t pt-3">
        {isSuperAdmin ? (
          <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-2.5">
            <p className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1">
              <Crown className="h-3 w-3" /> Superadministrador
            </p>
            <p className="text-[11px] text-muted-foreground">Romero Labs Master Access</p>
          </div>
        ) : activeTenant ? (
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-2.5">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400">Tenant Activo</p>
            <p className="text-[11px] text-muted-foreground truncate">{activeTenant.name}</p>
          </div>
        ) : (
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-2.5">
            <p className="text-xs font-semibold text-primary">EcoMapa Enterprise</p>
            <p className="text-[11px] text-muted-foreground">Panel Administrativo</p>
          </div>
        )}
      </div>
    </div>
  );
}
