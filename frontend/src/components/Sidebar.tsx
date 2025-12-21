import { CiCloudOn } from "react-icons/ci";
import { FiUpload } from "react-icons/fi";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-night-surface border-r border-night-border p-6">
      <div className="flex items-center">
        <CiCloudOn
          size={48}
          className="text-4xl text-night-primary filter drop-shadow-[2px_2px_3px_var(--color-night-primary)]"
        />
        <span className="ml-2 text-2xl font-bold text-night-primary text-shadow-[2px_2px_10px_var(--color-night-primary)] font-display">
          NightCloud
        </span>
      </div>
      <button className="bg-night-primary hover:bg-night-primary-hover hover:cursor-pointer transition duration-200 rounded-lg py-2 px-4 mt-6 w-full text-night-text font-semibold">
        <FiUpload size={16} className="inline mr-2 mb-1" />
        Upload Files
      </button>
    </aside>
  );
}
