import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaFolderPlus } from "react-icons/fa";
import type { NodeType } from "@/types";
import FileTable from "@/components/FileTable";
import { getNodesFromDir, getNodesFromRoot } from "@/api/NodeAPI";

export default function HomeView() {
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const { nodeId } = useParams();

  useEffect(() => {
    const getNodes = async () => {
      setNodes(nodeId ? await getNodesFromDir(nodeId) : await getNodesFromRoot());
    }

    getNodes();
  }, [nodeId]);

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
        <FileTable nodes={nodes}/>
      </div>
    </>
  );
}
