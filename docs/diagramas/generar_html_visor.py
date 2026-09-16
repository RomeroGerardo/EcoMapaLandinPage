# -*- coding: utf-8 -*-
import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ARTIFACT_DIR = Path(r"C:\Users\Usuario\.gemini\antigravity\brain\0d08c3d9-5a9b-411a-be84-3e395519b303")

def clean_svg(svg_text):
    # Ensure svg is responsive
    svg_text = re.sub(r'style="[^"]*max-width:[^"]*"', '', svg_text)
    svg_text = re.sub(r'<svg([^>]*)width="[^"]*"([^>]*)height="[^"]*"', r'<svg\1\2 style="width:100%; height:auto; max-height:80vh;"', svg_text)
    return svg_text

def build_html():
    svg_cu = clean_svg((BASE_DIR / "01_casos_de_uso.svg").read_text(encoding="utf-8"))
    svg_cl = clean_svg((BASE_DIR / "02_clases.svg").read_text(encoding="utf-8"))
    svg_sq_ia = clean_svg((BASE_DIR / "03_secuencia_ia.svg").read_text(encoding="utf-8"))
    svg_sq_ret = clean_svg((BASE_DIR / "03_secuencia_retiros.svg").read_text(encoding="utf-8"))
    svg_arq = clean_svg((BASE_DIR / "04_arquitectura.svg").read_text(encoding="utf-8"))
    svg_der = clean_svg((BASE_DIR / "05_der.svg").read_text(encoding="utf-8"))

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diagramas UML y Arquitectura — EcoMapa V2.1</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      padding: 0;
      margin: 0;
    }}
    header {{
      background: linear-gradient(135deg, #064e3b 0%, #047857 100%);
      padding: 24px 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      border-bottom: 2px solid #10b981;
    }}
    .header-content {{
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }}
    h1 {{ font-size: 1.6rem; font-weight: 800; letter-spacing: -0.5px; }}
    .subtitle {{ font-size: 0.85rem; color: #a7f3d0; margin-top: 4px; }}
    .badge-tag {{
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }}
    .nav-tabs {{
      background: #1e293b;
      padding: 0 32px;
      display: flex;
      gap: 8px;
      overflow-x: auto;
      border-bottom: 1px solid #334155;
      position: sticky;
      top: 0;
      z-index: 100;
    }}
    .tab-btn {{
      padding: 14px 20px;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      transition: all 0.2s;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .tab-btn:hover {{
      color: #f1f5f9;
      background: rgba(255,255,255,0.03);
    }}
    .tab-btn.active {{
      color: #34d399;
      border-bottom-color: #34d399;
      background: rgba(52, 211, 153, 0.08);
    }}
    main {{
      max-width: 1400px;
      margin: 28px auto;
      padding: 0 24px;
    }}
    .tab-panel {{
      display: none;
      animation: fadeIn 0.3s ease;
    }}
    .tab-panel.active {{
      display: block;
    }}
    @keyframes fadeIn {{
      from {{ opacity: 0; transform: translateY(6px); }}
      to {{ opacity: 1; transform: translateY(0); }}
    }}
    .card {{
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    }}
    .card-header {{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 18px;
      flex-wrap: wrap;
      gap: 12px;
      border-bottom: 1px solid #334155;
      padding-bottom: 14px;
    }}
    .card-title {{
      font-size: 1.25rem;
      font-weight: 700;
      color: #f8fafc;
    }}
    .card-desc {{
      font-size: 0.82rem;
      color: #94a3b8;
      margin-top: 4px;
      line-height: 1.5;
    }}
    .svg-container {{
      background: #ffffff;
      border-radius: 12px;
      padding: 24px;
      overflow: auto;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 480px;
      border: 1px solid #cbd5e1;
    }}
    .svg-container svg {{
      display: block;
      margin: 0 auto;
    }}
    .diagram-notes {{
      margin-top: 16px;
      background: rgba(15, 23, 42, 0.6);
      border-left: 4px solid #10b981;
      padding: 12px 18px;
      border-radius: 0 8px 8px 0;
      font-size: 0.8rem;
      color: #cbd5e1;
      line-height: 1.6;
    }}
    .diagram-notes strong {{
      color: #34d399;
    }}
    .sub-section {{
      margin-top: 32px;
    }}
    .chip {{
      display: inline-block;
      padding: 2px 8px;
      background: rgba(52, 211, 153, 0.15);
      color: #34d399;
      border-radius: 4px;
      font-size: 0.72rem;
      font-family: monospace;
      margin-right: 4px;
    }}
  </style>
</head>
<body>

  <header>
    <div class="header-content">
      <div>
        <h1>📐 Diagramas del Sistema — EcoMapa V2.1</h1>
        <div class="subtitle">Romero Labs · Proyecto Integrador de Cátedra · Documentación Técnica Oficial</div>
      </div>
      <div class="badge-tag">Versión 2.1 · Septiembre 2026</div>
    </div>
  </header>

  <nav class="nav-tabs">
    <button class="tab-btn active" onclick="showTab(event, 'usecases')">📋 1. Casos de Uso</button>
    <button class="tab-btn" onclick="showTab(event, 'classes')">🏗️ 2. Clases (Clean Arch)</button>
    <button class="tab-btn" onclick="showTab(event, 'seq_ia')">🔄 3. Secuencia IA</button>
    <button class="tab-btn" onclick="showTab(event, 'seq_ret')">🚛 4. Secuencia Retiros</button>
    <button class="tab-btn" onclick="showTab(event, 'arch')">☁️ 5. Arquitectura del Sistema</button>
    <button class="tab-btn" onclick="showTab(event, 'der')">🗄️ 6. DER (Base de Datos)</button>
  </nav>

  <main>
    <!-- TAB 1: CASOS DE USO -->
    <div id="tab-usecases" class="tab-panel active">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">1. Diagrama de Casos de Uso (UML)</div>
            <div class="card-desc">Modela las interacciones de los 3 actores principales con los módulos Ciudadano (App Móvil), Municipio / Comercios B2B (Panel Web) y Superadministración SaaS (Romero Labs).</div>
          </div>
        </div>
        <div class="svg-container">
          {svg_cu}
        </div>
        <div class="diagram-notes">
          <strong>Aspectos Clave para la Presentación:</strong><br>
          • <strong>«include»</strong>: Al clasificar un residuo mediante IA (UC-01), se incluye obligatoriamente la acumulación de Ecopuntos e insignias (UC-04).<br>
          • <strong>«extend»</strong>: Cuando el ciudadano solicita un retiro voluminoso (UC-06), extiende el flujo hacia la coordinación y asignación municipal de cuadrillas (UC-09).
        </div>
      </div>
    </div>

    <!-- TAB 2: CLASES -->
    <div id="tab-classes" class="tab-panel">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">2. Diagrama de Clases — Clean Architecture MVVM (Android)</div>
            <div class="card-desc">Estructura orientada a objetos en Kotlin: Capa de Dominio (entidades e interfaces puras), Capa de Datos (implementaciones, Retrofit API y DataStore) y Capa de Presentación (ViewModels con StateFlow).</div>
          </div>
        </div>
        <div class="svg-container">
          {svg_cl}
        </div>
        <div class="diagram-notes">
          <strong>Patrones y Principios Aplicados:</strong><br>
          • <strong>Inversión de Dependencias (DIP)</strong>: Los ViewModels dependen únicamente de las interfaces de Dominio (<span class="chip">AiRepository</span>, <span class="chip">MapRepository</span>), desconociendo a Retrofit o DataStore.<br>
          • <strong>Single Source of Truth</strong>: Los estados UI se exponen como flujos inmutables <span class="chip">StateFlow&lt;UiState&gt;</span> hacia Jetpack Compose.<br>
          • <strong>Mapeo de Capas</strong>: Se desacoplan los DTOs de red de los modelos de negocio con funciones de extensión <span class="chip">.toDomain()</span>.
        </div>
      </div>
    </div>

    <!-- TAB 3: SECUENCIA IA -->
    <div id="tab-ia" class="tab-panel">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">3. Diagrama de Secuencia — Consulta de Clasificación con IA & Gamificación</div>
            <div class="card-desc">Ciclo de vida de una consulta: desde el input en Jetpack Compose, orquestación semántica con Groq LLaMA 3.3 en Deno Edge Function, búsqueda geoespacial PostGIS y persistencia local de Ecopuntos.</div>
          </div>
        </div>
        <div class="svg-container">
          {svg_sq_ia}
        </div>
        <div class="diagram-notes">
          <strong>Puntos Destacados del Flujo:</strong><br>
          1. <strong>Llamada asíncrona no bloqueante</strong> vía Coroutines de Kotlin.<br>
          2. <strong>Doble consulta en Backend</strong>: La Edge Function primero clasifica con IA generativa y con esa categoría ejecuta <span class="chip">RPC get_nearby_points</span> calculando distancia esférica en tiempo real.<br>
          3. <strong>Gamificación reactiva</strong>: Al recibir la respuesta exitosa, se evalúan rachas diarias y condiciones de insignias desbloqueadas.
        </div>
      </div>
    </div>

    <!-- TAB 4: SECUENCIA RETIROS -->
    <div id="tab-retiros" class="tab-panel">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">4. Diagrama de Secuencia — Solicitud y Asignación de Retiro a Domicilio</div>
            <div class="card-desc">Flujo de integración end-to-end B2G: Solicitud de retiro de residuos voluminosos desde la app móvil y posterior gestión, asignación de cuadrilla y actualización de estado desde el panel web municipal.</div>
          </div>
        </div>
        <div class="svg-container">
          {svg_sq_ret}
        </div>
        <div class="diagram-notes">
          <strong>Integración Móvil + Web:</strong> Demuestra cómo los datos persistidos en PostgreSQL por el ciudadano son inmediatamente consumidos por los inspectores y coordinadores del municipio en el panel React.
        </div>
      </div>
    </div>

    <!-- TAB 5: ARQUITECTURA -->
    <div id="tab-arch" class="tab-panel">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">5. Diagrama de Arquitectura del Sistema (5 Capas)</div>
            <div class="card-desc">Topología de infraestructura, clientes nativos, servicios en la nube (Supabase Cloud + Groq AI Cloud), almacenamiento local y protocolos de comunicación.</div>
          </div>
        </div>
        <div class="svg-container">
          {svg_arq}
        </div>
        <div class="diagram-notes">
          <strong>Seguridad y Escalabilidad:</strong><br>
          • <strong>Supabase RLS & JWT</strong>: Aislamiento estricto multi-tenant para que cada municipio solo acceda a sus propios puntos y solicitudes.<br>
          • <strong>Dualidad de IA</strong>: Dos pipelines separados (Edge Function + LLaMA para app móvil operativa; API directa con GPT-OSS-120b para landing comercial).
        </div>
      </div>
    </div>

    <!-- TAB 6: DER -->
    <div id="tab-der" class="tab-panel">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">6. DER — Diagrama Entidad-Relación (PostgreSQL 15 + PostGIS)</div>
            <div class="card-desc">Modelo relacional completo de la base de datos Supabase con claves primarias UUID, claves foráneas, columnas geométricas indexadas (GIST) y cardinalidades.</div>
          </div>
        </div>
        <div class="svg-container">
          {svg_der}
        </div>
        <div class="diagram-notes">
          <strong>Detalle de Relaciones:</strong><br>
          • <span class="chip">TENANTS (1) ── (N) RECYCLING_POINTS</span>: Cada municipio administra su propia red de ecopuntos.<br>
          • <span class="chip">PRODUCERS (1) ── (N) RECYCLING_POINTS</span>: Empresas de Responsabilidad Extendida del Productor certifican puntos oficiales de retorno.<br>
          • <span class="chip">REWARDS (1) ── (N) REWARD_CLAIMS</span>: Cupones emitidos por comercios asociados canjeados con Ecopuntos únicos.
        </div>
      </div>
    </div>
  </main>

  <script>
    function showTab(e, tabId) {{
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      
      const map = {{
        'usecases': 'tab-usecases',
        'classes': 'tab-classes',
        'seq_ia': 'tab-ia',
        'seq_ret': 'tab-retiros',
        'arch': 'tab-arch',
        'der': 'tab-der'
      }};
      
      const targetId = map[tabId] || 'tab-usecases';
      document.getElementById(targetId).classList.add('active');
      e.currentTarget.classList.add('active');
    }}
  </script>
</body>
</html>
"""

    out_file = BASE_DIR / "index.html"
    out_file.write_text(html, encoding="utf-8")
    print(f"Visor HTML generado en {out_file}")

    # Copy to artifact directory
    artifact_file = ARTIFACT_DIR / "diagramas_uml_ecomapa.html"
    artifact_file.write_text(html, encoding="utf-8")
    print(f"Artefacto actualizado en {artifact_file}")

if __name__ == "__main__":
    build_html()