import { FaFolderPlus } from "react-icons/fa";
import NodeTable from "@/components/node/NodeTable";
import CreateFolderModal from "@/components/node/modal/CreateFolderModal";
import { useNavigate } from "react-router-dom";
import UploadModal from "@/components/upload/UploadModal";
import { useNode } from "@/hooks/useNode";
import RenameNodeModal from "@/components/node/modal/RenameNodeModal";
import DeleteNodeModal from "@/components/node/modal/DeleteNodeModal";
import CopyNodeModal from "@/components/node/modal/CopyNodeModal";
import MoveNodeModal from "@/components/node/modal/MoveNodeModal";

export default function DirectoryView() {
  const navigate = useNavigate();
  const openModal = () => navigate(location.pathname + "?createFolder=true");

  const { children } = useNode(undefined, "children");

  if (children.loading) {
    return <div>Loading...</div>;
  }

  if (children.error) {
    return <div>Error loading files.</div>;
  }

  if (!children.data) {
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
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <NodeTable nodes={children.data} />
      </div>

      <CreateFolderModal />
      <UploadModal />
      <RenameNodeModal />
      <DeleteNodeModal />
      <CopyNodeModal />
      <MoveNodeModal />
    </>
  );
}
