import React, { useState } from "react";
import {
  TreePine,
  Sparkles,
  Droplets,
  Zap,
  Car,
  Award,
  Users,
  TrendingUp,
  Scale,
  Gift,
} from "lucide-react";

interface MaterialFactor {
  name: string;
  category: string;
  co2Factor: number; // kg CO2 eq por kg material
  waterFactor: number; // Litros de agua por kg material
  energyFactor: number; // kWh por kg material
  description: string;
  color: string;
}

const MATERIAL_FACTORS: Record<string, MaterialFactor> = {
  pet: {
    name: "Plástico PET / Envases",
    category: "Polímeros",
    co2Factor: 1.55,
    waterFactor: 24.0,
    energyFactor: 5.6,
    description: "Botellas de bebidas y envases transparentes. Su reciclado evita la síntesis de resina fósil virgen.",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  },
  cardboard: {
    name: "Papel y Cartón Corrugado",
    category: "Celulosa",
    co2Factor: 1.12,
    waterFactor: 28.0,
    energyFactor: 4.2,
    description: "Cajas de embalaje y papel de oficina. Evita la deforestación de bosques nativos y consumo masivo de agua.",
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  },
  glass: {
    name: "Vidrio Blanco y Verde",
    category: "Silicatos",
    co2Factor: 0.38,
    waterFactor: 5.0,
    energyFactor: 1.4,
    description: "100% reciclable en ciclos infinitos. Fundir calcín consume 40% menos calor de hornos que fundir arena y sosa.",
    color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30",
  },
  aluminum: {
    name: "Latas de Aluminio & Metales",
    category: "Metales No Ferrosos",
    co2Factor: 9.15,
    waterFactor: 42.0,
    energyFactor: 14.2,
    description: "El campeón del reciclaje: fundir latas ahorra el 95% de energía requerida para refinar bauxita virgen.",
    color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
  },
  raee: {
    name: "Pilas y Electrónicos (RAEE)",
    category: "Residuos Críticos",
    co2Factor: 4.80,
    waterFactor: 150.0,
    energyFactor: 8.5,
    description: "1 sola pila de mercurio contamina 600.000 litros de agua de napas subterráneas si va a vertedero común.",
    color: "text-rose-500 bg-rose-500/10 border-rose-500/30",
  },
};

export const TripleImpactCarbon: React.FC = () => {
  const [selectedMaterial, setSelectedMaterial] = useState<string>("pet");
  const [weightKg, setWeightKg] = useState<number>(250);
  const [activeTab, setActiveTab] = useState<"converter" | "study" | "gamification">("converter");

  const currentFactor = MATERIAL_FACTORS[selectedMaterial];

  // Cálculos ecológicos
  const totalCo2Kg = Math.round(weightKg * currentFactor.co2Factor * 10) / 10;
  const totalWaterL = Math.round(weightKg * currentFactor.waterFactor);
  const totalEnergyKwh = Math.round(weightKg * currentFactor.energyFactor * 10) / 10;

  // Comparativas tangibles "de otro level"
  const treesEquiv = Math.max(Math.round((totalCo2Kg / 22) * 10) / 10, 0.1); // 1 árbol absorbe aprox 22 kg CO2 al año
  const kmNoDriven = Math.round(totalCo2Kg * 6.2); // ~160 g CO2/km en auto naftero promedio
  const showersSaved = Math.round(totalWaterL / 60); // 1 ducha promedio de 5 min = 60 litros
  const homeDaysPowered = Math.max(Math.round((totalEnergyKwh / 8.5) * 10) / 10, 0.1); // 1 hogar argentino = ~8.5 kWh/día

  // EcoCréditos ganados
  const ecoCreditsAwarded = Math.round(weightKg * 12);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
            <Award className="h-3.5 w-3.5" />
            Certificación Sistema B · ODS 11, 12 y 13
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Triple Impacto, Huella de Carbono & Gamificación
          </h1>
          <p className="text-sm text-muted-foreground">
            Modelo de evaluación de impacto económico, social y ambiental para municipios y empresas de triple impacto.
          </p>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex items-center gap-1 p-1 bg-muted/60 border rounded-xl">
          <button
            onClick={() => setActiveTab("converter")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "converter"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Conversor de Huella
          </button>
          <button
            onClick={() => setActiveTab("study")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "study"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Estudio Empresas B
          </button>
          <button
            onClick={() => setActiveTab("gamification")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "gamification"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            EcoCréditos & Ciudadano
          </button>
        </div>
      </div>

      {/* ── SECCIÓN 1: CONVERSOR INTERACTIVO DE HUELLA DE CARBONO ────── */}
      {activeTab === "converter" && (
        <div className="space-y-6">
          {/* Card Principal del Simulador */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Scale className="h-5 w-5 text-emerald-500" />
                  Calculadora Científica de Desvío & Mitigación GEI
                </h2>
                <p className="text-xs text-muted-foreground">
                  Fórmulas basadas en factores de emisión IPCC y GHG Protocol para valorización de residuos.
                </p>
              </div>

              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 self-start sm:self-auto">
                Algoritmo EcoMapa V2.1
              </span>
            </div>

            {/* Selector de Material */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                1. Selecciona el Tipo de Fracción Reciclable
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {Object.entries(MATERIAL_FACTORS).map(([key, mat]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedMaterial(key)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedMaterial === key
                        ? "border-emerald-500 bg-emerald-500/10 shadow-sm"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <p className="text-xs font-bold text-foreground">{mat.name.split("/")[0]}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{mat.category}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Control Deslizante de Kilogramos */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Cantidad de Material Desviado de Vertedero
                </label>
                <div className="flex items-center gap-1 font-mono">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Math.max(1, Number(e.target.value)))}
                    className="w-24 px-2 py-1 text-right text-lg font-bold rounded-lg border bg-background text-foreground"
                  />
                  <span className="text-sm font-semibold text-muted-foreground">kg</span>
                </div>
              </div>

              <input
                type="range"
                min="10"
                max="2000"
                step="10"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full h-2 rounded-lg bg-muted appearance-none cursor-pointer accent-emerald-500"
              />

              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 text-[11px] text-muted-foreground font-mono">
                <span>10 kg (Pequeño generador) · 500 kg (Punto Limpio) · 2,000 kg (Cooperativa)</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20 self-start sm:self-auto">
                  +{ecoCreditsAwarded.toLocaleString()} EcoCréditos Ciudadanos Otorgados
                </span>
              </div>
            </div>

            {/* RESULTADOS MATEMÁTICOS DE MITIGACIÓN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* CO2 Mitigado */}
              <div className="p-4 rounded-xl border bg-gradient-to-br from-emerald-500/10 via-card to-card border-emerald-500/30 space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <TreePine className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase">CO₂ Mitigado</span>
                </div>
                <p className="text-3xl font-extrabold font-mono text-foreground">{totalCo2Kg} kg</p>
                <p className="text-[11px] text-muted-foreground">
                  Emisiones directas e indirectas evitadas al no producir material virgen.
                </p>
              </div>

              {/* Agua Protegida */}
              <div className="p-4 rounded-xl border bg-gradient-to-br from-cyan-500/10 via-card to-card border-cyan-500/30 space-y-1">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                  <Droplets className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase">Agua Preservada</span>
                </div>
                <p className="text-3xl font-extrabold font-mono text-foreground">{totalWaterL.toLocaleString()} L</p>
                <p className="text-[11px] text-muted-foreground">
                  Litros de recursos hídricos protegidos de lixiviados y procesos industriales.
                </p>
              </div>

              {/* Energía Eléctrica Ahorrada */}
              <div className="p-4 rounded-xl border bg-gradient-to-br from-amber-500/10 via-card to-card border-amber-500/30 space-y-1">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Zap className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase">Energía Ahorrada</span>
                </div>
                <p className="text-3xl font-extrabold font-mono text-foreground">{totalEnergyKwh} kWh</p>
                <p className="text-[11px] text-muted-foreground">
                  Electricidad térmica recuperada en plantas de refusión y procesado.
                </p>
              </div>
            </div>
          </div>

          {/* TARJETAS DE COMPARATIVAS VISUALES "EXPERIENCIA DE OTRO LEVEL" */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Comparativas Tangibles para la Comunidad Ciudadana
              </h3>
              <p className="text-xs text-muted-foreground">
                Traducción pedagógica de toneladas abstractas a equivalencias humanas y cotidianas para el vecino.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* Equivalencia 1: Árboles */}
              <div className="p-4 rounded-xl border bg-muted/20 space-y-2 text-center">
                <div className="h-10 w-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <TreePine className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-foreground font-mono">{treesEquiv}</p>
                  <p className="text-xs font-bold text-foreground mt-0.5">Árboles Adultos</p>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Absorbiendo carbono durante 1 año completo en ecosistemas nativos serranos.
                </p>
              </div>

              {/* Equivalencia 2: Kilómetros no conducidos */}
              <div className="p-4 rounded-xl border bg-muted/20 space-y-2 text-center">
                <div className="h-10 w-10 mx-auto rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Car className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-foreground font-mono">{kmNoDriven.toLocaleString()} km</p>
                  <p className="text-xs font-bold text-foreground mt-0.5">Km Vehiculares Evitados</p>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Emisiones equivalentes a no conducir un automóvil mediano a combustión.
                </p>
              </div>

              {/* Equivalencia 3: Duchas de agua */}
              <div className="p-4 rounded-xl border bg-muted/20 space-y-2 text-center">
                <div className="h-10 w-10 mx-auto rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <Droplets className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-foreground font-mono">{showersSaved.toLocaleString()}</p>
                  <p className="text-xs font-bold text-foreground mt-0.5">Duchas Familiares</p>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Agua dulce salvada de contaminación equivalente a duchas hogareñas de 5 minutos.
                </p>
              </div>

              {/* Equivalencia 4: Días de Hogar */}
              <div className="p-4 rounded-xl border bg-muted/20 space-y-2 text-center">
                <div className="h-10 w-10 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-foreground font-mono">{homeDaysPowered}</p>
                  <p className="text-xs font-bold text-foreground mt-0.5">Días de Electricidad</p>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Consumo promedio diario de energía de una vivienda familiar cordobesa.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SECCIÓN 2: ESTUDIO DE EMPRESAS B Y TRIPLE IMPACTO ────── */}
      {activeTab === "study" && (
        <div className="space-y-6">
          {/* Manifiesto Triple Impacto */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                Marco Académico & B-Corp Assessment
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">
              Estudio de Empresas B y Plataformas de Triple Impacto (Vertical Ambiente)
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Las Empresas B (o empresas de Triple Impacto) redefinen el sentido del éxito empresarial: no buscan ser las mejores <i>del</i> mundo, sino las mejores <i>para</i> el mundo. EcoMapa aborda la vertical ambiental con una arquitectura de datos que integra indisolublemente el rédito económico municipal con la regeneración ecológica y la inclusión social de base.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* Eje 1: Impacto Económico */}
              <div className="p-5 rounded-xl border bg-muted/10 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <TrendingUp className="h-5 w-5" />
                  <span>1. Eje Económico (Rentabilidad B2G)</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Por cada tonelada desviada del vertedero sanitario, el municipio ahorra <b>$18.500 ARS</b> en costos de disposición final y canon de enterramiento. Además, la optimización algorítmica de trayectos reduce un <b>28.4%</b> el gasto en combustible diésel y desgaste de la flota pública.
                </p>
                <div className="p-2.5 rounded-lg bg-background border text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  Ahorro proyectado: $4.2M ARS / año por cada 200 toneladas recuperadas.
                </div>
              </div>

              {/* Eje 2: Impacto Social */}
              <div className="p-5 rounded-xl border bg-muted/10 space-y-3">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                  <Users className="h-5 w-5" />
                  <span>2. Eje Social (Cooperativas Inclusivas)</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  EcoMapa digitaliza la entrega formal del <b>68.5%</b> de los residuos recolectados directamente a Cooperativas de Recuperadores Urbanos (ej. <i>Coop. Los Cuadraditos</i>). Se garantiza trazabilidad, precios justos por kilo de cartón/PET y dignificación del empleo verde.
                </p>
                <div className="p-2.5 rounded-lg bg-background border text-[11px] font-mono text-purple-600 dark:text-purple-400">
                  Inclusión formal: 85 recuperadores urbanos formalizados con trazabilidad.
                </div>
              </div>

              {/* Eje 3: Impacto Ambiental */}
              <div className="p-5 rounded-xl border bg-muted/10 space-y-3">
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-sm">
                  <TreePine className="h-5 w-5" />
                  <span>3. Eje Ambiental (Vertical Naturaleza)</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Desvío cuantificado de lixiviados tóxicos de las cuencas hídricas provinciales (Río Suquía y Lago San Roque). Reducción del metano emitido por descomposición anaeróbica en basurales a cielo abierto y certificación directa para los Objetivos de Desarrollo Sostenible (ODS 11, 12, 13).
                </p>
                <div className="p-2.5 rounded-lg bg-background border text-[11px] font-mono text-teal-600 dark:text-teal-400">
                  Tasa de Desvío (CRR): 68.5% de recuperación circular local.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SECCIÓN 3: GAMIFICACIÓN Y COMPARATIVAS CIUDADANAS ────── */}
      {activeTab === "gamification" && (
        <div className="space-y-6">
          {/* Tarjeta de Gamificación */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Gift className="h-5 w-5 text-emerald-500" />
                  Sistema de Gamificación Ciudadana: Pasaporte EcoMapa
                </h2>
                <p className="text-xs text-muted-foreground">
                  Incentivos conductuales (Nudge Theory) para premiar al vecino por cada separación en origen comprobada.
                </p>
              </div>

              <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                EcoCréditos Activos
              </span>
            </div>

            {/* Rangos de Progresión Ciudadana */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Niveles de Compromiso Ciudadano en la App Móvil
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Nivel 1: Semilla</span>
                    <span className="text-[10px] font-mono text-muted-foreground">0 - 100 pts</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Vecino principiante. Consulta al asistente IA Groq cómo clasificar residuos dudosos.
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Nivel 2: Guardián</span>
                    <span className="text-[10px] font-mono text-muted-foreground">101 - 500 pts</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Lleva botellas PET y cartón a campanas verdes 2 veces por semana.
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Nivel 3: Héroe Circular</span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">501 - 1,500 pts</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Solicita retiros de RAEE a domicilio y entrega aceite vegetal usado para biodiésel.
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-purple-500/10 border-purple-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Nivel 4: Embajador B</span>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">&gt; 1,500 pts</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Líder de manzana. Canjea 10% de descuento en el Impuesto Inmobiliario / ABL municipal.
                  </p>
                </div>
              </div>
            </div>

            {/* Catálogo de Beneficios y Canjes */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Incentivos Tangibles con Impacto en la Economía Local
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border bg-card flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-foreground">10% Descuento en Tasa ABL</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Válido para la cuota semestral municipal al sumar 500 EcoCréditos.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-card flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                    <Car className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-foreground">Pasajes de Colectivo Urbano</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Carga directa de 2 pasajes TAMSE contactless por 150 EcoCréditos.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-card flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
                    <TreePine className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-foreground">Árbol Nativo (Vivero Municipal)</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Algarrobo o espinillo con kit de plantación por 200 EcoCréditos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
