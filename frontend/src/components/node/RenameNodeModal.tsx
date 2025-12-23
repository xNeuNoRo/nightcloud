import type { NodeRenameFormData, NodeType } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { renameNode } from "@/api/NodeAPI";
import { useNode } from "@/hooks/useNode";
import RenameNodeForm from "./RenameNodeForm";

export default function RenameNodeModal() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const queryParams = new URLSearchParams(location.search);
  const nodeId = queryParams.get("renameNode");
  const isOpen = !!nodeId;
  const closeModal = () => navigate(location.pathname, { replace: true }); // Limpia los query params
  const parentId = location.pathname.split("/").pop() || null; // Obtener el parentId de la URL
  const { nodeData, nodeDataLoading, nodeDataError } = useNode(
    nodeId || undefined,
    "node"
  );

  const initialValues: NodeRenameFormData = {
    name: "",
  };

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: initialValues });

  const { mutate } = useMutation({
    mutationFn: (data: NodeRenameFormData & { nodeId: NodeType["id"] }) =>
      renameNode(data),
    onSuccess: (data) => {
      // Actualizar la caché de React Query

      // Actualizar el nombre en la lista de nodos hijos
      queryClient.setQueryData(
        ["nodes", parentId ?? "root"],
        (oldData: NodeType[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((node) =>
            node.id === data.id ? { ...node, name: data.name } : node
          );
        }
      );

      // Actualizar el nombre del nodo detallado
      queryClient.setQueryData(
        ["nodeDetails", nodeId],
        (oldData: NodeType | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, name: data.name };
        }
      );

      // Invalidar la caché de la lista de nodos para recargar en segundo plano (Optimistic Update)
      queryClient.invalidateQueries({
        queryKey: ["nodes", parentId ?? "root"],
      });
      queryClient.invalidateQueries({ queryKey: ["nodeDetails", nodeId] });

      closeModal();
      toast.success(`${data.isDir ? "Folder" : "File"} renamed successfully`);
      reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleRenameNode = (formData: NodeRenameFormData) => {
    const data = {
      ...formData,
      nodeId: nodeId!,
    };
    mutate(data);
  };

  if (nodeDataError)
    return (
      <Modal title="Error" open={isOpen} close={closeModal}>
        <p className="mt-2 text-red-600">
          Error loading node data: {nodeDataError.message}
        </p>
      </Modal>
    );

  if (!nodeData || nodeDataLoading) return null;

  return (
    <Modal
      title={`Rename ${nodeData.isDir ? "Folder" : "File"}`}
      open={isOpen}
      close={closeModal}
    >
      <form
        className="mt-10 space-y-8"
        onSubmit={handleSubmit(handleRenameNode)}
        noValidate
      >
        <RenameNodeForm register={register} errors={errors} node={nodeData} />
        <input
          type="submit"
          value={`Rename ${nodeData.isDir ? "Folder" : "File"}`}
          className="w-full p-3 font-bold text-white uppercase transition-colors cursor-pointer bg-night-primary hover:bg-night-primary-hover rounded-xl"
        />
      </form>
    </Modal>
  );
}
