import React from "react";
import { Activity, Database, Sparkles, RefreshCw, UserCheck } from "lucide-react";

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const SuperAdminHeader: React.FC<HeaderProps> = ({ onRefresh, isRefreshing }) => {
  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 z-20">
      {/* Telemetría rápida de servicios */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-slate-300 font-medium">Groq LLM:</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            GPT-OSS-120B (OK)
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
          <Database className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-slate-300 font-medium">Supabase:</span>
          <span className="inline-flex items-center gap-1 text-blue-400 font-semibold font-mono">
            Postgres 17 + PostGIS
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
          <Activity className="h-3.5 w-3.5 text-purple-400" />
          <span className="text-slate-300 font-medium">Latencia Media:</span>
          <span className="text-purple-300 font-mono font-semibold">~2.2s</span>
        </div>
      </div>

      {/* Acciones & Perfil */}
      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            title="Sincronizar métricas consolidadas"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        )}

        <div className="h-6 w-px bg-slate-800" />

        <div className="flex items-center gap-2.5 pl-1">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md border border-purple-400/30">
            <UserCheck className="h-4 w-4" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-tight">SuperAdmin Romero</p>
            <p className="text-[10px] text-emerald-400 font-mono leading-tight">root@ecomapa.org</p>
          </div>
        </div>
      </div>
    </header>
  );
};
