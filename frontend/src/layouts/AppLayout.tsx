import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="mx-auto max-w-7xl w-full p-4 mt-10 grow">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}
