import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Users2,
  UserPlus,
  Shield,
  Building2,
  Mail,
  Search,
  CheckCircle2,
  KeyRound,
  Trash2,
  ShieldAlert,
} from "lucide-react";

interface GlobalUser {
  id: string;
  email: string;
  name: string;
  role: "superadmin" | "tenant_admin" | "auditor";
  tenant_id?: string;
  tenant_name?: string;
  status: "active" | "invited" | "suspended";
  created_at: string;
}

export const GlobalUsers: React.FC = () => {
  const [users, setUsers] = useState<GlobalUser[]>([
    {
      id: "u-1",
      email: "admin@civicloop.tech",
      name: "SuperAdmin CivicLoop",
      role: "superadmin",
      status: "active",
      created_at: "2026-04-22T20:42:07Z",
    },
    {
      id: "u-2",
      email: "intendencia@carlospaz.gov.ar",
      name: "Lic. Martín Gill",
      role: "tenant_admin",
      tenant_name: "Municipalidad de Villa Carlos Paz",
      status: "active",
      created_at: "2026-05-10T12:00:00Z",
    },
    {
      id: "u-3",
      email: "ambiente@cordoba.gob.ar",
      name: "Ing. Sofía Carrizo",
      role: "tenant_admin",
      tenant_name: "Municipalidad de Córdoba",
      status: "active",
      created_at: "2026-06-01T15:20:00Z",
    },
    {
      id: "u-4",
      email: "auditoria@ministerioambiente.gov.ar",
      name: "Cdor. Roberto Valenzuela",
      role: "auditor",
      status: "active",
      created_at: "2026-07-14T08:45:00Z",
    },
  ]);

  const [tenantsList, setTenantsList] = useState<{ id: string; name: string }[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"superadmin" | "tenant_admin" | "auditor">("tenant_admin");
  const [newTenantId, setNewTenantId] = useState("");

  useEffect(() => {
    async function loadTenants() {
      const { data } = await supabase.from("tenants").select("id, name");
      if (data) {
        setTenantsList(data);
        if (data.length > 0) setNewTenantId(data[0].id);
      }
    }
    loadTenants();
  }, []);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) return;

    const assignedTenant = tenantsList.find((t) => t.id === newTenantId);

    const newUser: GlobalUser = {
      id: `u-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      tenant_name: newRole === "tenant_admin" ? assignedTenant?.name : undefined,
      status: "active",
      created_at: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setNewName("");
    setNewEmail("");
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.tenant_name?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Gestión de Usuarios Globales & Roles
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Asignación de administradores clave a cada municipio y control de privilegios de acceso.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4 stroke-[3]" />
          Nuevo Administrador
        </button>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o municipio..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
          />
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-md dark:shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-700 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Usuario / Administrador</th>
                <th className="py-3.5 px-4 font-semibold">Rol del Sistema</th>
                <th className="py-3.5 px-4 font-semibold">Tenant Asignado</th>
                <th className="py-3.5 px-4 font-semibold">Estado</th>
                <th className="py-3.5 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{u.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                        {u.email}
                      </p>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        u.role === "superadmin"
                          ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
                          : u.role === "tenant_admin"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30"
                      }`}
                    >
                      {u.role === "superadmin"
                        ? "👑 SuperAdmin CivicLoop"
                        : u.role === "tenant_admin"
                        ? "🏛️ Admin de Municipio"
                        : "📋 Auditor Gubernamental"}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    {u.tenant_name ? (
                      <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        {u.tenant_name}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Acceso Global (Todos)</span>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      ● Activo
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
                        title="Restablecer contraseña"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR USUARIO / ASIGNAR ADMIN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Asignar Administrador
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej. Ing. Martín Gómez"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Correo Electrónico Oficial</label>
                <input
                  type="email"
                  placeholder="usuario@municipio.gov.ar"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rol Asignado</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
                >
                  <option value="tenant_admin">🏛️ Administrador de Municipio (Tenant Admin)</option>
                  <option value="auditor">📋 Auditor Gubernamental (Solo Lectura)</option>
                  <option value="superadmin">👑 SuperAdmin Global (CivicLoop Technologies)</option>
                </select>
              </div>

              {newRole === "tenant_admin" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Municipio / Tenant a Cargo</label>
                  <select
                    value={newTenantId}
                    onChange={(e) => setNewTenantId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
                  >
                    {tenantsList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs shadow"
                >
                  Confirmar Alta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
