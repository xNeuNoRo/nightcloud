import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../Modal";
import NodeExplorer from "./NodeExplorer";
import { moveNode } from "@/api/NodeAPI";
import { useNode } from "@/hooks/useNode";
import MoveNodeForm from "./MoveNodeForm";
import type { NodeMoveFormData } from "@/types";
import { useForm } from "react-hook-form";
import { useExplorer } from "@/hooks/explorer/useExplorer";

export default function MoveNodeModal() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const queryParams = new URLSearchParams(location.search);
  const nodeId = queryParams.get("moveNode");
  const isOpen = !!nodeId;
  const parentId = location.pathname.split("/").pop() || null; // Obtener el parentId de la URL
  const { selectedFolderId } = useExplorer();
  const { nodeData, nodeDataLoading, nodeDataError } = useNode(
    nodeId || undefined,
    "node"
  );

  const initialValues: NodeMoveFormData = {
    name: "",
  };

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: initialValues });

  const closeModal = () => navigate(location.pathname, { replace: true }); // Remover los query params

  const { mutate } = useMutation({
    mutationFn: (data: NodeMoveFormData) =>
      moveNode(nodeId!, selectedFolderId ?? null, data.name),
    onSuccess: (data) => {
      // mensaje de éxito
      const nodesAffected = Array.isArray(data) ? data.length : 1;
      const successOperations = nodeData?.isDir
        ? `${nodesAffected} Folder(s)`
        : `${nodesAffected} File(s)`;

      // Invalidar la caché para refrescar los datos
      queryClient.invalidateQueries({
        queryKey: ["nodes", parentId ?? "root"],
      });
      queryClient.invalidateQueries({ queryKey: ["cloudStats"] });

      toast.success(`${successOperations} moved successfully`, {
        autoClose: 1000,
      });
      closeModal();

      reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleMoveNode = (formData: NodeMoveFormData) => {
    const data = {
      ...formData,
    };
    mutate(data);
  };

  if (nodeDataError) {
    toast.error(nodeDataError.message);
    queryClient.invalidateQueries({ queryKey: ["nodeDetails", nodeId] });
    return null;
  }

  return (
    <Modal
      title={`Move ${nodeData?.isDir ? "Folder" : "File"} ${nodeData?.name}`}
      open={isOpen}
      close={closeModal}
    >
      {nodeDataLoading && <p className="mt-2">Loading...</p>}
      {!nodeDataLoading && nodeData && (
        <form
          className="mt-5 space-y-10"
          noValidate
          onSubmit={handleSubmit(handleMoveNode)}
        >
          <NodeExplorer />
          <MoveNodeForm register={register} errors={errors} />
          <input
            type="submit"
            value={`Move ${nodeData.isDir ? "Folder" : "File"}`}
            className="w-full p-3 font-bold text-white uppercase cursor-pointer transition-colors duration-200 bg-night-primary hover:bg-night-primary-hover rounded-xl"
          />
        </form>
      )}
    </Modal>
  );
}
