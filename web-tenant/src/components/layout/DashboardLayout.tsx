import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout() {
  return (
    <div className="h-screen w-screen flex bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200 print:h-auto print:w-auto print:overflow-visible print:bg-white print:text-black">
      {/* Sidebar fijo (oculto en impresión) */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden print:h-auto print:overflow-visible">
        <div className="print:hidden">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto bg-slate-100/70 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 md:p-8 transition-colors duration-200 print:p-0 print:m-0 print:overflow-visible print:bg-white">
          <div className="mx-auto max-w-7xl print:max-w-none print:w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
