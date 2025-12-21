import FileTable from "@/components/FileTable";
import { FaFolderPlus } from "react-icons/fa";

export default function HomeView() {
  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between h-14 px-4 shrink-0">
        <h1 className="text-xl font-bold leading-none">My Files</h1>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-3 bg-night-primary hover:bg-night-primary-hover hover:cursor-pointer transition duration-200 rounded-lg py-2 px-4 text-night-text font-semibold">
              <FaFolderPlus size={18} />
              Create Folder
            </button>
          </div>
        </div>
      </div>

      {/* El contenedor de la tabla crece para ocupar el resto del espacio */}
      <div className="flex-1 min-h-0">
        <FileTable />
      </div>

      {/* El contenedor de la tabla crece para ocupar el resto del espacio */}
      <div className="flex-1 min-h-0">
        <FileTable/>
      </div>

      {/* El contenedor de la tabla crece para ocupar el resto del espacio */}
      <div className="flex-1 min-h-0">
        <FileTable/>
      </div>
    </div>
  );
}