import type { NodeFolderFormData, NodeType } from "@/types";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import ErrorMessage from "../ErrorMessage";
import { getCategoryFromMime } from "@/utils/files/getCategoryFromExtAndMime";
import { FileCategoryIcons } from "@/data/fileCategoryIcons";
import { FaFolder } from "react-icons/fa6";

type CreateFolderProps = {
  register: UseFormRegister<NodeFolderFormData>;
  errors: FieldErrors<NodeFolderFormData>;
  node: NodeType;
};

export default function RenameNodeForm({
  register,
  errors,
  node,
}: Readonly<CreateFolderProps>) {
  const category = getCategoryFromMime(node.mime);
  const Icon = node.isDir ? FaFolder : FileCategoryIcons[category];
  const nodeLabel = node.isDir ? "folder" : "file";

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="name"
        className="flex items-center text-lg font-normal leading-2"
      >
        <Icon className="inline w-6 h-6 mr-2 text-gray-400" />
        New {nodeLabel} Name
      </label>

      <input
        id="name"
        type="text"
        placeholder="e.g. new_photos"
        className="w-full p-3 border border-night-border rounded-lg bg-night-surface text-night-text focus:outline-none focus:ring-2 focus:ring-night-primary focus:border-transparent placeholder-night-muted"
        {...register("name", {
          required: `${nodeLabel} name is mandatory`,
        })}
      />

      {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
    </div>
  );
}
