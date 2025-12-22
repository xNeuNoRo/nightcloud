import type { NodeFolderFormData } from "@/types";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import ErrorMessage from "../ErrorMessage";
import { FaFolder } from "react-icons/fa6";

type CreateFolderProps = {
  register: UseFormRegister<NodeFolderFormData>;
  errors: FieldErrors<NodeFolderFormData>;
};

export default function CreateFolderForm({
  register,
  errors,
}: Readonly<CreateFolderProps>) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="name"
        className="flex items-center text-lg font-normal leading-2"
      >
        <FaFolder className="inline w-6 h-6 mr-2 text-gray-400" />
        Folder Name
      </label>

      <input
        id="name"
        type="text"
        placeholder="e.g. My Documents"
        className="w-full p-3 border border-night-border rounded-lg bg-night-surface text-night-text focus:outline-none focus:ring-2 focus:ring-night-primary focus:border-transparent placeholder-night-muted"
        {...register("name", {
          required: "Folder name is mandatory",
        })}
      />

      {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
    </div>
  );
}
