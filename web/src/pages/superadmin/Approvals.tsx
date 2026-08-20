import { useEffect, useState } from "react";
import { ShieldAlert, CheckCircle, XCircle, MapPin, Clock } from "lucide-react";
import { SectionHeader } from "../../components/shared/SectionHeader";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Colores de contenedor consistentes con la app móvil
const CONTAINER_COLORS: Record<string, string> = {
  verde: "bg-green-500",
  azul: "bg-blue-500",
  amarillo: "bg-yellow-400",
  rojo: "bg-red-500",
  naranja: "bg-orange-500",
  gris: "bg-gray-400",
};

interface PendingPoint {
  id: string;
  name: string;
  type: string;
  color: string;
  address: string | null;
  latitude: number;
  longitude: number;
  is_active: boolean;
  tenant_id: string | null;
  created_at: string;
  // join con tenants
  tenants?: { name: string; type: string } | null;
}

export function Approvals() {
  const [points, setPoints] = useState<PendingPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchPendingPoints() {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from("recycling_points")
        .select("*, tenants(name, type)")
        .eq("is_approved", false)
        .order("created_at", { ascending: false });

      if (supabaseError) throw supabaseError;
      setPoints(data ?? []);
    } catch (e: any) {
      console.error("Error cargando puntos pendientes:", e);
      setError("No se pudieron cargar los puntos pendientes. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPendingPoints();
  }, []);

  async function handleApprove(id: string) {
    setProcessingId(id);
    try {
      const { error: supabaseError } = await supabase
        .from("recycling_points")
        .update({ is_approved: true })
        .eq("id", id);

      if (supabaseError) throw supabaseError;
      // Quitar el punto aprobado de la lista local de forma optimista
      setPoints((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      console.error("Error aprobando punto:", e);
      setError("Error al aprobar el punto. Intentá de nuevo.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: string) {
    setProcessingId(id);
    try {
      const { error: supabaseError } = await supabase
        .from("recycling_points")
        .delete()
        .eq("id", id);

      if (supabaseError) throw supabaseError;
      setPoints((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      console.error("Error rechazando punto:", e);
      setError("Error al rechazar el punto. Intentá de nuevo.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="p-6 md:p-8 h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          title="Puntos Pendientes de Aprobación"
          subtitle="Revisá, aprobá o rechazá los puntos enviados por los tenants."
          icon={ShieldAlert}
          iconBgColorClass="bg-[#3949AB]/10"
          iconColorClass="text-[#3949AB]"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPendingPoints}
          disabled={isLoading}
        >
          {isLoading ? "Actualizando..." : "↺ Actualizar"}
        </Button>
      </div>

      {/* Banner de error */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex-1 rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Punto</TableHead>
              <TableHead>Tipo / Color</TableHead>
              <TableHead>Entidad</TableHead>
              <TableHead>Coordenadas</TableHead>
              <TableHead>Enviado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton de carga
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : points.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                    <CheckCircle className="h-10 w-10 text-green-500 opacity-60" />
                    <p className="text-sm font-medium">
                      Todo al día — no hay puntos pendientes de aprobación.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              points.map((point) => {
                const isProcessing = processingId === point.id;
                const colorClass =
                  CONTAINER_COLORS[point.color?.toLowerCase()] ?? "bg-gray-400";
                const createdDate = new Date(point.created_at).toLocaleDateString(
                  "es-AR",
                  { day: "2-digit", month: "2-digit", year: "numeric" }
                );

                return (
                  <TableRow key={point.id} className={isProcessing ? "opacity-50" : ""}>
                    {/* Nombre y dirección */}
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-medium">{point.name}</p>
                          {point.address && (
                            <p className="text-xs text-muted-foreground">{point.address}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Tipo y color del contenedor */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit capitalize text-xs">
                          {point.type}
                        </Badge>
                        {point.color && (
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
                            <span className="text-xs text-muted-foreground capitalize">
                              {point.color}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Entidad / Tenant */}
                    <TableCell>
                      {point.tenants ? (
                        <div>
                          <p className="text-sm font-medium">{point.tenants.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {point.tenants.type}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Sin entidad
                        </span>
                      )}
                    </TableCell>

                    {/* Coordenadas */}
                    <TableCell>
                      <a
                        href={`https://maps.google.com/?q=${point.latitude},${point.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline font-mono"
                      >
                        {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                      </a>
                    </TableCell>

                    {/* Fecha */}
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {createdDate}
                      </div>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white gap-1"
                          onClick={() => handleApprove(point.id)}
                          disabled={isProcessing}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                          onClick={() => handleReject(point.id)}
                          disabled={isProcessing}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Rechazar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer con contador */}
      {!isLoading && points.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          {points.length} punto{points.length !== 1 ? "s" : ""} pendiente
          {points.length !== 1 ? "s" : ""} de aprobación
        </p>
      )}
    </div>
  );
}
