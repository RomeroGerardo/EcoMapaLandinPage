import { MapPin, Plus } from "lucide-react";
import { SectionHeader } from "../../components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { AddPointForm } from "../../components/shared/AddPointForm";
import { useAuthStore } from "@/store/useAuthStore";

export function MyPoints() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [points, setPoints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const activeTenant = useAuthStore((state) => state.activeTenant);

  async function fetchPoints() {
    setIsLoading(true);
    try {
      let query = supabase.from('recycling_points').select('*').order('created_at', { ascending: false });
      if (activeTenant?.id) {
        query = query.eq('tenant_id', activeTenant.id);
      }
      const { data, error } = await query;
      if (error) {
        console.error("Error fetching tenant points:", error);
      }
      if (data) setPoints(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPoints();
  }, []);

  return (
    <div className="p-6 md:p-8 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          title="Mis Puntos de Reciclaje"
          subtitle={`Puntos registrados para tu organización. Rol: ${activeTenant?.type || 'admin'}.`}
          icon={MapPin}
          iconBgColorClass="bg-green-600/10"
          iconColorClass="text-green-600"
        />
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Punto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Eco-Punto</DialogTitle>
              <DialogDescription>
                Añade un nuevo punto de recolección sustentable al mapa. Disponible para Municipios y Empresas Privadas.
              </DialogDescription>
            </DialogHeader>
            
              <AddPointForm onSuccess={() => { setIsModalOpen(false); fetchPoints(); }} />
            
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="mt-6 flex-1 bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : points.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <MapPin className="w-8 h-8 mb-2 opacity-20" />
            <p>No tienes puntos registrados aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo de Contenedor</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {points.map((point) => (
                  <TableRow key={point.id}>
                    <TableCell className="font-medium">{point.name}</TableCell>
                    <TableCell className="capitalize">{point.type}</TableCell>
                    <TableCell>{point.address || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${point.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {point.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
