import { useEffect, useState } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { BentoGrid, BentoGridItem } from '../../components/ui/BentoGrid';
import { MapPin, Building2, Clock, CheckCircle, TrendingUp, Sparkles } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { supabase } from '@/lib/supabase';

// ── Tipos ────────────────────────────────────────────────────
interface Stats {
  approvedPoints: number;
  pendingPoints: number;
  totalTenants: number;
  activeTenants: number;
}

interface DailyPoint {
  name: string;   // "Lun", "Mar", etc.
  puntos: number; // cantidad de puntos creados ese día
}

// ── Helpers ──────────────────────────────────────────────────
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/** Devuelve los últimos 7 días como etiquetas cortas ordenados del más viejo al más nuevo. */
function getLast7Days(): { label: string; iso: string }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label: DAY_NAMES[d.getDay()],
      iso: d.toISOString().slice(0, 10), // "YYYY-MM-DD"
    };
  });
}

// ── Skeleton para StatCards ──────────────────────────────────
function StatSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 animate-pulse">
      <div className="h-3 w-28 bg-muted rounded mb-4" />
      <div className="h-8 w-20 bg-muted rounded mb-2" />
      <div className="h-3 w-36 bg-muted rounded" />
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────
export function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<DailyPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        // ── 1. Contar puntos aprobados y pendientes ──────────
        const { data: pointCounts, error: pointsErr } = await supabase
          .from('recycling_points')
          .select('is_approved');
        if (pointsErr) throw pointsErr;

        const approvedPoints = pointCounts?.filter(p => p.is_approved).length ?? 0;
        const pendingPoints  = pointCounts?.filter(p => !p.is_approved).length ?? 0;

        // ── 2. Contar tenants ────────────────────────────────
        const { data: tenantData, error: tenantsErr } = await supabase
          .from('tenants')
          .select('subscription_status');
        if (tenantsErr) throw tenantsErr;

        const totalTenants  = tenantData?.length ?? 0;
        const activeTenants = tenantData?.filter(t => t.subscription_status === 'active').length ?? 0;

        setStats({ approvedPoints, pendingPoints, totalTenants, activeTenants });

        // ── 3. Puntos creados por día (últimos 7 días) ───────
        const last7 = getLast7Days();
        const since = last7[0].iso + 'T00:00:00Z';

        const { data: recentPoints, error: recentErr } = await supabase
          .from('recycling_points')
          .select('created_at')
          .gte('created_at', since);
        if (recentErr) throw recentErr;

        // Agrupar por día
        const countByDay: Record<string, number> = {};
        last7.forEach(d => { countByDay[d.iso] = 0; });
        recentPoints?.forEach(p => {
          const day = p.created_at.slice(0, 10);
          if (day in countByDay) countByDay[day]++;
        });

        setChartData(
          last7.map(d => ({ name: d.label, puntos: countByDay[d.iso] }))
        );
      } catch (e: any) {
        console.error('Error cargando Overview:', e);
        setError('No se pudieron cargar los datos. Intentá recargar la página.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido de vuelta. Aquí tenés el resumen en tiempo real.
        </p>
      </div>

      {/* Banner de error */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ── StatCards ─────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Puntos Aprobados"
              value={stats?.approvedPoints ?? 0}
              description="visibles en la app móvil"
              icon={<CheckCircle />}
            />
            <StatCard
              title="Puntos Pendientes"
              value={stats?.pendingPoints ?? 0}
              description="requieren revisión"
              icon={<Clock />}
              className={
                (stats?.pendingPoints ?? 0) > 0
                  ? 'border-yellow-500/40 bg-yellow-500/5'
                  : ''
              }
            />
            <StatCard
              title="Tenants Activos"
              value={stats?.activeTenants ?? 0}
              description={`de ${stats?.totalTenants ?? 0} entidades totales`}
              icon={<Building2 />}
            />
            <StatCard
              title="Puntos en el Mapa"
              value={stats?.approvedPoints ?? 0}
              description="puntos de reciclaje activos"
              icon={<MapPin />}
            />
          </>
        )}
      </div>

      {/* ── BentoGrid ─────────────────────────────────────── */}
      <BentoGrid className="max-w-full">

        {/* Gráfico: puntos creados por día */}
        <BentoGridItem
          className="md:col-span-2"
          title="Puntos Registrados por Día"
          description="Nuevos eco-puntos enviados por tenants en los últimos 7 días."
          header={
            <div className="h-full min-h-[12rem] w-full mt-4">
              {isLoading ? (
                <div className="h-full w-full animate-pulse rounded-lg bg-muted" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPuntos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(v: any) => [v ?? 0, 'Puntos registrados']}
                    />
                    <Area
                      type="monotone"
                      dataKey="puntos"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPuntos)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          }
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
        />

        {/* AI Insights — cualitativo, sin datos de DB aún */}
        <BentoGridItem
          className="md:col-span-1 bg-gradient-to-br from-primary/10 to-transparent border-primary/20"
          title="AI Insights"
          description="Análisis automático de patrones de usuarios."
          header={
            <div className="flex flex-col gap-3 mt-4">
              <div className="rounded-lg bg-card/50 p-3 text-sm border border-border/50">
                <p className="font-medium mb-1 flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-primary" /> Tendencia detectada
                </p>
                <p className="text-muted-foreground text-xs">
                  {(stats?.pendingPoints ?? 0) > 0
                    ? `Hay ${stats?.pendingPoints} punto${stats!.pendingPoints !== 1 ? 's' : ''} pendiente${stats!.pendingPoints !== 1 ? 's' : ''} de aprobación.`
                    : 'Todos los puntos enviados están aprobados. ¡Excelente gestión!'}
                </p>
              </div>
              <div className="rounded-lg bg-card/50 p-3 text-sm border border-border/50">
                <p className="font-medium mb-1 flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-primary" /> Cobertura de tenants
                </p>
                <p className="text-muted-foreground text-xs">
                  {stats
                    ? `${stats.activeTenants} de ${stats.totalTenants} entidad${stats.totalTenants !== 1 ? 'es' : ''} activa${stats.activeTenants !== 1 ? 's' : ''}. Cada tenant activo aporta puntos al mapa.`
                    : 'Cargando datos...'}
                </p>
              </div>
            </div>
          }
          icon={<Sparkles className="h-4 w-4 text-primary" />}
        />
      </BentoGrid>
    </div>
  );
}
