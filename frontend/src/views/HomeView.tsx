import FileTable from "@/components/FileTable";
import { FaFolderPlus } from "react-icons/fa";

export default function HomeView() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-2xl font-bold leading-none">My Files</h1>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-3 bg-night-primary hover:bg-night-primary-hover hover:cursor-pointer transition duration-200 rounded-lg py-2 px-4 text-night-text font-semibold">
              <FaFolderPlus size={18} />
              Create Folder
            </button>
          </div>
        </div>
      </div>

      <FileTable />
    </div>
  );
}
