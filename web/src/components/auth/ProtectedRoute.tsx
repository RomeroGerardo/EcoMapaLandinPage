import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Leaf } from 'lucide-react';

export function ProtectedRoute() {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-pulse">
            <Leaf className="h-8 w-8 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
          </div>
          <p className="text-sm text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirigir a /login guardando la ruta previa para redirección post-login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export function SuperAdminRoute() {
  const { user, isSuperAdmin, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-pulse">
            <Leaf className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Validando permisos de Superadministrador...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isSuperAdmin) {
    // Si no es Superadmin, denegar acceso y redirigir al panel normal de su municipio/comercio
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-pulse">
            <Leaf className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // Si ya está autenticado, redirigir al dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
