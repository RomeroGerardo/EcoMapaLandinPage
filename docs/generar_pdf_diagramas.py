# -*- coding: utf-8 -*-
"""
Generador del Documento PDF Académico con los 5 Diagramas UML y Arquitectura
Para presentación del Trabajo Integrador de la Cátedra de Programación.
EcoMapa V2.1 — Romero Labs
"""
from pathlib import Path
from fpdf import FPDF
from PIL import Image

DOCS_DIR = Path(__file__).resolve().parent
DIAG_DIR = DOCS_DIR / "diagramas"
OUT_PDF = DOCS_DIR / "DIAGRAMAS_UML_ECOMAPA_V2.1.pdf"

FONT_REGULAR = Path(r"C:\Windows\Fonts\arial.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\arialbd.ttf")
FONT_ITALIC = Path(r"C:\Windows\Fonts\ariali.ttf")
FONT_NAME = "Arial"

# Colores de marca
COLOR_PRIMARY = (0, 108, 73)      # #006c49
COLOR_SECONDARY = (0, 90, 194)    # #005ac2
COLOR_TEXT_DARK = (25, 28, 30)
COLOR_TEXT_MUTED = (70, 85, 78)
COLOR_BG_CARD = (245, 248, 246)
COLOR_BORDER = (210, 222, 215)
COLOR_ACCENT = (16, 185, 129)

class DiagramReportPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font(FONT_NAME, "B", 8)
            self.set_text_color(*COLOR_PRIMARY)
            self.cell(120, 5, "EcoMapa V2.1 · Modelado UML y Especificación Técnica", align="L")
            self.set_font(FONT_NAME, "", 8)
            self.set_text_color(*COLOR_TEXT_MUTED)
            self.cell(0, 5, "Trabajo Integrador · Romero Labs", align="R")
            self.ln(5)
            self.set_draw_color(*COLOR_BORDER)
            self.set_line_width(0.3)
            self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
            self.ln(4)

    def footer(self):
        self.set_y(-12)
        self.set_draw_color(*COLOR_BORDER)
        self.set_line_width(0.3)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(2)
        self.set_font(FONT_NAME, "", 8)
        self.set_text_color(*COLOR_TEXT_MUTED)
        self.cell(120, 5, "EcoMapa V2.1 — Plataforma de Sostenibilidad y Economía Circular", align="L")
        self.cell(0, 5, f"Página {self.page_no()}/{{nb}}", align="R")


def add_cover(pdf: DiagramReportPDF):
    pdf.add_page(orientation="P")
    pdf.ln(12)
    
    # Badge superior
    pdf.set_fill_color(225, 245, 235)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.set_font(FONT_NAME, "B", 9)
    pdf.cell(85, 7, "  DOCUMENTACIÓN TÉCNICA FORMAL  ", fill=True, ln=True)
    pdf.ln(8)
    
    # Título principal
    pdf.set_font(FONT_NAME, "B", 24)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.multi_cell(0, 10, "Modelado de Software\ny Diagramas UML")
    pdf.ln(2)
    
    # Subtítulo
    pdf.set_font(FONT_NAME, "B", 13)
    pdf.set_text_color(*COLOR_SECONDARY)
    pdf.multi_cell(0, 7, "EcoMapa V2.1 — Plataforma Inteligente de Reciclaje y Economía Circular")
    pdf.ln(6)
    
    # Separador
    pdf.set_draw_color(*COLOR_PRIMARY)
    pdf.set_line_width(1.0)
    pdf.line(pdf.l_margin, pdf.get_y(), pdf.l_margin + 60, pdf.get_y())
    pdf.ln(10)
    
    # Caja descriptiva
    pdf.set_fill_color(*COLOR_BG_CARD)
    pdf.set_draw_color(*COLOR_BORDER)
    pdf.set_line_width(0.4)
    pdf.rect(pdf.l_margin, pdf.get_y(), pdf.epw, 42, style="FD")
    
    y_box = pdf.get_y() + 5
    pdf.set_xy(pdf.l_margin + 6, y_box)
    pdf.set_font(FONT_NAME, "B", 10)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(0, 5, "PROPÓSITO DE ESTE DOCUMENTO", ln=True)
    
    pdf.set_xy(pdf.l_margin + 6, y_box + 7)
    pdf.set_font(FONT_NAME, "", 9)
    pdf.set_text_color(*COLOR_TEXT_DARK)
    desc = (
        "El presente informe recopila los 5 diagramas fundamentales de ingeniería de software requeridos "
        "para el Trabajo Integrador de la materia. Presenta la especificación funcional (Casos de Uso), "
        "la arquitectura orientada a objetos (Diagrama de Clases bajo Clean Architecture MVVM), "
        "el comportamiento dinámico (Diagramas de Secuencia), la infraestructura cloud (Arquitectura) "
        "y el esquema relacional con extensiones geoespaciales (DER con PostGIS)."
    )
    pdf.multi_cell(pdf.epw - 12, 5, desc)
    
    pdf.set_y(y_box + 44)
    pdf.ln(10)
    
    # Metadatos del Trabajo
    meta = [
        ("Proyecto:", "EcoMapa V2.1 (SaaS B2G/B2B + App Móvil Android Nativa)"),
        ("Cátedra:", "Programación III / Trabajo Práctico Integrador"),
        ("Desarrollo:", "Romero Labs"),
        ("Fecha:", "Septiembre 2026"),
        ("Stack Tecnológico:", "Kotlin + Jetpack Compose, React 19 + TypeScript, Supabase (PostgreSQL + PostGIS), Groq AI Cloud"),
        ("Repositorio:", "https://github.com/RomeroGerardo/EcoMapaLandinPage.git")
    ]
    
    for label, val in meta:
        pdf.set_font(FONT_NAME, "B", 9)
        pdf.set_text_color(*COLOR_PRIMARY)
        pdf.cell(38, 6, label, align="L")
        pdf.set_font(FONT_NAME, "", 9)
        pdf.set_text_color(*COLOR_TEXT_DARK)
        pdf.multi_cell(0, 6, val)
        pdf.ln(1)
        
    pdf.ln(8)
    
    # Índice
    pdf.set_font(FONT_NAME, "B", 10)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(0, 6, "ÍNDICE DE DIAGRAMAS INCLUIDOS", ln=True)
    pdf.ln(2)
    
    items = [
        ("1. Diagrama de Casos de Uso (UML)", "3 Actores (Ciudadano, Municipio, Superadmin) y 15 Casos de Uso"),
        ("2. Diagrama de Clases (UML)", "Clean Architecture MVVM: Dominio, Datos, Red y ViewModels"),
        ("3. Diagrama de Secuencia 1", "Ciclo de Consulta de Clasificación con IA Generativa y Gamificación"),
        ("4. Diagrama de Secuencia 2", "Flujo B2G de Solicitud y Asignación de Retiro a Domicilio"),
        ("5. Diagrama de Arquitectura del Sistema", "Topología en 5 capas (Presentación, Backend, Datos, IA y Local)"),
        ("6. Diagrama Entidad-Relación (DER)", "7 tablas PostgreSQL con extensiones espaciales PostGIS y cardinalidades")
    ]
    
    for idx, (diag_name, diag_sub) in enumerate(items, 1):
        pdf.set_font(FONT_NAME, "B", 8.5)
        pdf.set_text_color(*COLOR_SECONDARY)
        pdf.cell(65, 5, diag_name)
        pdf.set_font(FONT_NAME, "", 8.5)
        pdf.set_text_color(*COLOR_TEXT_MUTED)
        pdf.cell(0, 5, f"—  {diag_sub}", ln=True)


def add_diagram_page(pdf: DiagramReportPDF, title, subtitle, img_path: Path, explanation_bullets, landscape=False):
    orientation = "L" if landscape else "P"
    pdf.add_page(orientation=orientation)
    
    # Título de sección
    pdf.set_font(FONT_NAME, "B", 14)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(0, 7, title, ln=True)
    
    pdf.set_font(FONT_NAME, "", 8.5)
    pdf.set_text_color(*COLOR_TEXT_MUTED)
    pdf.cell(0, 5, subtitle, ln=True)
    pdf.ln(3)
    
    # Separador sutil
    pdf.set_draw_color(*COLOR_BORDER)
    pdf.set_line_width(0.3)
    pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
    pdf.ln(4)
    
    # Calcular espacio para la imagen
    avail_w = pdf.epw
    # Dejamos espacio para los bullets abajo (~35mm)
    bullets_h = 32 if explanation_bullets else 0
    avail_h = pdf.h - pdf.get_y() - pdf.b_margin - bullets_h - 4
    
    if img_path.exists():
        im = Image.open(img_path)
        im_w, im_h = im.size
        aspect = im_w / im_h
        
        target_w = avail_w
        target_h = target_w / aspect
        
        if target_h > avail_h:
            target_h = avail_h
            target_w = target_h * aspect
            
        # Centrar horizontalmente
        x_pos = pdf.l_margin + (avail_w - target_w) / 2
        y_pos = pdf.get_y()
        
        # Borde contenedor blanco suave para la imagen
        pdf.set_fill_color(255, 255, 255)
        pdf.set_draw_color(*COLOR_BORDER)
        pdf.set_line_width(0.3)
        pdf.rect(x_pos - 1, y_pos - 1, target_w + 2, target_h + 2, style="FD")
        
        pdf.image(str(img_path), x=x_pos, y=y_pos, w=target_w, h=target_h)
        pdf.set_y(y_pos + target_h + 4)
    else:
        pdf.cell(0, 20, f"[Imagen no encontrada: {img_path.name}]", ln=True)
        
    # Bullets explicativos
    if explanation_bullets:
        pdf.set_fill_color(*COLOR_BG_CARD)
        pdf.set_draw_color(*COLOR_BORDER)
        pdf.set_line_width(0.3)
        
        card_y = pdf.get_y()
        pdf.rect(pdf.l_margin, card_y, pdf.epw, bullets_h, style="FD")
        pdf.set_xy(pdf.l_margin + 4, card_y + 2)
        
        pdf.set_font(FONT_NAME, "B", 8)
        pdf.set_text_color(*COLOR_PRIMARY)
        pdf.cell(0, 4, "NOTAS DE INGENIERÍA Y ARQUITECTURA:", ln=True)
        
        pdf.set_font(FONT_NAME, "", 7.5)
        pdf.set_text_color(*COLOR_TEXT_DARK)
        for bullet in explanation_bullets:
            pdf.set_x(pdf.l_margin + 4)
            pdf.cell(4, 3.8, "• ")
            pdf.multi_cell(pdf.epw - 8, 3.8, bullet)


def main():
    print("Iniciando generación de PDF académico con diagramas...")
    pdf = DiagramReportPDF(unit="mm", format="A4")
    pdf.set_auto_page_break(False)
    
    # Registro de fuentes
    pdf.add_font(FONT_NAME, "", str(FONT_REGULAR))
    pdf.add_font(FONT_NAME, "B", str(FONT_BOLD))
    pdf.add_font(FONT_NAME, "I", str(FONT_ITALIC))
    pdf.alias_nb_pages()
    
    # 1. Portada
    add_cover(pdf)
    
    # 2. Casos de Uso (Portrait)
    add_diagram_page(
        pdf,
        title="1. Diagrama de Casos de Uso (UML)",
        subtitle="Interacción funcional de los 3 actores: Ciudadano (App Móvil), Municipio/Comercios B2B y Superadmin SaaS",
        img_path=DIAG_DIR / "01_casos_de_uso.png",
        explanation_bullets=[
            "Relación «include»: Al invocar UC-01 (Consultar IA para clasificar residuo), el sistema incluye automáticamente UC-04 (Acumulación de Ecopuntos e insignias).",
            "Relación «extend»: La solicitud de retiro a domicilio generada por el ciudadano (UC-06) extiende su ciclo hacia la coordinación y asignación municipal en el panel web (UC-09).",
            "Aislamiento de Actores: Cada actor posee un canal exclusivo adaptado a su contexto de uso (Móvil con GPS vs. Web Desktop administrativo)."
        ],
        landscape=False
    )
    
    # 3. Clases (Landscape para máxima legibilidad de los 4 paquetes)
    add_diagram_page(
        pdf,
        title="2. Diagrama de Clases — Clean Architecture MVVM (Android)",
        subtitle="Estructura orientada a objetos en Kotlin dividida en Dominio, Repositorios, Capa de Datos y ViewModels",
        img_path=DIAG_DIR / "02_clases.png",
        explanation_bullets=[
            "Principio de Inversión de Dependencias (DIP): Los ViewModels se comunican únicamente con interfaces de dominio (AiRepository, MapRepository, GamificationRepository).",
            "Single Source of Truth: La capa de presentación expone estados inmutables mediante StateFlow<UiState> consumidos reactivamente por Jetpack Compose.",
            "Desacoplamiento de Red: Los DTOs de red recibidos por Retrofit (SupabaseApi) se transforman en modelos de dominio puros mediante funciones de extensión .toDomain()."
        ],
        landscape=True
    )
    
    # 4. Secuencia IA (Landscape)
    add_diagram_page(
        pdf,
        title="3. Diagrama de Secuencia — Consulta de Clasificación con IA Generativa",
        subtitle="Flujo síncrono/asíncrono: Jetpack Compose -> Edge Function Deno -> Groq Cloud LLaMA 3.3 -> PostGIS -> Gamificación",
        img_path=DIAG_DIR / "03_secuencia_ia.png",
        explanation_bullets=[
            "Orquestación Semántica en Edge: La Edge Function /classify en Supabase realiza una llamada HTTP a Groq Cloud con un system prompt estructurado que retorna JSON estricto.",
            "Búsqueda Geoespacial PostGIS: Utiliza el procedimiento RPC get_nearby_points para calcular la distancia esférica (ST_DistanceSphere) al punto de reciclaje óptimo más cercano.",
            "Gamificación Reactiva Local: Tras recibir la respuesta, GamificationRepository actualiza el streak de días consecutivos y evalúa el catálogo de insignias en Android DataStore."
        ],
        landscape=True
    )
    
    # 5. Secuencia Retiros (Landscape)
    add_diagram_page(
        pdf,
        title="4. Diagrama de Secuencia — Solicitud y Asignación de Retiro a Domicilio",
        subtitle="Flujo colaborativo B2G: Solicitud de residuo voluminoso desde App Móvil y coordinación desde Panel Web municipal",
        img_path=DIAG_DIR / "03_secuencia_retiros.png",
        explanation_bullets=[
            "Persistencia en Estado Pendiente: La solicitud se crea con estado 'pendiente' y geolocalización GPS capturada por el teléfono del vecino.",
            "Visualización en Tiempo Real: El operador municipal consulta la tabla pickup_requests filtrando por estado y asigna la cuadrilla responsable ('Cooperativa Recicla+').",
            "Cierre de Circuito Operativo: La actualización a 'asignado' finaliza la trazabilidad del residuo voluminoso, evitando microbasurales urbanos."
        ],
        landscape=True
    )
    
    # 6. Arquitectura (Landscape)
    add_diagram_page(
        pdf,
        title="5. Diagrama de Arquitectura del Sistema (5 Capas)",
        subtitle="Topología de infraestructura, clientes nativos, servicios en la nube (Supabase + Groq), almacenamiento y protocolos",
        img_path=DIAG_DIR / "04_arquitectura.png",
        explanation_bullets=[
            "Seguridad Multi-Tenant: Supabase Auth gestiona tokens JWT con políticas RLS (Row Level Security) que segregan los datos entre municipios y comercios.",
            "Separación de Motores de IA: Un pipeline especializado para la app móvil (Edge Function + LLaMA 3.3-70b) y un canal directo para la landing page comercial (GPT-OSS-120b).",
            "Resiliencia Offline/Local: Almacenamiento local mediante DataStore Preferences en Android para mantener la experiencia de usuario y streak sin conexión."
        ],
        landscape=True
    )
    
    # 7. DER (Portrait)
    add_diagram_page(
        pdf,
        title="6. DER — Diagrama Entidad-Relación (PostgreSQL 15 + PostGIS)",
        subtitle="Modelo relacional completo de la base de datos Supabase con claves primarias UUID, foráneas y atributos espaciales",
        img_path=DIAG_DIR / "05_der.png",
        explanation_bullets=[
            "Soporte PostGIS: La columna 'geom' de recycling_points almacena puntos georreferenciados (SRID 4326) sincronizados automáticamente mediante trigger PL/pgSQL.",
            "Integración REP (Marcas): La tabla 'producers' modela los fabricantes bajo la Ley REP, vinculados a sus centros oficiales de devolución (producer_id).",
            "Economía de Ecopuntos: El catálogo 'rewards' de comercios asociados se conecta con 'reward_claims' mediante códigos alfanuméricos únicos generados al canjear."
        ],
        landscape=False
    )
    
    pdf.output(str(OUT_PDF))
    print(f"\n✅ PDF generado exitosamente en: {OUT_PDF}")

if __name__ == "__main__":
    main()