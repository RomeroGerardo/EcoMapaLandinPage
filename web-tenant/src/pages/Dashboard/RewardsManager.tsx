import { useEffect, useState } from "react";
import { Gift, Plus, Store, Sparkles, Award } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RewardItem {
  id: string;
  title: string;
  partner_name: string;
  category: string;
  description: string;
  ecopoints_cost: number;
  discount_percentage: number | null;
  stock: number;
  is_active: boolean;
  created_at: string;
}

interface ClaimItem {
  id: string;
  coupon_code: string;
  user_id: string;
  status: string;
  points_spent: number;
  claimed_at: string;
  rewards?: { title: string; partner_name: string } | null;
}

export function RewardsManager() {
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [category, setCategory] = useState("descuento");
  const [description, setDescription] = useState("");
  const [ecopointsCost, setEcopointsCost] = useState(100);
  const [discountPercentage, setDiscountPercentage] = useState<number | undefined>(15);
  const [stock, setStock] = useState(50);
  const [isSaving, setIsSaving] = useState(false);

  async function fetchRewards() {
    setIsLoading(true);
    try {
      const { data: rewardsData, error: rErr } = await supabase
        .from("rewards")
        .select("*")
        .order("created_at", { ascending: false });

      if (rErr) throw rErr;
      setRewards(rewardsData ?? []);

      const { data: claimsData, error: cErr } = await supabase
        .from("reward_claims")
        .select("*, rewards(title, partner_name)")
        .order("claimed_at", { ascending: false })
        .limit(20);

      if (cErr) throw cErr;
      setClaims(claimsData ?? []);
    } catch (e) {
      console.error("Error al cargar recompensas:", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchRewards();
  }, []);

  async function handleCreateReward(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase.from("rewards").insert([
        {
          title,
          partner_name: partnerName,
          category,
          description,
          ecopoints_cost: ecopointsCost,
          discount_percentage: discountPercentage || null,
          stock,
          is_active: true,
        },
      ]);

      if (error) throw error;

      setIsCreateModalOpen(false);
      // Reset form
      setTitle("");
      setPartnerName("");
      setDescription("");
      setEcopointsCost(100);
      setDiscountPercentage(15);
      setStock(50);
      fetchRewards();
    } catch (e: any) {
      console.error("Error creando recompensa:", e);
      alert(e.message || "Error al crear beneficio.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            Catálogo de Recompensas & Cupones (B2B)
          </h2>
          <p className="text-muted-foreground">
            Alianzas con comercios y supermercados adheridos que canjean Ecopuntos por beneficios reales.
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Beneficio / Alianza
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Recompensa B2B</DialogTitle>
              <DialogDescription>
                Publica un nuevo cupón o descuento patrocinado por un comercio adherido.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateReward} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="r-title">Título del Beneficio</Label>
                <Input
                  id="r-title"
                  placeholder="Ej. 20% de Descuento en Verduras Orgánicas"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="r-partner">Comercio / Empresa</Label>
                  <Input
                    id="r-partner"
                    placeholder="Ej. Supermercado BioCórdoba"
                    required
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="r-cat">Tipo de Beneficio</Label>
                  <select
                    id="r-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                  >
                    <option value="descuento">Descuento (%)</option>
                    <option value="producto">Producto Gratis</option>
                    <option value="servicio">Voucher / Servicio</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="r-desc">Descripción & Condiciones</Label>
                <Textarea
                  id="r-desc"
                  placeholder="Válido en sucursales adheridas presentando el código digital de EcoMapa."
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="r-cost">Costo (Ecopuntos)</Label>
                  <Input
                    id="r-cost"
                    type="number"
                    min={10}
                    required
                    value={ecopointsCost}
                    onChange={(e) => setEcopointsCost(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="r-disc">% Descuento</Label>
                  <Input
                    id="r-disc"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Opcional"
                    value={discountPercentage ?? ""}
                    onChange={(e) => setDiscountPercentage(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="r-stock">Stock Cupones</Label>
                  <Input
                    id="r-stock"
                    type="number"
                    min={1}
                    required
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Guardando..." : "Publicar Recompensa"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rewards Catalog Table */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold tracking-tight">Beneficios Publicados</h3>
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Beneficio</TableHead>
                <TableHead>Comercio Aliado</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Costo Ecopuntos</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Cargando catálogo de recompensas...
                  </TableCell>
                </TableRow>
              ) : rewards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No hay beneficios activos en este momento.
                  </TableCell>
                </TableRow>
              ) : (
                rewards.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">{r.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">{r.description}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-medium flex items-center gap-1.5 text-sm">
                        <Store className="h-3.5 w-3.5 text-muted-foreground" />
                        {r.partner_name}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">
                        {r.category}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="font-bold text-primary flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        {r.ecopoints_cost} pts
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-mono">{r.stock} disponibles</span>
                    </TableCell>

                    <TableCell>
                      <Badge variant={r.is_active ? "default" : "secondary"} className={r.is_active ? "bg-green-600 text-white" : ""}>
                        {r.is_active ? "Activo" : "Pausado"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Recent Claims Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          Últimos Canjes Realizados por Usuarios
        </h3>
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código de Cupón</TableHead>
                <TableHead>Beneficio / Comercio</TableHead>
                <TableHead>Puntos Canjeados</TableHead>
                <TableHead>Fecha de Canje</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Aún no se han registrado canjes de cupones.
                  </TableCell>
                </TableRow>
              ) : (
                claims.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <span className="font-mono font-bold text-xs bg-muted px-2 py-1 rounded">
                        {c.coupon_code}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="font-medium">{c.rewards?.title || "Recompensa"}</span>
                        <span className="text-muted-foreground">{c.rewards?.partner_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-primary">-{c.points_spent} pts</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.claimed_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">
                        {c.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
