"""Genera docs/RESUMEN_ECOMAPA.pdf desde el contenido del resumen."""
from pathlib import Path

from fpdf import FPDF

DOCS = Path(__file__).resolve().parent
OUT = DOCS / "RESUMEN_ECOMAPA.pdf"
FONT_REGULAR = Path(r"C:\Windows\Fonts\arial.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\arialbd.ttf")
FONT_NAME = "Arial"


class ResumenPDF(FPDF):
    def footer(self):
        self.set_y(-12)
        self.set_font(FONT_NAME, "", 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, f"Página {self.page_no()}", align="C")


def section_title(pdf: FPDF, text: str) -> None:
    pdf.set_font(FONT_NAME, "B", 13)
    pdf.set_text_color(46, 125, 50)
    pdf.ln(4)
    pdf.multi_cell(pdf.epw, 8, text)
    pdf.ln(2)


def body(pdf: FPDF, text: str) -> None:
    pdf.set_font(FONT_NAME, "", 10)
    pdf.set_text_color(40, 40, 40)
    pdf.multi_cell(pdf.epw, 6, text)
    pdf.ln(2)


def bullet(pdf: FPDF, text: str) -> None:
    pdf.set_font(FONT_NAME, "", 10)
    pdf.set_text_color(40, 40, 40)
    pdf.multi_cell(pdf.epw, 6, f"- {text}")


def main() -> None:
    pdf = ResumenPDF()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_font(FONT_NAME, "", str(FONT_REGULAR))
    pdf.add_font(FONT_NAME, "B", str(FONT_BOLD))
    pdf.add_page()

    # Portada
    pdf.set_font(FONT_NAME, "B", 22)
    pdf.set_text_color(46, 125, 50)
    pdf.cell(0, 14, "EcoMapa", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font(FONT_NAME, "", 12)
    pdf.set_text_color(60, 60, 60)
    pdf.multi_cell(pdf.epw, 7, "Asistente IA de reciclaje con geolocalización y gamificación")
    pdf.ln(4)
    pdf.set_font(FONT_NAME, "", 9)
    pdf.set_text_color(120, 120, 120)
    pdf.cell(0, 6, "Versión 1.0.0 · MVP universitario · Romero Labs", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)

    section_title(pdf, "¿De qué se trata?")
    body(
        pdf,
        "EcoMapa es una aplicación web (preparada también para móvil) que ayuda a los "
        "ciudadanos a reciclar correctamente. Combina un asistente de inteligencia artificial, "
        "un mapa interactivo con puntos de reciclaje reales y un sistema de gamificación para "
        "hacer el proceso más claro y motivador.",
    )
    body(
        pdf,
        "Aborda un problema cotidiano: muchas personas no saben cómo clasificar sus residuos "
        "ni dónde llevarlos, y carecen de incentivos inmediatos. La app reduce esa fricción "
        "con respuestas en lenguaje natural, ubicación en el mapa y recompensas virtuales "
        "(Ecopuntos e insignias).",
    )

    section_title(pdf, "Funcionalidades para el ciudadano")
    bullet(
        pdf,
        "Chat con IA: describe el residuo en texto libre; Groq/LLaMA indica contenedor, "
        "impacto ambiental y el punto más cercano según tu ubicación.",
    )
    bullet(
        pdf,
        "Mapa OpenStreetMap: marcadores por color de contenedor; filtra puntos cercanos "
        "(aprox. 5 km) con geolocalización.",
    )
    bullet(
        pdf,
        "Gamificación: Ecopuntos e insignias (ej. «Héroe Tóxico»); progreso local sin "
        "registro obligatorio en el flujo público.",
    )
    bullet(pdf, "Rutas: abrir el punto sugerido en Google Maps u otra app de navegación.")

    section_title(pdf, "Panel de administración (backoffice)")
    body(
        pdf,
        "Incluye autenticación con Supabase Auth para municipios y superadministradores:",
    )
    bullet(pdf, "Municipios: alta y edición de puntos de reciclaje, mapa con geolocalización.")
    bullet(pdf, "Superadmin: gestión de municipios (tenants) y aprobaciones pendientes.")
    body(
        pdf,
        "Los datos viven en Supabase (PostgreSQL). La IA se invoca vía Edge Functions para "
        "no exponer la API key de Groq en el cliente.",
    )

    section_title(pdf, "Arquitectura técnica")
    body(
        pdf,
        "Usuario → Flutter Web (mapa + chat + gamificación) → Geolocalización → "
        "Supabase (puntos, auth, funciones) → Groq API (LLaMA 3.3).",
    )
    bullet(pdf, "Frontend: Flutter 3.x, flutter_map, Provider, go_router.")
    bullet(pdf, "Backend: Supabase (PostgreSQL + Auth + Edge Functions en Deno).")
    bullet(pdf, "IA: Groq API (respuestas rápidas). Mapas: tiles gratuitos OSM.")

    section_title(pdf, "Alcance del MVP")
    body(
        pdf,
        "Incluye: mapa, IA conversacional, gamificación local, base de puntos y backoffice. "
        "Fuera del alcance inicial: RAG vectorial complejo y navegación giro a giro detallada.",
    )

    section_title(pdf, "Desarrollo local")
    body(pdf, "flutter run -d web-server --web-port=8080")
    body(pdf, "URL habitual: http://localhost:8080")

    pdf.ln(4)
    pdf.set_font(FONT_NAME, "", 8)
    pdf.set_text_color(140, 140, 140)
    pdf.multi_cell(
        pdf.epw,
        5,
        "Documento basado en docs/PRD.md, docs/RFC.md y el código del repositorio EcoMapa.",
    )

    pdf.output(str(OUT))
    print(f"PDF generado: {OUT}")


if __name__ == "__main__":
    main()
