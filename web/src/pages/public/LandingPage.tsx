import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Download, 
  QrCode, 
  MapPin, 
  Sparkles, 
  Truck, 
  Gift, 
  Factory, 
  Send, 
  X, 
  CheckCircle2, 
  Menu,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sendLandingMessageToGroq } from "@/services/landingChatService";

const LOGO_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuBbRG1E0F5y0GB8eGnGMwcGyUkk88Th5QCTccyJ28rmI1gXs6qG7S-t9vd6kHfLPRhSr-A_Xd9xthgLQ8MuNojblJpGcYbkVI-hIrQF1B5lbQDavUvvKrOyO_2A2y8e79iNdDZu4IL22UGKkUFUFw5mxmXs8GflvxMfQJurLpz3M7xgCbmDZMOhm-M_LEPiwr79FlSCOShcnvHaHP1GM-LcKSeXfSjkT7fsNTr2h8LIbnKfyfXYcDb_PXAqerOOXN-4qa8";

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
  points?: number;
  impact?: string;
}

// Función para renderizar texto limpio formateando negritas y viñetas
function FormattedMessage({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed text-[#191c1e] text-xs">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lIdx} className="h-0.5" />;

        // Parsear **negritas**
        const parts = line.split(/(\*\*[^*]+\*\*)/g);

        return (
          <p key={lIdx} className="text-[#191c1e]">
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={pIdx} className="font-bold text-[#006c49]">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return <span key={pIdx} className="text-[#191c1e]">{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

export function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy el Asistente Oficial de EcoMapa V2.1 🌿. ¿En qué te puedo asesorar sobre nuestra app móvil, el reciclaje inteligente o cómo implementar la plataforma en tu Municipio o Comercio?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const botResponse = await sendLandingMessageToGroq(
        newMessages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: botResponse,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '¡Hola! EcoMapa V2.1 te permite localizar puntos de reciclaje, canjear Ecopuntos por descuentos y coordinar retiros a domicilio. Descarga el APK desde el botón principal o accede al Portal de Gestión.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadApk = () => {
    const link = document.createElement("a");
    link.href = "/downloads/ecomapa.apk";
    link.setAttribute("download", "EcoMapa-v2.1.apk");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] antialiased overflow-x-hidden min-h-screen flex flex-col font-sans selection:bg-[#006c49] selection:text-white">
      
      {/* ── TopAppBar ────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-40 bg-[#f7f9fb]/90 backdrop-blur-md shadow-sm border-b border-[#e0e3e5]/60">
        <div className="flex justify-between items-center px-4 sm:px-8 w-full h-16 max-w-7xl mx-auto">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <img 
              alt="EcoMapa Logo" 
              className="w-9 h-9 rounded-full object-cover shadow-sm border border-[#006c49]/20" 
              src={LOGO_URL} 
            />
            <span className="text-xl font-bold tracking-tight text-[#006c49] flex items-center gap-1.5">
              EcoMapa <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#005236] font-semibold">v2.1</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-7 items-center text-sm font-medium text-[#3c4a42]">
            <a className="hover:text-[#006c49] transition-colors" href="#features">Características</a>
            <a className="hover:text-[#006c49] transition-colors" href="#pickups">Retiros</a>
            <a className="hover:text-[#006c49] transition-colors" href="#rewards">Recompensas</a>
            <a className="hover:text-[#006c49] transition-colors" href="#stats">Estadísticas</a>
            
            <Link 
              to="/login"
              className="text-[#006c49] hover:bg-[#006c49]/10 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border border-[#006c49]/30"
            >
              <Lock className="h-3 w-3" />
              Portal de Gestión
            </Link>

            <button 
              onClick={handleDownloadApk}
              className="bg-[#006c49] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#005236] transition-all shadow-sm flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              Descargar APK
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-[#006c49] p-1.5 rounded-lg hover:bg-black/5"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#f7f9fb] border-b border-[#e0e3e5] px-6 py-4 space-y-3">
            <a onClick={() => setIsMenuOpen(false)} href="#features" className="block text-[#3c4a42] font-medium py-1">Características</a>
            <a onClick={() => setIsMenuOpen(false)} href="#pickups" className="block text-[#3c4a42] font-medium py-1">Retiros a Domicilio</a>
            <a onClick={() => setIsMenuOpen(false)} href="#rewards" className="block text-[#3c4a42] font-medium py-1">Recompensas B2B</a>
            <a onClick={() => setIsMenuOpen(false)} href="#stats" className="block text-[#3c4a42] font-medium py-1">Estadísticas</a>
            <div className="pt-2 flex flex-col gap-2">
              <Link 
                to="/login"
                className="w-full text-center text-[#006c49] border border-[#006c49] py-2 rounded-full font-semibold text-sm"
              >
                Portal de Gestión
              </Link>
              <button 
                onClick={handleDownloadApk}
                className="w-full bg-[#006c49] text-white py-2 rounded-full font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar APK Android
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="flex-grow pt-24 pb-20 md:pb-24">
        
        {/* Hero Section */}
        <section className="px-4 sm:px-8 max-w-7xl mx-auto py-12 md:py-20 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center md:text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#10b981]/20 text-[#005236] text-xs font-semibold border border-[#006c49]/20">
              <Sparkles className="h-3.5 w-3.5 text-[#006c49]" />
              Sostenibilidad Inteligente & Economía Circular
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#191c1e] leading-[1.15]">
              Reciclar bien nunca fue tan fácil
            </h1>

            <p className="text-base sm:text-lg text-[#3c4a42] max-w-2xl mx-auto md:mx-0 leading-relaxed">
              Descubre dónde y cómo reciclar con nuestra <strong>IA integrada</strong> y un <strong>mapa interactivo</strong>. Canjea tus Ecopuntos por <strong>descuentos en comercios</strong> y solicita <strong>retiros de residuos voluminosos</strong> a domicilio.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-3">
              <button 
                onClick={handleDownloadApk}
                className="w-full sm:w-auto bg-[#006c49] text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-[#005236] transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <Download className="h-4 w-4" />
                Descargar APK Android
              </button>

              <button 
                onClick={() => setIsQrModalOpen(true)}
                className="w-full sm:w-auto border border-[#6c7a71]/40 bg-white hover:bg-[#eceef0] px-6 py-3.5 rounded-full font-semibold text-sm text-[#191c1e] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <QrCode className="h-4 w-4 text-[#006c49]" />
                Escanear Código QR
              </button>
            </div>

            <div className="pt-2 flex items-center justify-center md:justify-start gap-5 text-xs text-[#6c7a71]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#006c49]" /> Android 7.0+
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#006c49]" /> 100% Gratuito y Sin Registro Obligatorio
              </span>
            </div>
          </div>

          {/* Hero Image Mockup */}
          <div className="flex-1 relative w-full max-w-md mx-auto">
            <div className="absolute inset-0 bg-[#006c49]/10 rounded-full blur-3xl -z-10 transform scale-110"></div>
            <img 
              alt="App interface preview" 
              className="w-full h-auto object-contain rounded-[2.5rem] shadow-2xl border-4 border-white" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHQL9MehsZs5mBY08D8ODnQ6Xeg8iwM4q9nupAXoXcFkvkkhVXeMl2-hOi4AP6TT_Sm12hKvgBZJPYAzeW3a1XOz6IRbfbO0nY9eVE-h44hFu8NPx9xeY3obhq3wdU4tXiVM9qkHCyiBs-PLowe-15CQIrNLNjdXRx4ojZasN7LvmTqOANNCPMBYC40AI06I2UpmxKE6LWXanw388KZrqNOukyejhSXmd7le98wDEhSlIMkbYiDZNPrA" 
            />
          </div>
        </section>

        {/* ── Bento Grid: Características ─────────────────────────── */}
        <section className="px-4 sm:px-8 max-w-7xl mx-auto py-16 bg-white rounded-[2.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#e0e3e5]/60 my-10" id="features">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#191c1e] tracking-tight">
              Tecnología al servicio del planeta
            </h2>
            <p className="text-sm sm:text-base text-[#3c4a42] max-w-xl mx-auto">
              Nuestras herramientas están diseñadas para hacer que tu experiencia de reciclaje sea intuitiva, rápida y gratificante.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: IA Llama 3 */}
            <div className="bg-[#f7f9fb] rounded-2xl p-7 flex flex-col items-start gap-4 border border-[#e0e3e5] hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#006c49]/5 rounded-bl-full -z-0 group-hover:scale-110 transition-transform"></div>
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 text-[#006c49] flex items-center justify-center shadow-sm z-10">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#191c1e] z-10">IA que responde tus dudas</h3>
              <p className="text-sm text-[#3c4a42] z-10 leading-relaxed">
                Con la potencia de LLaMA 3.3, nuestro asistente inteligente resuelve al instante cualquier pregunta sobre cómo clasificar y preparar tus residuos.
              </p>
            </div>

            {/* Card 2: Mapa */}
            <div className="bg-[#f7f9fb] rounded-2xl p-7 flex flex-col items-start gap-4 border border-[#e0e3e5] hover:shadow-lg transition-all duration-300 relative overflow-hidden group md:col-span-2">
              <div className="w-12 h-12 rounded-xl bg-[#005ac2]/10 text-[#005ac2] flex items-center justify-center shadow-sm z-10">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#191c1e] z-10">Encuentra tu punto más cercano</h3>
              <p className="text-sm text-[#3c4a42] z-10 max-w-xl leading-relaxed">
                Nuestra integración con mapas te permite localizar rápidamente el ecopunto ideal para tus materiales, centros privados con cotización por kilo y puntos oficiales certificados REP.
              </p>
            </div>

            {/* Card 3: Retiros a Domicilio (V2.1) */}
            <div id="pickups" className="bg-[#f7f9fb] rounded-2xl p-7 flex flex-col items-start gap-4 border border-[#e0e3e5] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#005ac2]/15 text-[#005ac2] flex items-center justify-center shadow-sm">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#191c1e]">Retiros a Domicilio 🚛</h3>
              <p className="text-sm text-[#3c4a42] leading-relaxed">
                Solicita la recolección de muebles, escombros, chatarra o ramas directo en tu puerta coordinado con cuadrillas y cooperativas.
              </p>
            </div>

            {/* Card 4: Recompensas B2B (V2.1) */}
            <div id="rewards" className="bg-[#f7f9fb] rounded-2xl p-7 flex flex-col items-start gap-4 border border-[#e0e3e5] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#006c49]/15 text-[#006c49] flex items-center justify-center shadow-sm">
                <Gift className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#191c1e]">Recompensas Reales 🎁</h3>
              <p className="text-sm text-[#3c4a42] leading-relaxed">
                Canjea tus Ecopuntos por cupones de descuento y beneficios tangibles en supermercados y comercios adheridos.
              </p>
            </div>

            {/* Card 5: Marcas REP (V2.1) */}
            <div className="bg-[#f7f9fb] rounded-2xl p-7 flex flex-col items-start gap-4 border border-[#e0e3e5] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shadow-sm">
                <Factory className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#191c1e]">Marcas REP Certificadas</h3>
              <p className="text-sm text-[#3c4a42] leading-relaxed">
                Trazabilidad para pilas, fitosanitarios y electrónicos con programas oficiales de devolución posconsumo.
              </p>
            </div>

          </div>
        </section>

        {/* ── Stats Section ───────────────────────────────────────── */}
        <section className="px-4 sm:px-8 max-w-7xl mx-auto py-12" id="stats">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm border border-[#e0e3e5]">
              <span className="text-4xl sm:text-5xl text-[#006c49] font-bold mb-2">10k+</span>
              <span className="text-xs text-[#6c7a71] uppercase tracking-wider font-semibold">Usuarios Activos</span>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm border border-[#e0e3e5]">
              <span className="text-4xl sm:text-5xl text-[#005ac2] font-bold mb-2">5k+</span>
              <span className="text-xs text-[#6c7a71] uppercase tracking-wider font-semibold">Puntos Registrados</span>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm border border-[#e0e3e5]">
              <span className="text-4xl sm:text-5xl text-[#006c49] font-bold mb-2">50+</span>
              <span className="text-xs text-[#6c7a71] uppercase tracking-wider font-semibold">Tons Recicladas</span>
            </div>
          </div>
        </section>

        {/* ── B2G / B2B SaaS Banner ───────────────────────────────── */}
        <section className="px-4 sm:px-8 max-w-7xl mx-auto py-10">
          <div className="bg-[#006c49] text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold">¿Administras un Municipio o Empresa?</h3>
              <p className="text-emerald-100 text-sm sm:text-base max-w-xl">
                Digitaliza la red pública de puntos, coordina retiros y consulta métricas de impacto ambiental en tiempo real.
              </p>
            </div>
            <Link 
              to="/login"
              className="bg-white text-[#006c49] hover:bg-emerald-50 px-8 py-3.5 rounded-full font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              Acceso a Portal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="bg-[#eceef0] w-full py-8 mt-auto border-t border-[#e0e3e5]">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-3 px-4 text-center">
          <div className="text-lg font-bold text-[#006c49]">EcoMapa</div>
          <p className="text-xs text-[#6c7a71]">© 2026 EcoMapa. Plataforma de Impacto Ambiental — Romero Labs.</p>
        </div>
      </footer>

      {/* ── Modal de Código QR ────────────────────────────────────── */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="bg-white text-[#191c1e] sm:max-w-md text-center rounded-3xl border border-[#e0e3e5]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#006c49] flex items-center justify-center gap-2">
              <QrCode className="h-5 w-5" />
              Escanear con tu Teléfono
            </DialogTitle>
            <DialogDescription className="text-[#3c4a42] text-sm">
              Apunta la cámara de tu celular para descargar e instalar la app de EcoMapa en tu dispositivo Android.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 flex flex-col items-center justify-center gap-4">
            <div className="p-4 bg-white rounded-3xl shadow-lg border border-[#e0e3e5] inline-block">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://ecomapa.org/downloads/ecomapa.apk" 
                alt="QR Code EcoMapa APK" 
                className="w-48 h-48 rounded-xl"
              />
            </div>
            <p className="text-xs text-[#6c7a71] font-medium">
              O descarga el APK haciendo clic en el botón principal.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Floating Chatbot con Logo Oficial ─────────────────────── */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-40 border-2 border-[#006c49] overflow-hidden p-1 ${isChatOpen ? 'hidden' : 'flex'}`}
      >
        <img 
          src={LOGO_URL} 
          alt="EcoMapa Logo" 
          className="w-full h-full rounded-full object-cover" 
        />
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-[340px] sm:w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#e0e3e5] z-50 animate-in slide-in-from-bottom-5">
          
          {/* Chat Header con Logo Oficial */}
          <div className="bg-[#006c49] px-4 py-3.5 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <img 
                src={LOGO_URL} 
                alt="EcoMapa Logo" 
                className="w-7 h-7 rounded-full object-cover border border-white/40 shadow-sm" 
              />
              <div>
                <h3 className="font-bold text-sm leading-tight">Asistente EcoMapa</h3>
                <p className="text-[10px] text-emerald-200">Asesor Oficial V2.1</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#f7f9fb]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs ${msg.role === 'user' ? 'bg-[#005ac2] text-white rounded-br-sm' : 'bg-white border border-[#e0e3e5] text-[#191c1e] shadow-sm rounded-bl-sm space-y-1'}`}>
                  {msg.role === 'assistant' ? (
                    <FormattedMessage text={msg.content} />
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  )}
                  {msg.impact && (
                    <p className="text-[10px] text-[#006c49] font-bold border-t border-[#e0e3e5] pt-1">
                      🌍 {msg.impact}
                    </p>
                  )}
                  {msg.points && (
                    <p className="text-[10px] text-amber-600 font-bold">
                      ✨ +{msg.points} Ecopuntos ganados
                    </p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#e0e3e5] px-3.5 py-2.5 rounded-2xl shadow-sm rounded-bl-sm flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-[#006c49] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#006c49] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1.5 h-1.5 bg-[#006c49] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#e0e3e5] bg-white flex gap-2">
            <input 
              type="text" 
              placeholder="Pregunta sobre EcoMapa..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-[#f2f4f6] rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#006c49] transition-all text-[#191c1e]"
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim() || isLoading}
              className="bg-[#006c49] text-white p-2 rounded-full hover:bg-[#005236] disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
