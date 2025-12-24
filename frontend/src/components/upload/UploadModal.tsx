import { useLocation, useNavigate, useParams } from "react-router-dom";
import Modal from "../Modal";
import UploadDropzone from "./UploadDropzone";
import List from "../List";
import { useNode } from "@/hooks/useNode";
import buildNodeDirListOptions from "@/utils/build/buildNodeDirListOptions";
import { FaFolder } from "react-icons/fa6";
import { useUploadFiles } from "@/hooks/useUploadFiles";
import UploadStagingList from "./UploadStagingList";
import { useAppStore } from "@/stores/useAppStore";
import { useMemo } from "react";

export default function ModalDropzone() {
  const location = useLocation();
  const navigate = useNavigate();
  const { nodeId: parentId } = useParams();
  const queryParams = new URLSearchParams(location.search);
  const isOpen = queryParams.get("uploadFiles") === "true";
  const closeModal = () => navigate(location.pathname, { replace: true }); // Limpia los query params
  const stagedFiles = useAppStore((state) => state.stagedFiles);
  const clearStagedFiles = useAppStore((state) => state.clearStagedFiles);
  const uploadLimit = Number(import.meta.env.VITE_API_UPLOAD_FILES_LIMIT) || 10;
  const { mutate } = useUploadFiles(parentId || null);
  const filesToUpload = useMemo(
    () => stagedFiles.map((f) => f.file),
    [stagedFiles]
  );

  // Obtener las carpetas del directorio actual para el select de destino
  const { children } = useNode(parentId || undefined, "children");

  // Si no hay datos de nodos, no renderizar nada
  if (!children.data) return null;

  // Construir las opciones para el select de destino
  const options = [
    { id: parentId ?? "root", icon: FaFolder, name: "Current Directory" },
    ...buildNodeDirListOptions(children.data),
  ];

  const handleOnUpload = () => {
    mutate({ files: filesToUpload });
    closeModal();
    clearStagedFiles();
  };

  return (
    <Modal title="Upload Files" size="large" open={isOpen} close={closeModal}>
      <UploadDropzone />
      <div className="grid grid-cols-1 gap-6 mt-12 text-night-muted text-sm">
        <div className="flex flex-col gap-4">
          <span className="tracking-wider font-semibold">
            Select upload destination:
          </span>
          <List
            options={options}
            defaultOption={options[0]}
            maxHeight="small"
          />
        </div>
        <span className="tracking-wider font-semibold">
          Staged Files for Upload ({stagedFiles.length} / {uploadLimit} files):
        </span>
        <UploadStagingList />

        <button
          className="self-end bg-night-primary hover:bg-night-primary-hover hover:cursor-pointer transition duration-200 rounded-lg py-2 px-4 text-night-text font-semibold disabled:cursor-not-allowed disabled:bg-night-border/80 disabled:opacity-50"
          onClick={handleOnUpload}
          disabled={stagedFiles.length === 0}
        >
          Start Upload
        </button>
      </div>
    </Modal>
  );
}
