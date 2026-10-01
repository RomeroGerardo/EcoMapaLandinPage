import { Bell, Sparkles, Database, Settings, LogOut, Building2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { user, activeTenant, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-6 flex items-center justify-between shrink-0 z-20 transition-colors duration-200">
      {/* Telemetría rápida de servicios de la jurisdicción */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-slate-700 dark:text-slate-300 font-medium hidden sm:inline">Asistente IA:</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Groq (En Línea)
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Database className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">PostGIS:</span>
          <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold font-mono">
            Mapeo Activo
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 font-medium">
          <Building2 className="h-3.5 w-3.5 text-purple-500" />
          <span className="truncate max-w-[200px]">{activeTenant?.name || 'Córdoba Capital'}</span>
        </div>
      </div>

      {/* Acciones, Toggle Tema & Perfil */}
      <div className="flex items-center gap-3">
        {/* Toggle Modo Claro / Oscuro */}
        <ThemeToggle />

        {/* Notificaciones */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-xl w-9 h-9 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors relative focus:outline-none">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <DropdownMenuLabel className="text-slate-900 dark:text-white font-bold">Notificaciones de Jurisdicción</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">Nuevo Punto de Reciclaje Validado</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Punto Verde Alberdi listo para recolección.</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">Asistente Groq LLM Activo</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">98% de precisión en respuestas de clasificación.</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Perfil del Operador Municipal */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 pl-1 focus:outline-none group">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-md border border-emerald-400/30">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {user?.user_metadata?.name || 'Operador Municipal'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-tight truncate max-w-[140px]">
                  {user?.email || 'ambiente@cordoba.gov.ar'}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Sesión Municipal Activa</p>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'ambiente@cordoba.gov.ar'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')} className="cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/30 cursor-pointer text-xs font-medium"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
