import { FaFolderPlus } from "react-icons/fa";
import FileTable from "@/components/node/NodeTable";
import CreateFolderModal from "@/components/node/CreateFolderModal";
import { useNavigate } from "react-router-dom";
import UploadModal from "@/components/upload/UploadModal";
import { useNode } from "@/hooks/useNode";
import RenameNodeModal from "@/components/node/RenameNodeModal";
import DeleteNodeModal from "@/components/node/DeleteNodeModal";
import CopyNodeModal from "@/components/node/CopyNodeModal";

export default function DirectoryView() {
  const navigate = useNavigate();
  const openModal = () => navigate(location.pathname + "?createFolder=true");

  const { nodeChildrenData, nodeChildrenLoading, nodeChildrenError } = useNode(
    undefined,
    "children"
  );

  if (nodeChildrenLoading) {
    return <div>Loading...</div>;
  }

  if (nodeChildrenError) {
    return <div>Error loading files.</div>;
  }

  if (!nodeChildrenData) {
    return;
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between h-14 px-4 shrink-0 mb-4">
          <h1 className="text-xl font-bold leading-none">My Files</h1>

          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-3 bg-night-primary hover:bg-night-primary-hover hover:cursor-pointer transition duration-200 rounded-lg py-2 px-4 text-night-text font-semibold"
              onClick={openModal}
            >
              <FaFolderPlus size={18} />
              Create Folder
            </button>
          </div>
        </div>
      </div>

      {/* El contenedor de la tabla crece para ocupar el resto del espacio */}
      <div className="flex-1 min-h-0">
        <FileTable nodes={nodeChildrenData} />
      </div>

      <CreateFolderModal />
      <UploadModal />
      <RenameNodeModal />
      <DeleteNodeModal />
      <CopyNodeModal />
    </>
  );
}
