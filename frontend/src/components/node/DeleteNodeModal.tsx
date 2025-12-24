import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { deleteNode } from "@/api/NodeAPI";
import { useNode } from "@/hooks/useNode";

export default function DeleteNodeModal() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const queryParams = new URLSearchParams(location.search);
  const nodeId = queryParams.get("deleteNode");
  const isOpen = !!nodeId;
  const closeModal = () => navigate(location.pathname, { replace: true }); // Limpia los query params
  const parentId = location.pathname.split("/").pop() || null; // Obtener el parentId de la URL
  const { nodeData, nodeDataLoading, nodeDataError } = useNode(
    nodeId || undefined,
    "node"
  );

  const { mutate } = useMutation({
    mutationFn: () => deleteNode(nodeId!),
    onSuccess: () => {
      // Invalidar la caché para refrescar los datos
      queryClient.invalidateQueries({
        queryKey: ["nodes", parentId ?? "root"],
      });
      queryClient.invalidateQueries({ queryKey: ["nodeDetails", nodeId] });

      closeModal();
      toast.success(
        `${nodeData?.isDir ? "Folder" : "File"} deleted successfully`,
        {
          autoClose: 1000,
        }
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeleteNode = () => {
    mutate();
  };

  if (nodeDataError) {
    toast.error(nodeDataError.message);
    queryClient.invalidateQueries({ queryKey: ["nodeDetails", nodeId] });
    return null;
  }

  return (
    <Modal
      title={`Delete ${nodeData?.isDir ? "Folder" : "File"}`}
      open={isOpen}
      close={closeModal}
    >
      {nodeDataLoading && <p className="mt-2">Loading...</p>}
      {!nodeDataLoading && nodeData && (
        <div className="mt-5 space-y-10">
          <p className="text-night-muted tracking-wider">
            {nodeData.isDir ? (
              <>
                Are you sure you want to delete the folder{" "}
                <span className="font-bold">"{nodeData.name}"</span> and all its
                contents? This action cannot be undone.
              </>
            ) : (
              <>
                Are you sure you want to delete the file{" "}
                <span className="font-bold">{nodeData.name}</span>? This action
                cannot be undone.
              </>
            )}
          </p>
          <button
            onClick={handleDeleteNode}
            className="w-full p-3 font-bold text-white uppercase cursor-pointer transition-colors duration-200 bg-red-500 hover:bg-red-700 rounded-xl"
          >
            {`Delete ${nodeData.isDir ? "Folder" : "File"}`}
          </button>
        </div>
      )}
    </Modal>
  );
}
