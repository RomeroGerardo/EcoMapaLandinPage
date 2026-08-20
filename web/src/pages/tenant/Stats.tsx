import { BarChart3, MapPin, Award, TrendingUp } from "lucide-react";
import { SectionHeader } from "../../components/shared/SectionHeader";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Stats() {
  const activeTenant = useAuthStore((state) => state.activeTenant);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!activeTenant) return;
      setIsLoading(true);
      try {
        const { count, error } = await supabase
          .from('recycling_points')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', activeTenant.id);
        
        if (!error && count !== null) {
          setTotalPoints(count);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, [activeTenant]);

  return (
    <div className="p-6 md:p-8 space-y-6 h-full">
      <SectionHeader
        title="Estadísticas de Impacto"
        subtitle={`Rendimiento y puntos registrados por ${activeTenant?.name || 'tu organización'}.`}
        icon={BarChart3}
        iconBgColorClass="bg-blue-600/10"
        iconColorClass="text-blue-600"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Puntos Activos (Totales)</CardTitle>
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : totalPoints}
            </div>
            <p className="text-xs text-muted-foreground">Contenedores registrados en el mapa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Nivel de Contribución</CardTitle>
            <Award className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPoints >= 10 ? "Platino" : totalPoints >= 5 ? "Oro" : totalPoints > 0 ? "Plata" : "Inicial"}
            </div>
            <p className="text-xs text-muted-foreground">Basado en tu infraestructura aportada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Ciudadanos Alcanzados</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : `+${totalPoints * 120}`}
            </div>
            <p className="text-xs text-muted-foreground">Estimación de alcance mensual</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
