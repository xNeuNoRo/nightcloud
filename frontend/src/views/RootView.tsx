import { FaFolderPlus } from "react-icons/fa";
import FileTable from "@/components/NodeTable";
import { getNodesFromRoot } from "@/api/NodeAPI";
import { useQuery } from "@tanstack/react-query";

export default function DirectoryView() {
  const { data, isLoading, error } = useQuery({
    queryFn: getNodesFromRoot,
    queryKey: ["nodes", "root"],
    retry: 1,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading files.</div>;
  }

  if (!data) {
    return;
  }

  data.sort((a, b) => {
    if (a.isDir === b.isDir) {
      return a.name.localeCompare(b.name);
    }
    return a.isDir ? -1 : 1;
  });

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between h-14 px-4 shrink-0 mb-4">
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
        <FileTable nodes={data} />
      </div>
    </>
  )
}
