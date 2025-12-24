import type { NodeMoveFormData } from "@/types";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import ErrorMessage from "../ErrorMessage";
import { HiOutlinePencil } from "react-icons/hi";

type CreateFolderProps = {
  register: UseFormRegister<NodeMoveFormData>;
  errors: FieldErrors<NodeMoveFormData>;
};

export default function MoveNodeForm({
  register,
  errors,
}: Readonly<CreateFolderProps>) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="name" className="flex items-center gap-3">
        <HiOutlinePencil className="w-5 h-5 text-night-muted" />
        <span className="tracking-wider text-md font-bold text-night-text">
          New folder name
        </span>
      </label>
      <input
        id="name"
        type="text"
        placeholder="e.g. My Moved Folder"
        className="w-full p-3 border border-night-border rounded-lg bg-night-surface text-night-text focus:outline-none focus:ring-2 focus:ring-night-primary focus:border-transparent placeholder-night-muted"
        {...register("name", {
          required: "New folder name is mandatory",
        })}
      />

      {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
    </div>
  );
}
