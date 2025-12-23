import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Modal from "../Modal";
import CreateFolderForm from "./CreateFolderForm";
import type { NodeFolderFormData } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNodeFolder } from "@/api/NodeAPI";
import { toast } from "react-toastify";

export default function CreateFolderModal() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const queryParams = new URLSearchParams(location.search);
  const isOpen = queryParams.get("createFolder") === "true";
  const closeModal = () => navigate(location.pathname, { replace: true }); // Limpia los query params
  const parentId = location.pathname.split("/").pop() || null; // Obtener el parentId de la URL

  const initialValues: NodeFolderFormData = {
    name: "",
  };

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: initialValues });

  const { mutate } = useMutation({
    mutationFn: (data: NodeFolderFormData) => createNodeFolder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["nodes", parentId ?? "root"],
      });
      closeModal();
      toast.success("Folder created successfully", { autoClose: 1000 });
      reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreateFolder = (formData: NodeFolderFormData) => {
    const data = {
      ...formData,
      parentId,
    };
    mutate(data);
  };

  return (
    <Modal title="Create New Folder" open={isOpen} close={closeModal}>
      <p className="mt-2 text-xl font-semibold text-night-primary">
        Fill the form below to create a new folder.
      </p>
      <form
        className="mt-10 space-y-8"
        onSubmit={handleSubmit(handleCreateFolder)}
        noValidate
      >
        <CreateFolderForm register={register} errors={errors} />
        <input
          type="submit"
          value="Create Folder"
          className="w-full p-3 font-bold text-white uppercase transition-colors cursor-pointer bg-night-primary hover:bg-night-primary-hover rounded-xl"
        />
      </form>
    </Modal>
  );
}
