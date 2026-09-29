import { Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  return <Outlet />;
}

export function SuperAdminRoute() {
  return <Outlet />;
}

export function PublicOnlyRoute() {
  return <Outlet />;
}
