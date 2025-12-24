import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FaFolderPlus } from "react-icons/fa";
import FileTable from "@/components/node/NodeTable";
import buildBreadcrumbs from "@/utils/build/buildBreadcrumbs";
import { useNode } from "@/hooks/useNode";
import Breadcrumb from "@/components/Breadcrumb";
import CreateFolderModal from "@/components/node/CreateFolderModal";
import UploadModal from "@/components/upload/UploadModal";
import RenameNodeModal from "@/components/node/RenameNodeModal";
import DeleteNodeModal from "@/components/node/DeleteNodeModal";
import CopyNodeModal from "@/components/node/CopyNodeModal";
import { getVisibleBreadcrumbs } from "@/utils/getVisibleBreadcrums";
import { HiArrowLeft } from "react-icons/hi";
import MoveNodeModal from "@/components/node/MoveNodeModal";

export default function DirectoryView() {
  const location = useLocation();
  const isRootPath = location.pathname === "/";
  const { nodeId } = useParams();
  const navigate = useNavigate();
  const openModal = () => navigate(location.pathname + "?createFolder=true");

  const { children, ancestors } = useNode(nodeId, "children+ancestors");

  if (!nodeId) {
    return <div>No directory specified</div>;
  }

  if (children.loading || ancestors.loading) {
    return <div>Loading...</div>;
  }

  if (
    children.error ||
    ancestors.error ||
    !children.data ||
    !ancestors.data
  ) {
    return <div>Error loading files</div>;
  }

  // Construir los breadcrums visibles
  const breadcrums = [...buildBreadcrumbs(nodeId, ancestors.data)];
  // Obtener los breadcrums visibles con elipsis si es necesario
  const { items: visibleBreadcrumbs, hasEllipsis } = getVisibleBreadcrumbs(
    breadcrums,
    2
  );

  const handleGoBack = () => {
    if (ancestors.data?.length === 0) {
      navigate(`/`);
    } else {
      // Navegar al padre inmediato
      const parent = ancestors.data?.find((a) => a.id === nodeId);

      // SI no hay padre, navegar al root
      if (!parent?.parentId) return navigate("/");

      // Navegar al parentId del nodo actual
      navigate(`/directory/${parent.parentId}`);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between h-14 px-4 shrink-0 mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              disabled={isRootPath}
              className="flex items-center gap-1 bg-night-primary hover:bg-night-primary-hover hover:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed p-1 px-2 rounded-lg transition-colors duration-150"
            >
              <HiArrowLeft className="w-4 h-4 text-night-text" />
            </button>
            <div className="flex items-center gap-1 text-xl font-bold leading-none">
              <Link to={`/`} className="hover:underline">
                My Files
              </Link>
              {" > "}
              {visibleBreadcrumbs.map((n, i) => {
                const showEllipsis = hasEllipsis && i === 2; // si es el segundo elemento y hay elipsis
                if (showEllipsis) {
                  return (
                    <span key="ellipsis" className="mx-1">
                      ... {"  >"}
                    </span>
                  );
                }
                if (i < visibleBreadcrumbs.length - 1) {
                  return <Breadcrumb key={n.id} n={n} />;
                }
                return <span key={n.id}>{n.name}</span>;
              })}
            </div>
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
        <FileTable nodes={children.data} />
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
