import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex flex-col w-full grow">
        <Header />

        <main className="w-full p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
