import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    // bg-night-main usa tu variable --color-night-main
    <div className="flex h-screen w-full bg-night-main text-night-text overflow-hidden relative font-sans">
      
      {/* Fondo Aurora usando tus colores primarios y secundarios */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[0%] w-125 h-125 bg-night-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[0%] w-125 h-125 bg-night-success/5 rounded-full blur-[100px]" />
      </div>

      {/* Sidebar fijo a la izquierda */}
      <div className="relative z-10 hidden md:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col relative z-10 min-w-0 h-full">
        <Header />
        
        {/* Scroll solo en este contenedor */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-night-border scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
