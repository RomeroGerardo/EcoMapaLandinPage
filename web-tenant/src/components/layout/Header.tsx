import { Bell, Search, User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-md px-6 shadow-sm sticky top-0 z-10">
      <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar contenedores, usuarios..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-9 md:w-[300px] lg:w-[400px]"
            />
          </div>
        </form>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full w-8 h-8 bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative focus:outline-none">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <span className="font-medium text-sm">Nuevo Punto Registrado</span>
              <span className="text-xs text-muted-foreground">La Municipalidad de Córdoba agregó puntos.</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <span className="font-medium text-sm">Alerta de Sistema</span>
              <span className="text-xs text-muted-foreground">Sistema de clasificación IA operando con normalidad.</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full w-8 h-8 bg-primary/20 flex items-center justify-center text-primary border border-primary/30 focus:outline-none">
              <User className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Mi Cuenta</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user?.email || 'admin@ecomapa.org'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
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
