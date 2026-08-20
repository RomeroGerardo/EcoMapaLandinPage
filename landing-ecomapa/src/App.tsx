import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X } from 'lucide-react';
import { sendMessageToGroq, type ChatMessage } from './chatService';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '¡Hola! Soy el asistente de EcoMapa. ¿En qué te puedo ayudar sobre el reciclaje inteligente?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: inputValue.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const botResponseContent = await sendMessageToGroq([...messages.filter(m => m.role !== 'system'), userMsg]);
    
    setMessages(prev => [...prev, { role: 'assistant', content: botResponseContent }]);
    setIsLoading(false);
  };

  return (
    <div className="bg-background text-on-background font-body-md antialiased overflow-x-hidden min-h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-40 bg-surface/90 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center px-container-padding-mobile w-full h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <img alt="EcoMapa Logo" className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbRG1E0F5y0GB8eGnGMwcGyUkk88Th5QCTccyJ28rmI1gXs6qG7S-t9vd6kHfLPRhSr-A_Xd9xthgLQ8MuNojblJpGcYbkVI-hIrQF1B5lbQDavUvvKrOyO_2A2y8e79iNdDZu4IL22UGKkUFUFw5mxmXs8GflvxMfQJurLpz3M7xgCbmDZMOhm-M_LEPiwr79FlSCOShcnvHaHP1GM-LcKSeXfSjkT7fsNTr2h8LIbnKfyfXYcDb_PXAqerOOXN-4qa8" />
            <span className="font-headline-md text-headline-md-mobile font-bold text-primary">EcoMapa</span>
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            <a className="text-on-surface-variant hover:text-primary-container transition-colors font-label-md text-label-md" href="#features">Características</a>
            <a className="text-on-surface-variant hover:text-primary-container transition-colors font-label-md text-label-md" href="#stats">Estadísticas</a>
            <a className="bg-primary text-on-primary px-4 py-2 rounded-full font-label-md text-label-md hover:bg-primary/90 transition-colors shadow-sm" href="#download">Descargar App</a>
          </nav>
          <button className="md:hidden text-primary">
            <span className="material-symbols-outlined" translate="no">menu</span>
          </button>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-32 md:pb-24">
        {/* Hero Section */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop max-w-7xl mx-auto py-12 md:py-20 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/20 text-primary-fixed-variant font-label-sm text-label-sm border border-primary/20">
              <span className="material-symbols-outlined text-[16px]">eco</span>
              Sostenibilidad inteligente
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface font-bold tracking-tight">Reciclar bien nunca fue tan fácil</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto md:mx-0">
              Descubre dónde y cómo reciclar con nuestra IA integrada y un mapa interactivo. Únete a la comunidad de EcoMapa y convierte el reciclaje en un hábito gratificante.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-4">
              <button className="w-full sm:w-auto bg-primary text-on-primary px-8 py-3 rounded-full font-label-md text-label-md hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2">
                <span className="material-symbols-outlined" translate="no">download</span>
                Descargar
              </button>
              <button className="w-full sm:w-auto border border-outline px-8 py-3 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant/50 transition-colors flex items-center justify-center gap-2">
                Ver Mapa
                <span className="material-symbols-outlined" translate="no">map</span>
              </button>
            </div>
          </div>
          <div className="flex-1 relative w-full max-w-md mx-auto">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl -z-10 transform scale-110"></div>
            <img alt="App interface preview" className="w-full h-auto object-contain rounded-[2.5rem] shadow-2xl border-4 border-surface-container-lowest" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHQL9MehsZs5mBY08D8ODnQ6Xeg8iwM4q9nupAXoXcFkvkkhVXeMl2-hOi4AP6TT_Sm12hKvgBZJPYAzeW3a1XOz6IRbfbO0nY9eVE-h44hFu8NPx9xeY3obhq3wdU4tXiVM9qkHCyiBs-PLowe-15CQIrNLNjdXRx4ojZasN7LvmTqOANNCPMBYC40AI06I2UpmxKE6LWXanw388KZrqNOukyejhSXmd7le98wDEhSlIMkbYiDZNPrA" />
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop max-w-7xl mx-auto py-16 bg-surface-container-lowest rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] my-section-gap" id="features">
          <div className="text-center mb-12">
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-4">Tecnología al servicio del planeta</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">Nuestras herramientas están diseñadas para hacer que tu experiencia de reciclaje sea intuitiva, rápida y educativa.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface rounded-2xl p-6 md:p-8 flex flex-col items-start gap-4 border border-surface-variant/50 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0 group-hover:scale-110 transition-transform"></div>
              <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-sm z-10">
                <span className="material-symbols-outlined" translate="no">chat_bubble</span>
              </div>
              <h3 className="font-headline-md text-headline-md-mobile text-on-surface z-10">IA que responde tus dudas</h3>
              <p className="font-body-md text-body-md text-on-surface-variant z-10">
                Con la potencia de LLaMA 3.3, nuestro asistente inteligente resuelve al instante cualquier pregunta sobre cómo clasificar y preparar tus residuos.
              </p>
            </div>
            <div className="bg-surface rounded-2xl p-6 md:p-8 flex flex-col items-start gap-4 border border-surface-variant/50 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group md:col-span-2">
              <div className="absolute inset-0 bg-cover bg-center opacity-5"></div>
              <div className="w-12 h-12 rounded-xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center shadow-sm z-10">
                <span className="material-symbols-outlined" translate="no">location_on</span>
              </div>
              <h3 className="font-headline-md text-headline-md-mobile text-on-surface z-10">Encuentra tu punto más cercano</h3>
              <p className="font-body-md text-body-md text-on-surface-variant z-10 max-w-lg">
                Nuestra integración con mapas te permite localizar rápidamente el ecopunto ideal para tus materiales, optimizando tu ruta y tiempo.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop max-w-7xl mx-auto py-16 my-section-gap" id="stats">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant/30">
              <span className="font-display-lg text-display-lg text-primary font-bold mb-2">10k+</span>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Usuarios Activos</span>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant/30">
              <span className="font-display-lg text-display-lg text-tertiary font-bold mb-2">5k+</span>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Puntos Registrados</span>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant/30">
              <span className="font-display-lg text-display-lg text-primary-fixed-dim font-bold mb-2">50</span>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Tons Recicladas</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-surface-container-low w-full py-8 mb-20 md:mb-0 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 px-container-padding-mobile text-center">
          <div className="font-headline-md text-headline-md text-primary font-bold">EcoMapa</div>
          <p className="font-label-md text-label-md text-on-surface-variant mt-4">© 2026 EcoMapa. Empowered Environmentalism.</p>
        </div>
      </footer>

      {/* Floating Chat Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-[100px] md:bottom-6 right-6 w-16 h-16 bg-primary rounded-full shadow-xl flex items-center justify-center text-on-primary hover:scale-105 transition-transform z-40 ${isChatOpen ? 'hidden' : 'flex'}`}
      >
        <Bot size={28} />
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-[100px] md:bottom-6 right-6 w-[350px] md:w-[400px] h-[550px] bg-surface-container-lowest rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden border border-outline-variant z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-primary px-4 py-4 flex items-center justify-between text-on-primary">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h3 className="font-semibold">Asistente EcoMapa</h3>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-surface">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${msg.role === 'user' ? 'bg-tertiary text-on-tertiary rounded-br-sm' : 'bg-surface-container-lowest border border-outline-variant text-on-surface shadow-sm rounded-bl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-container-lowest border border-outline-variant px-4 py-2.5 rounded-2xl shadow-sm rounded-bl-sm flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-secondary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-outline-variant bg-surface-container-lowest flex gap-2">
            <input 
              type="text" 
              placeholder="Pregunta sobre EcoMapa..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-surface-container-low rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-on-surface"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="bg-primary text-on-primary p-2.5 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
