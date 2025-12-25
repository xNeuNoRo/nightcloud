import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useAppStore } from "@/stores/useAppStore";
import { ToastContainer } from "react-toastify";
import GlobalDropzone from "@/components/upload/GlobalDropzone";
import NodeContextMenu from "@/components/node/NodeContextMenu";

export default function AppLayout() {
  const params = useParams();
  const { setSelectedNodes } = useAppStore();

  useEffect(() => {
    setSelectedNodes([]);
  }, [params, setSelectedNodes]);

  return (
    <>
      {/* Zona de drop global, solamente renderizada en /directory/* y root */}
      <GlobalDropzone />

      <div className="flex h-screen w-full bg-night-main text-night-text overflow-hidden relative font-sans">
        {/* Fondo Aurora */}
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

          <div className="flex-1 flex flex-col overflow-hidden p-8">
            <div className="w-full h-full mx-auto flex flex-col">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      <ToastContainer
        pauseOnHover={true}
        pauseOnFocusLoss={false}
        theme="dark"
        toastClassName={() =>
          "relative grid grid-cols-[auto_1fr_auto] items-center w-full overflow-hidden cursor-pointer rounded-md shadow-lg pr-16 pl-4 py-5 mb-4 bg-night-surface text-night-text border border-night-border"
        }
      />
      <NodeContextMenu />
    </>
  );
}
