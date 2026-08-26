"""
Generador de Informe Académico y Ejecutivo de Avances de EcoMapa V2.1
Para presentación ante el profesor / cátedra.
"""
from pathlib import Path
from fpdf import FPDF

DOCS_DIR = Path(__file__).resolve().parent
OUT_FILE = DOCS_DIR / "INFORME_AVANCES_ECOMAPA_V2.1.pdf"

FONT_REGULAR = Path(r"C:\Windows\Fonts\arial.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\arialbd.ttf")
FONT_ITALIC = Path(r"C:\Windows\Fonts\ariali.ttf")
FONT_NAME = "Arial"

# Colores de marca EcoMapa
COLOR_PRIMARY = (0, 108, 73)      # #006c49 Verde Institucional
COLOR_SECONDARY = (0, 90, 194)    # #005ac2 Azul Tecnológico
COLOR_TEXT_DARK = (25, 28, 30)    # #191c1e Gris Oscuro Texto
COLOR_TEXT_MUTED = (70, 85, 78)   # Gris Secundario Legible
COLOR_BG_LIGHT = (247, 249, 251)  # #f7f9fb Fondo Claro
COLOR_CARD_BG = (242, 246, 243)   # Fondo tarjetas suaves
COLOR_BORDER = (215, 224, 218)    # Bordes sutiles
COLOR_ACCENT = (16, 185, 129)     # #10b981 Verde Esmeralda


class EcoMapaReportPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font(FONT_NAME, "B", 8)
            self.set_text_color(*COLOR_PRIMARY)
            self.cell(100, 6, "EcoMapa V2.1 · Informe de Avances y Arquitectura Técnica", align="L")
            self.set_font(FONT_NAME, "", 8)
            self.set_text_color(*COLOR_TEXT_MUTED)
            self.cell(0, 6, "Romero Labs", align="R")
            self.ln(6)
            self.set_draw_color(*COLOR_BORDER)
            self.set_line_width(0.3)
            self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
            self.ln(3)

    def footer(self):
        self.set_y(-14)
        self.set_draw_color(*COLOR_BORDER)
        self.set_line_width(0.3)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(2)
        self.set_font(FONT_NAME, "", 8)
        self.set_text_color(*COLOR_TEXT_MUTED)
        self.cell(100, 6, "EcoMapa V2.1 — Plataforma de Sostenibilidad y Economía Circular", align="L")
        self.cell(0, 6, f"Página {self.page_no()}/{{nb}}", align="R")


def add_cover(pdf: EcoMapaReportPDF):
    pdf.add_page()
    pdf.ln(6)
    
    # Badge superior
    pdf.set_fill_color(225, 245, 235)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.set_font(FONT_NAME, "B", 9)
    badge_text = "  INFORME DE AVANCES TÉCNICOS & ARQUITECTURA  "
    w_badge = pdf.get_string_width(badge_text) + 6
    pdf.cell(w_badge, 7, badge_text, fill=True, align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    # Título Principal
    pdf.set_font(FONT_NAME, "B", 23)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(0, 11, "EcoMapa V2.1", new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font(FONT_NAME, "B", 13)
    pdf.set_text_color(*COLOR_SECONDARY)
    pdf.cell(0, 7, "Plataforma Integral de Reciclaje Inteligente, IA & SaaS Circular", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    # Línea decorativa
    pdf.set_draw_color(*COLOR_PRIMARY)
    pdf.set_line_width(0.8)
    pdf.line(pdf.l_margin, pdf.get_y(), pdf.l_margin + 60, pdf.get_y())
    pdf.ln(5)

    # Metadata del Documento
    pdf.set_fill_color(*COLOR_BG_LIGHT)
    pdf.set_draw_color(*COLOR_BORDER)
    pdf.set_line_width(0.3)
    
    meta_x = pdf.get_x()
    meta_y = pdf.get_y()
    pdf.rect(meta_x, meta_y, pdf.epw, 28, style="DF")
    
    pdf.set_xy(meta_x + 5, meta_y + 4)
    pdf.set_font(FONT_NAME, "B", 9)
    pdf.set_text_color(*COLOR_TEXT_DARK)
    pdf.cell(38, 5, "Proyecto / Cátedra:")
    pdf.set_font(FONT_NAME, "", 9)
    pdf.set_text_color(*COLOR_TEXT_MUTED)
    pdf.cell(0, 5, "Programación / Desarrollo de Software — Romero Labs", new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_x(meta_x + 5)
    pdf.set_font(FONT_NAME, "B", 9)
    pdf.set_text_color(*COLOR_TEXT_DARK)
    pdf.cell(38, 5, "Autor / Desarrollador:")
    pdf.set_font(FONT_NAME, "", 9)
    pdf.set_text_color(*COLOR_TEXT_MUTED)
    pdf.cell(0, 5, "Gerardo Romero (Romero Labs)", new_x="LMARGIN", new_y="NEXT")

    pdf.set_x(meta_x + 5)
    pdf.set_font(FONT_NAME, "B", 9)
    pdf.set_text_color(*COLOR_TEXT_DARK)
    pdf.cell(38, 5, "Repositorio GitHub:")
    pdf.set_font(FONT_NAME, "", 9)
    pdf.set_text_color(*COLOR_SECONDARY)
    pdf.cell(0, 5, "https://github.com/RomeroGerardo/EcoMapaLandinPage", new_x="LMARGIN", new_y="NEXT")

    pdf.set_x(meta_x + 5)
    pdf.set_font(FONT_NAME, "B", 9)
    pdf.set_text_color(*COLOR_TEXT_DARK)
    pdf.cell(38, 5, "Fecha de Entrega:")
    pdf.set_font(FONT_NAME, "", 9)
    pdf.set_text_color(*COLOR_TEXT_MUTED)
    pdf.cell(0, 5, "Agosto 2026 · Versión 2.1 Final", new_x="LMARGIN", new_y="NEXT")

    pdf.set_xy(meta_x, meta_y + 32)


def section(pdf: EcoMapaReportPDF, title: str):
    pdf.ln(4)
    pdf.set_font(FONT_NAME, "B", 12.5)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(0, 7, title, new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(*COLOR_PRIMARY)
    pdf.set_line_width(0.4)
    pdf.line(pdf.l_margin, pdf.get_y(), pdf.l_margin + 35, pdf.get_y())
    pdf.ln(3)


def paragraph(pdf: EcoMapaReportPDF, text: str):
    pdf.set_font(FONT_NAME, "", 9.2)
    pdf.set_text_color(*COLOR_TEXT_DARK)
    pdf.multi_cell(pdf.epw, 5.0, text)
    pdf.ln(2)


def bullet(pdf: EcoMapaReportPDF, title: str, text: str):
    pdf.set_font(FONT_NAME, "B", 9.2)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(4, 5.0, "-")
    pdf.set_text_color(*COLOR_TEXT_DARK)
    w_title = pdf.get_string_width(title + " ") + 1
    pdf.cell(w_title, 5.0, title + ":", align="L")
    pdf.set_font(FONT_NAME, "", 9.2)
    pdf.set_text_color(*COLOR_TEXT_DARK)
    pdf.multi_cell(pdf.epw - w_title - 5, 5.0, text)
    pdf.ln(1)


def feature_box(pdf: EcoMapaReportPDF, title: str, items: list):
    pdf.ln(2)
    start_x = pdf.l_margin
    start_y = pdf.get_y()
    
    padding_top = 3.5
    padding_bottom = 3.5
    title_height = 5.5
    inner_w = pdf.epw - 10
    
    # 1. Precalcular altura exacta para evitar solapamientos
    total_items_h = 0
    prepared_items = []
    
    for it_title, it_desc in items:
        pdf.set_font(FONT_NAME, "B", 9)
        w_title = pdf.get_string_width(f"{it_title}: ") + 1
        desc_w = inner_w - w_title
        
        pdf.set_font(FONT_NAME, "", 9)
        words = it_desc.split()
        lines = 1
        curr_w = 0
        for w in words:
            w_len = pdf.get_string_width(w + " ")
            if curr_w + w_len > desc_w:
                lines += 1
                curr_w = w_len
            else:
                curr_w += w_len
        
        line_h = 4.8
        it_h = lines * line_h + 1.5
        prepared_items.append((it_title, it_desc, w_title, desc_w, line_h))
        total_items_h += it_h
        
    total_card_h = padding_top + title_height + total_items_h + padding_bottom

    # 2. Dibujar fondo y borde del contenedor
    pdf.set_fill_color(*COLOR_CARD_BG)
    pdf.set_draw_color(*COLOR_BORDER)
    pdf.set_line_width(0.3)
    pdf.rect(start_x, start_y, pdf.epw, total_card_h, style="DF")
    
    # Barra lateral verde institucional
    pdf.set_fill_color(*COLOR_PRIMARY)
    pdf.rect(start_x, start_y, 2.5, total_card_h, style="F")

    # 3. Título de la tarjeta
    pdf.set_xy(start_x + 6, start_y + padding_top)
    pdf.set_font(FONT_NAME, "B", 9.8)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(0, title_height, title, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(0.5)

    # 4. Contenido
    for it_title, it_desc, w_title, desc_w, line_h in prepared_items:
        cur_y = pdf.get_y()
        pdf.set_xy(start_x + 6, cur_y)
        pdf.set_font(FONT_NAME, "B", 9)
        pdf.set_text_color(*COLOR_TEXT_DARK)
        pdf.cell(w_title, line_h, f"{it_title}:")
        
        pdf.set_font(FONT_NAME, "", 9)
        pdf.set_text_color(*COLOR_TEXT_MUTED)
        pdf.multi_cell(desc_w, line_h, it_desc)
        pdf.ln(1.5)

    # 5. Posicionamiento seguro después de la tarjeta
    pdf.set_xy(start_x, start_y + total_card_h + 3)


def main():
    pdf = EcoMapaReportPDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.add_font(FONT_NAME, "", str(FONT_REGULAR))
    pdf.add_font(FONT_NAME, "B", str(FONT_BOLD))
    pdf.add_font(FONT_NAME, "I", str(FONT_ITALIC))

    # ==========================================
    # PÁGINA 1: PORTADA & RESUMEN EJECUTIVO
    # ==========================================
    add_cover(pdf)

    section(pdf, "1. Resumen Ejecutivo del Proyecto")
    paragraph(
        pdf,
        "EcoMapa V2.1 es un ecosistema tecnológico diseñado para resolver una problemática real: la "
        "falta de información y de incentivos directos para el reciclaje domiciliario y comercial. "
        "La solución articula a tres actores clave de la economía circular:"
    )
    bullet(
        pdf,
        "1. Ciudadanos (App Móvil Android)",
        "Acceden a un asistente de IA para clasificar residuos, mapas de puntos limpios cercanos, retiros domiciliarios y gamificación con cupones de recompensa."
    )
    bullet(
        pdf,
        "2. Municipios y Cooperativas (Panel Web B2G)",
        "Digitalizan su red de contenedores, gestionan cuadrillas de recolección para residuos voluminosos y acceden a métricas de impacto ambiental en tiempo real."
    )
    bullet(
        pdf,
        "3. Empresas y Productores REP (Panel B2B / SaaS)",
        "Publican cupones comerciales y gestionan programas oficiales de Responsabilidad Extendida del Productor (pilas, electrónicos, etc.)."
    )

    section(pdf, "2. Arquitectura Tecnológica y Stack Implementado")
    paragraph(
        pdf,
        "El proyecto se construyó bajo una arquitectura desacoplada, moderna y escalable, dividida "
        "en componentes especializados según el rol de uso:"
    )

    items_stack = [
        ("App Móvil (Ciudadano)", "Kotlin nativo + Jetpack Compose, Arquitectura MVVM, Hilt DI, Coroutines, OpenStreetMap (OSMDroid) y DataStore."),
        ("Panel Web SaaS & Landing", "React 19, TypeScript, Vite, Tailwind CSS, Radix UI, Leaflet y Zustand para gestión de estado."),
        ("Backend & Base de Datos", "Supabase (PostgreSQL 15 + extensión geoespacial PostGIS, Supabase Auth y Row Level Security)."),
        ("Inteligencia Artificial", "Groq Cloud API con modelos LLaMA 3.3-70b y GPT-OSS-120b para inferencia en tiempo real (<300 ms).")
    ]
    feature_box(pdf, "Stack Tecnológico Principal", items_stack)

    # ==========================================
    # PÁGINA 2: MÓDULOS DE ECOMA PA V2.1
    # ==========================================
    pdf.add_page()
    
    section(pdf, "3. Módulos y Avances Desarrollados en EcoMapa V2.1")
    paragraph(
        pdf,
        "En esta versión se implementaron los siguientes módulos de alto impacto presentados ante las "
        "autoridades y evaluadores del proyecto:"
    )

    feature_box(pdf, "A. Módulo de Retiros a Domicilio (Residuos Voluminosos)", [
        ("App Móvil", "Flujo para solicitar recolección de muebles, escombros, chatarra o restos de poda con coordenadas GPS y franja horaria."),
        ("Panel Web", "Tablero logístico interactivo (/dashboard/pickups) para que el municipio apruebe solicitudes y asigne cuadrillas y camiones."),
        ("Base de Datos", "Tabla pickup_requests con control de estados (pendiente, asignado, en camino, completado, cancelado).")
    ])

    feature_box(pdf, "B. Módulo de Gamificación B2B & Recompensas Reales", [
        ("App Móvil", "Marketplace de cupones (RewardsScreen.kt) para canjear Ecopuntos por descuentos en comercios y supermercados."),
        ("Panel Web", "Módulo para comercios (/dashboard/rewards) para publicar promociones y validar códigos de canje de los vecinos."),
        ("Lógica de Racha", "Algoritmo basado en días de calendario (LocalDate) que premia la constancia sin reiniciar puntos por consultas múltiples.")
    ])

    feature_box(pdf, "C. Módulo de Productores REP & Centros Privados", [
        ("Marcas REP", "Gestión de trazabilidad oficial para empresas obligadas por la Ley de Responsabilidad Extendida del Productor (pilas, RAEEs)."),
        ("Centros Privados", "Soporte de puntos de compra con cotización en tiempo real por kilo ($/kg) para materiales valorizables (cobre, aluminio, cartón).")
    ])

    # ==========================================
    # PÁGINA 3: SEGURIDAD, LANDING Y RESULTADOS
    # ==========================================
    pdf.add_page()

    section(pdf, "4. Seguridad y Control SaaS Multi-Rol (3 Niveles)")
    paragraph(
        pdf,
        "Para garantizar un modelo de negocio sostenible y proteger los datos sensibles, se definió "
        "un esquema estricto de autenticación y autorización:"
    )
    bullet(
        pdf,
        "Nivel 1 - Ciudadano (Público)",
        "Acceso anónimo y directo desde la App Móvil o la Landing Page. Sin fricción de registro obligatorio para consultar el mapa y la IA."
    )
    bullet(
        pdf,
        "Nivel 2 - Entidades / Municipios (B2G/B2B)",
        "Acceso autenticado a /dashboard/* mediante Supabase Auth. Aislado por 'tenant_id' para que cada municipio solo vea sus propios puntos y retiros."
    )
    bullet(
        pdf,
        "Nivel 3 - Superadmin Master (Romero Labs)",
        "Panel exclusivo en /superadmin/tenants protegido por 'SuperAdminRoute' para altas de municipios, cambio de planes (Basic, Pro, Enterprise) y pausa de servicios."
    )

    section(pdf, "5. Landing Page Oficial & Doble Asistente de IA")
    paragraph(
        pdf,
        "Se rediseñó la Landing Page pública (Material Design 3) fusionando la identidad visual original "
        "con los nuevos requerimientos comerciales y técnicos:"
    )
    bullet(
        pdf,
        "Descarga de APK & Código QR",
        "Botón de descarga directa del instalable Android (/downloads/ecomapa.apk) y modal con QR dinámico para abrir desde el teléfono móvil."
    )
    bullet(
        pdf,
        "Doble Asistente IA Independiente",
        "Se independizaron los dos bots: el bot de la app móvil clasifica residuos con Supabase Edge Functions, mientras que el bot flotante de la landing utiliza Groq API (GPT-OSS-120b) con rol estricto anti-jailbreak para informar y vender la plataforma a autoridades y empresas."
    )

    section(pdf, "6. Verificación, Compilación y Estado del Repositorio")
    items_verif = [
        ("Compilación Web", "Vite build + TypeScript (tsc -b) finalizado con 0 errores (Exit Code 0)."),
        ("Compilación Móvil", "Jetpack Compose en Android Studio sin advertencias de dependencias ni errores de compilación."),
        ("Repositorio GitHub", "Código fuente unificado y sincronizado en https://github.com/RomeroGerardo/EcoMapaLandinPage (Rama main).")
    ]
    feature_box(pdf, "Estado de Validación Técnica", items_verif)

    pdf.ln(3)
    pdf.set_font(FONT_NAME, "I", 8.5)
    pdf.set_text_color(*COLOR_TEXT_MUTED)
    pdf.multi_cell(
        pdf.epw,
        4.5,
        "Informe generado automáticamente para fines de evaluación académica. Proyecto desarrollado "
        "íntegramente por Romero Labs para la cátedra de Programación / Proyecto Final de Software."
    )

    pdf.output(str(OUT_FILE))
    print(f"PDF generado exitosamente en: {OUT_FILE}")


if __name__ == "__main__":
    main()
