import { FiUpload } from "react-icons/fi";
import { FaFolder, FaTrash } from "react-icons/fa6"; // Iconos para el menú
import Logo from "./Logo";
import { NavLink } from "react-router-dom";
import classNames from "@/utils/classNames";

const menuItems = [
  { icon: FaFolder, label: "My Files", url: "/" },
  { icon: FaTrash, label: "Trash", url: "/trash" },
];

export default function Sidebar() {
  return (
    // Usamos h-full para que ocupe toda la altura del contenedor padre en AppLayout
    <aside className="w-64 h-full bg-night-surface/90 backdrop-blur-md border-r border-night-border p-6 flex flex-col">
      {/* Logo */}
      <Logo />

      {/* Upload Button */}
      <button className="flex items-center justify-center gap-2 bg-night-primary hover:bg-night-primary-hover hover:cursor-pointer transition-all duration-200 rounded-lg py-3 px-4 mt-8 w-full text-night-text font-semibold">
        <FiUpload size={18} />
        Upload Files
      </button>

      {/* Navigation Menu */}
      <nav className="mt-8 flex-1">
        <h3 className="text-xs font-bold text-night-muted uppercase tracking-wider mb-4 px-2">
          Menu
        </h3>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.url}
                className={({ isActive }) =>
                  classNames(
                    isActive
                      ? "bg-night-primary/10 text-night-primary border border-night-primary/20"
                      : "text-night-muted hover:text-night-text hover:bg-white/5",
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 font-medium"
                  )
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Storage Status (Opcional visual) */}
      <div className="mt-auto pt-6 border-t border-night-border">
        <div className="flex justify-between text-xs text-night-muted mb-2 font-mono">
          <span>Storage</span>
          <span>75%</span>
        </div>
        <div className="w-full bg-night-border rounded-full h-1.5 overflow-hidden">
          <div className="bg-night-primary h-full w-3/4 rounded-full shadow-[0_0_10px_var(--color-night-primary)]"></div>
        </div>
      </div>
    </aside>
  );
}
