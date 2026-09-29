import { useEffect, useState } from "react";
import { 
  Building2, 
  Plus, 
  CheckCircle2, 
  PauseCircle, 
  Search, 
  Crown
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TenantItem {
  id: string;
  name: string;
  type: string;
  subscription_tier: string;
  subscription_status: string;
  subscription_end_date?: string | null;
  created_at: string;
}

export function Tenants() {
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState("municipality");
  const [tier, setTier] = useState("pro");
  const [status, setStatus] = useState("active");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTenants = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTenants(data as TenantItem[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase.from("tenants").insert([
      {
        name: name.trim(),
        type,
        subscription_tier: tier,
        subscription_status: status,
      },
    ]);

    if (!error) {
      setName("");
      setIsCreateModalOpen(false);
      fetchTenants();
    }
    setIsSubmitting(false);
  };

  const handleToggleStatus = async (tenantId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "paused" : "active";
    await supabase.from("tenants").update({ subscription_status: nextStatus }).eq("id", tenantId);
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, subscription_status: nextStatus } : t))
    );
  };

  const handleChangeTier = async (tenantId: string, nextTier: string) => {
    await supabase.from("tenants").update({ subscription_tier: nextTier }).eq("id", tenantId);
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, subscription_tier: nextTier } : t))
    );
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.type.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-bold flex items-center gap-1">
              <Crown className="h-3 w-3" /> Panel Superadmin Exclusivo · Romero Labs
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 mt-1">
            <Building2 className="h-6 w-6 text-primary" />
            Gestión de Entidades & Suscripciones SaaS
          </h2>
          <p className="text-muted-foreground text-sm">
            Control central de municipios, comercios aliados y estado de facturación.
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground gap-2">
              <Plus className="h-4 w-4" />
              Nueva Entidad / Municipio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Entidad</DialogTitle>
              <DialogDescription>
                Crea un nuevo municipio o empresa asociada para habilitar su acceso en la plataforma.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateTenant} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="t-name">Nombre de la Entidad o Municipio</Label>
                <Input
                  id="t-name"
                  placeholder="Ej. Municipalidad de Villa Carlos Paz"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="t-type">Tipo de Entidad</Label>
                  <select
                    id="t-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors text-foreground"
                  >
                    <option value="municipality">Municipio (B2G)</option>
                    <option value="business">Empresa / Comercio (B2B)</option>
                    <option value="cooperative">Cooperativa de Recicladores</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="t-tier">Plan / Tier SaaS</Label>
                  <select
                    id="t-tier"
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors text-foreground"
                  >
                    <option value="basic">Básico / Free</option>
                    <option value="pro">Pro (B2G Estándar)</option>
                    <option value="enterprise">Enterprise (Ilimitado)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="t-status">Estado Inicial</Label>
                <select
                  id="t-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors text-foreground"
                >
                  <option value="active">Activo / Al día</option>
                  <option value="trial">Periodo de Prueba (Trial)</option>
                  <option value="paused">Pausado / Suspendido</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground">
                  {isSubmitting ? "Registrando..." : "Crear Entidad"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Total Entidades</p>
          <p className="text-2xl font-bold text-foreground">{tenants.length}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Suscripciones Activas</p>
          <p className="text-2xl font-bold text-emerald-600">
            {tenants.filter((t) => t.subscription_status === "active").length}
          </p>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Planes Pro / Enterprise</p>
          <p className="text-2xl font-bold text-purple-600">
            {tenants.filter((t) => t.subscription_tier === "pro" || t.subscription_tier === "enterprise").length}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar entidad por nombre..."
            className="pl-9"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Tenants Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entidad / Municipio</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Plan SaaS</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Alta</TableHead>
              <TableHead className="text-right">Acciones de Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Cargando entidades registradas...
                </TableCell>
              </TableRow>
            ) : filteredTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No se encontraron entidades.
                </TableCell>
              </TableRow>
            ) : (
              filteredTenants.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-semibold text-foreground">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {t.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-xs">
                      {t.type === "municipality" ? "🏛️ Municipio" : t.type === "business" ? "🏢 Comercio" : "🤝 Cooperativa"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <select
                      value={t.subscription_tier || "basic"}
                      onChange={(e) => handleChangeTier(t.id, e.target.value)}
                      className="text-xs rounded-md border border-input bg-background px-2 py-1 font-semibold text-foreground"
                    >
                      <option value="basic">Basic (Free)</option>
                      <option value="pro">Pro (B2G)</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        t.subscription_status === "active"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 border-amber-500/30"
                      }
                    >
                      {t.subscription_status === "active" ? "🟢 Activa" : "⏸️ Pausada"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(t.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(t.id, t.subscription_status)}
                      className="text-xs gap-1.5"
                    >
                      {t.subscription_status === "active" ? (
                        <>
                          <PauseCircle className="h-3.5 w-3.5 text-amber-500" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          Reactivar
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
