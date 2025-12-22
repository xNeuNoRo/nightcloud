import { Link, useNavigate, useParams } from "react-router-dom";
import { FaFolderPlus } from "react-icons/fa";
import FileTable from "@/components/node/NodeTable";
import buildBreadcrumbs from "@/utils/buildBreadcrumbs";
import { useNode } from "@/hooks/useNode";
import Breadcrumb from "@/components/Breadcrumb";
import CreateFolderModal from "@/components/node/CreateFolderModal";

export default function DirectoryView() {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  const openModal = () => navigate(location.pathname + "?createFolder=true");

  const {
    nodeData,
    nodeLoading,
    nodeError,
    ancestorsData,
    ancestorsLoading,
    ancestorsError,
  } = useNode(nodeId, { includeAncestors: true });

  if (!nodeId) {
    return <div>No directory specified</div>;
  }

  if (nodeLoading || ancestorsLoading) {
    return <div>Loading...</div>;
  }

  if (nodeError || ancestorsError || !nodeData || !ancestorsData) {
    return <div>Error loading files</div>;
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between h-14 px-4 shrink-0 mb-4">
          <div className="text-xl font-bold leading-none">
            <Link to={`/`} className="hover:underline">
              My Files
            </Link>
            {" > "}
            {buildBreadcrumbs(nodeId, ancestorsData).map((n, i) => {
              if (i < ancestorsData.length - 1) {
                return <Breadcrumb key={n.id} n={n} />;
              }
              return <span key={n.id}>{n.name}</span>;
            })}
          </div>

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
        <FileTable nodes={nodeData} />
      </div>

      <CreateFolderModal />
    </>
  );
}
