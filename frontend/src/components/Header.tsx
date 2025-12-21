import { FiSearch } from "react-icons/fi";

export default function Header() {
  return (
    <header className="flex justify-between items-center p-6 gap-3 bg-transparent border-b border-night-border z-10">
      <form className="relative w-full">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-night-muted" />
        <input
          type="text"
          className="bg-night-surface border border-night-border rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-night-primary focus:border-transparent w-120 text-night-text placeholder-night-muted"
        />
      </form>

      <div className="flex items-center gap-4">
        
      </div>
    </header>
  );
}
