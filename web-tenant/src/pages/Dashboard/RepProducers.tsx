import { useEffect, useState } from "react";
import { Factory, Plus, Mail, Globe, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Producer {
  id: string;
  name: string;
  category: string;
  logo_url: string | null;
  website: string | null;
  contact_email: string | null;
  description: string | null;
  created_at: string;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  pilas_baterias: { label: "Pilas & Baterías", color: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300" },
  agroquimicos: { label: "Envases Agroquímicos", color: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
  electronicos: { label: "Electrónicos & RAEEs", color: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" },
  neumaticos: { label: "Neumáticos Fuera de Uso", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
  envases: { label: "Envases y Embalajes", color: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300" },
};

export function RepProducers() {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("pilas_baterias");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function fetchProducers() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("producers")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setProducers(data ?? []);
    } catch (e) {
      console.error("Error al cargar productores REP:", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProducers();
  }, []);

  async function handleCreateProducer(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase.from("producers").insert([
        {
          name,
          category,
          contact_email: contactEmail || null,
          website: website || null,
          description: description || null,
        },
      ]);

      if (error) throw error;

      setIsModalOpen(false);
      setName("");
      setContactEmail("");
      setWebsite("");
      setDescription("");
      fetchProducers();
    } catch (e: any) {
      console.error("Error creando productor REP:", e);
      alert(e.message || "Error al registrar productor.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Factory className="h-6 w-6 text-primary" />
            Responsabilidad Extendida del Productor (REP)
          </h2>
          <p className="text-muted-foreground">
            Marcas y fabricantes comprometidos con la trazabilidad y disposición final de sus productos post-consumo.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground gap-2">
              <Plus className="h-4 w-4" />
              Adherir Marca / Fabricante
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Registrar Productor REP</DialogTitle>
              <DialogDescription>
                Incorpora una nueva empresa con programa oficial de recuperación de residuos especiales.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateProducer} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="p-name">Nombre de la Empresa o Marca</Label>
                <Input
                  id="p-name"
                  placeholder="Ej. Duracell Argentina / AgroClean"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="p-cat">Categoría de Residuo REP</Label>
                <select
                  id="p-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                >
                  <option value="pilas_baterias">Pilas & Baterías</option>
                  <option value="agroquimicos">Envases de Agroquímicos (Fitosanitarios)</option>
                  <option value="electronicos">Electrónicos & RAEEs</option>
                  <option value="neumaticos">Neumáticos Fuera de Uso (NFU)</option>
                  <option value="envases">Envases y Embalajes Generales</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="p-email">Email de Contacto</Label>
                  <Input
                    id="p-email"
                    type="email"
                    placeholder="reciclaje@empresa.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-web">Sitio Web</Label>
                  <Input
                    id="p-web"
                    placeholder="https://empresa.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="p-desc">Descripción del Programa de Recuperación</Label>
                <Textarea
                  id="p-desc"
                  placeholder="Detalles del proceso de neutralización o reciclaje certificado..."
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Guardando..." : "Guardar Productor"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 text-muted-foreground">
          <p className="font-semibold text-foreground">Cumplimiento Normativo y Trazabilidad</p>
          <p>
            Los puntos asociados a marcas REP aparecen destacados en la app móvil con un sello de <strong>Punto Oficial Certificado</strong>, permitiendo al vecino saber exactamente dónde dejar pilas, RAEEs o bidones fitosanitarios.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa / Marca</TableHead>
              <TableHead>Categoría de Residuo</TableHead>
              <TableHead>Programa de Recuperación</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Web</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Cargando directorio de productores REP...
                </TableCell>
              </TableRow>
            ) : producers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No hay productores registrados todavía.
                </TableCell>
              </TableRow>
            ) : (
              producers.map((p) => {
                const catInfo = CATEGORY_LABELS[p.category] || { label: p.category, color: "bg-muted text-foreground" };
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                          {p.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold">{p.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${catInfo.color}`}>
                        {catInfo.label}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {p.description || "Sin descripción cargada."}
                      </span>
                    </TableCell>

                    <TableCell>
                      {p.contact_email ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {p.contact_email}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">N/A</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {p.website ? (
                        <a
                          href={p.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <Globe className="h-3 w-3" />
                          Visitar
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
