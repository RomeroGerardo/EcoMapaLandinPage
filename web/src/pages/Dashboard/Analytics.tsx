import { useEffect, useState } from "react";
import { Brain, MessageSquare, Zap, Sparkles, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/lib/supabase";

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function getLast7Days(): { label: string; iso: string }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label: DAY_NAMES[d.getDay()],
      iso: d.toISOString().slice(0, 10),
    };
  });
}

interface AnalyticsStats {
  totalQueries: number;
  avgResponseTimeMs: number;
  totalEcopointsAwarded: number;
  activePointsCount: number;
}

interface InteractionDataPoint {
  name: string;
  consultas: number;
}

interface CategoryTopic {
  name: string;
  valor: number;
}

export function Analytics() {
  const [stats, setStats] = useState<AnalyticsStats>({
    totalQueries: 0,
    avgResponseTimeMs: 0,
    totalEcopointsAwarded: 0,
    activePointsCount: 0,
  });
  const [interactionData, setInteractionData] = useState<InteractionDataPoint[]>([]);
  const [topicsData, setTopicsData] = useState<CategoryTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Obtener todas las consultas de IA
        const { data: logs, error: logsError } = await supabase
          .from('ai_queries_log')
          .select('*')
          .order('created_at', { ascending: false });

        if (logsError) throw logsError;

        // 2. Obtener total de puntos activos
        const { count: pointsCount, error: pointsError } = await supabase
          .from('recycling_points')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        if (pointsError) throw pointsError;

        const totalQueries = logs?.length ?? 0;
        const totalTime = logs?.reduce((acc, curr) => acc + (curr.response_time_ms || 400), 0) ?? 0;
        const avgResponseTimeMs = totalQueries > 0 ? Math.round(totalTime / totalQueries) : 0;
        const totalEcopointsAwarded = logs?.reduce((acc, curr) => acc + (curr.ecopoints_awarded || 20), 0) ?? 0;

        setStats({
          totalQueries,
          avgResponseTimeMs,
          totalEcopointsAwarded,
          activePointsCount: pointsCount ?? 0,
        });

        // 3. Agrupar interacciones por los últimos 7 días
        const last7 = getLast7Days();
        const countByDay: Record<string, number> = {};
        last7.forEach(d => { countByDay[d.iso] = 0; });

        logs?.forEach(item => {
          const dayIso = item.created_at.slice(0, 10);
          if (dayIso in countByDay) {
            countByDay[dayIso]++;
          }
        });

        setInteractionData(
          last7.map(d => ({
            name: d.label,
            consultas: countByDay[d.iso],
          }))
        );

        // 4. Agrupar categorías más consultadas
        const categoryCount: Record<string, number> = {};
        logs?.forEach(item => {
          const cat = item.waste_category || 'Otros';
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });

        const sortedTopics = Object.entries(categoryCount)
          .map(([name, valor]) => ({ name, valor }))
          .sort((a, b) => b.valor - a.valor)
          .slice(0, 5);

        // Fallback si hay pocos datos
        setTopicsData(
          sortedTopics.length > 0
            ? sortedTopics
            : [
                { name: 'Plásticos & PET', valor: 1 },
                { name: 'Pilas / Baterías', valor: 1 },
                { name: 'Vidrio', valor: 1 },
              ]
        );
      } catch (err: any) {
        console.error("Error al cargar analíticas:", err);
        setError("No se pudieron cargar las métricas en tiempo real.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Métricas de Inteligencia Artificial</h2>
          <p className="text-muted-foreground">
            Telemetría en tiempo real sobre el motor de clasificación y consultas ciudadanas.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ── Metric Cards ──────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Consultas Totales IA</CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.totalQueries.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Procesadas por Groq Llama 3</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Tiempo de Respuesta</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : `${(stats.avgResponseTimeMs / 1000).toFixed(2)}s`}
            </div>
            <p className="text-xs text-muted-foreground">Latencia promedio Edge Function</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Ecopuntos Asignados</CardTitle>
            <Award className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {isLoading ? "..." : `+${stats.totalEcopointsAwarded.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">Incentivos de reciclaje generados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Puntos en Red</CardTitle>
            <Brain className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.activePointsCount}
            </div>
            <p className="text-xs text-muted-foreground">Contenedores geolocalizados</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Grid ───────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Interacciones Diarias
            </CardTitle>
            <CardDescription>Volumen de chats procesados durante los últimos 7 días.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={interactionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConsultas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: any) => [v ?? 0, 'Consultas IA']}
                />
                <Area type="monotone" dataKey="consultas" stroke="#16a34a" fillOpacity={1} fill="url(#colorConsultas)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Residuos más Consultados</CardTitle>
            <CardDescription>Categorías con mayor frecuencia de consulta por ciudadanos.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topicsData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#374151', fontSize: 12}} width={120} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  formatter={(v: any) => [v ?? 0, 'Consultas']}
                />
                <Bar dataKey="valor" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
