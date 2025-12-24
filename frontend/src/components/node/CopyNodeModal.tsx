import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../Modal";
import NodeExplorer from "./NodeExplorer";
import { copyNode } from "@/api/NodeAPI";
import { useNode } from "@/hooks/useNode";
import CopyNodeForm from "./CopyNodeForm";
import type { NodeCopyFormData } from "@/types";
import { useForm } from "react-hook-form";
import { useExplorer } from "@/hooks/explorer/useExplorer";
import { useEffect } from "react";

export default function CopyNodeModal() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const queryParams = new URLSearchParams(location.search);
  const nodeId = queryParams.get("copyNode");
  const isOpen = !!nodeId;
  const parentId = location.pathname.split("/").pop() || null; // Obtener el parentId de la URL
  const { selectedFolderId } = useExplorer();
  const { isPlaceholderData, nodeData, nodeDataLoading, nodeDataError } =
    useNode(nodeId || undefined, "node");

  const initialValues: NodeCopyFormData = {
    name: "",
  };

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: initialValues });

  // Setear el nombre inicial del nodo a copiar cuando este disponible luego del fetch
  useEffect(() => {
    if (isPlaceholderData || !nodeData) return;

    reset({
      name: nodeData.name,
    });
  }, [nodeData, reset, isPlaceholderData]);

  const closeModal = () => navigate(location.pathname, { replace: true }); // Remover los query params

  const { mutate } = useMutation({
    mutationFn: (data: NodeCopyFormData) =>
      copyNode(nodeId!, selectedFolderId ?? null, data.name ?? nodeData!.name),
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

      toast.success(`${successOperations} copied successfully`, {
        autoClose: 1000,
      });

      closeModal();
      reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCopyNode = (formData: NodeCopyFormData) => {
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

  // Usar una key dinámica para forzar el remount del formulario cuando el nodeData cambia
  const formKey = `${nodeId}-${isPlaceholderData ? "loading" : "ready"}`;
  return (
    <Modal
      title={`Copy ${nodeData?.isDir ? "Folder" : "File"} ${nodeData?.name}`}
      open={isOpen}
      close={closeModal}
    >
      {nodeDataLoading && <p className="mt-2">Loading...</p>}
      {!nodeDataLoading && nodeData && (
        <form
          className="mt-5 space-y-10"
          noValidate
          onSubmit={handleSubmit(handleCopyNode)}
        >
          <NodeExplorer />
          <CopyNodeForm
            key={formKey}
            register={register}
            errors={errors}
            isDir={nodeData.isDir}
          />
          <input
            type="submit"
            value={`Copy ${nodeData.isDir ? "Folder" : "File"}`}
            className="w-full p-3 font-bold text-white uppercase cursor-pointer transition-colors duration-200 bg-night-primary hover:bg-night-primary-hover rounded-xl"
          />
        </form>
      )}
    </Modal>
  );
}
