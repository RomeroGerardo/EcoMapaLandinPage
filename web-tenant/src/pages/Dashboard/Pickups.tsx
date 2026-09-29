import { useEffect, useState } from "react";
import { Truck, CheckCircle2, Clock, MapPin, Phone, User, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PickupRequest {
  id: string;
  user_name: string;
  user_phone: string;
  waste_type: string;
  estimated_volume: string;
  notes: string | null;
  address: string;
  latitude: number;
  longitude: number;
  preferred_date: string;
  preferred_time_slot: string;
  status: "pendiente" | "asignado" | "en_camino" | "completado" | "cancelado";
  assigned_collector: string | null;
  created_at: string;
}

const STATUS_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  pendiente: { label: "Pendiente", variant: "outline", className: "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/20" },
  asignado: { label: "Asignado", variant: "secondary", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  en_camino: { label: "En Camino", variant: "default", className: "bg-purple-600 hover:bg-purple-700 text-white" },
  completado: { label: "Completado", variant: "default", className: "bg-green-600 hover:bg-green-700 text-white" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

const WASTE_TYPE_LABELS: Record<string, string> = {
  muebles: "Muebles & Madera",
  escombros: "Escombros & Obra",
  electrodomesticos_grandes: "Electrodomésticos / Línea Blanca",
  madera_poda: "Ramas & Restos de Poda",
  chatarra: "Chatarra & Metales Pesados",
};

export function Pickups() {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [collectorName, setCollectorName] = useState("");
  const [newStatus, setNewStatus] = useState<string>("asignado");
  const [isSaving, setIsSaving] = useState(false);

  async function fetchPickups() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("pickup_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data ?? []);
    } catch (e) {
      console.error("Error al cargar retiros:", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPickups();
  }, []);

  async function handleUpdateStatus() {
    if (!selectedRequest) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("pickup_requests")
        .update({
          status: newStatus,
          assigned_collector: collectorName || selectedRequest.assigned_collector,
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      setIsAssignModalOpen(false);
      fetchPickups();
    } catch (e) {
      console.error("Error actualizando retiro:", e);
      alert("Error al actualizar la solicitud.");
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
            <Truck className="h-6 w-6 text-primary" />
            Retiros a Domicilio (Residuos Voluminosos)
          </h2>
          <p className="text-muted-foreground">
            Gestión logística para retiro de muebles, escombros y chatarra no transportable por vecinos.
          </p>
        </div>
        <Button onClick={fetchPickups} variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? "Cargando..." : "↺ Actualizar"}
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium uppercase">Pendientes</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {requests.filter((r) => r.status === "pendiente").length}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium uppercase">En Gestión</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {requests.filter((r) => r.status === "asignado" || r.status === "en_camino").length}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium uppercase">Completados</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {requests.filter((r) => r.status === "completado").length}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium uppercase">Total Solicitudes</p>
          <p className="text-2xl font-bold text-foreground mt-1">{requests.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ciudadano</TableHead>
              <TableHead>Tipo de Residuo / Volumen</TableHead>
              <TableHead>Dirección & Mapa</TableHead>
              <TableHead>Fecha / Franja</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Recolector</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Cargando solicitudes de retiro...
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-green-500/60" />
                    <span>No hay solicitudes de retiro registradas.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((item) => {
                const badgeInfo = STATUS_BADGES[item.status] || STATUS_BADGES.pendiente;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {item.user_name}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" />
                          {item.user_phone}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm">
                          {WASTE_TYPE_LABELS[item.waste_type] || item.waste_type}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          Volumen: {item.estimated_volume}
                        </span>
                        {item.notes && (
                          <span className="text-[11px] italic text-muted-foreground line-clamp-1">
                            "{item.notes}"
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium flex items-start gap-1">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          {item.address}
                        </span>
                        <a
                          href={`https://maps.google.com/?q=${item.latitude},${item.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-primary hover:underline ml-4 mt-0.5"
                        >
                          Ver ubicación GPS
                        </a>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {item.preferred_date}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground capitalize mt-0.5">
                          <Clock className="h-3 w-3" />
                          Turno {item.preferred_time_slot}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={badgeInfo.variant} className={badgeInfo.className}>
                        {badgeInfo.label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {item.assigned_collector || "Sin asignar"}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(item);
                          setCollectorName(item.assigned_collector || "");
                          setNewStatus(item.status);
                          setIsAssignModalOpen(true);
                        }}
                      >
                        Gestionar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Asignación y Cambio de Estado */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Gestionar Retiro a Domicilio</DialogTitle>
            <DialogDescription>
              Asigna una cuadrilla o cooperativa y actualiza el estado del retiro.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1">
                <p><strong>Solicitante:</strong> {selectedRequest.user_name} ({selectedRequest.user_phone})</p>
                <p><strong>Dirección:</strong> {selectedRequest.address}</p>
                <p><strong>Material:</strong> {WASTE_TYPE_LABELS[selectedRequest.waste_type] || selectedRequest.waste_type} - {selectedRequest.estimated_volume}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado del Retiro</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="asignado">Asignado a Cuadrilla</SelectItem>
                    <SelectItem value="en_camino">En Camino / En Recorrido</SelectItem>
                    <SelectItem value="completado">Completado y Retirado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="collector">Cuadrilla / Cooperativa Asignada</Label>
                <Input
                  id="collector"
                  placeholder="Ej. Cooperativa Los Carreros / Móvil 04"
                  value={collectorName}
                  onChange={(e) => setCollectorName(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateStatus} disabled={isSaving}>
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
