import { useMemo } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaFolder } from "react-icons/fa6";
import type { NodeType } from "@/types";
import getHumanFileType from "@/utils/getHumanFileType";
import getHumanFileSize from "@/utils/getHumanFileSize";
import { getCategoryFromMime } from "@/utils/getCategoryFromExtAndMime";
import { FileCategoryIcons } from "@/data/fileCategoryIcons";
import { useAppStore } from "@/stores/useAppStore";
import formatDate from "@/utils/formatDate";

type NodeFileProps = {
  node: NodeType;
};

export default function NodeFile({ node }: Readonly<NodeFileProps>) {
  const { selectedNodes, addSelectedNodes, removeSelectedNode } = useAppStore();
  const isSelected = useMemo(() => {
    return selectedNodes.some((n) => n.id === node.id);
  }, [selectedNodes, node.id]);

  // Determinar el icono del nodo
  const category = getCategoryFromMime(node.mime);
  const Icon = node.isDir ? FaFolder : FileCategoryIcons[category];

  const toggleSelect = (selectedNode: NodeType) => {
    if (selectedNodes.some((node) => node.id === selectedNode.id)) {
      removeSelectedNode(selectedNode.id);
    } else {
      addSelectedNodes([selectedNode]);
    }
  };

  const handleOnClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSelect(node);
  };

  return (
    <div
      className={`
        grid grid-cols-[50px_1fr_100px_100px_140px_50px] gap-4 items-center px-4 py-3 rounded-lg transition-all duration-200 group border border-transparent select-none w-full
        ${
          isSelected
            ? "bg-night-primary/10 border-night-primary/20"
            : "hover:bg-night-surface hover:border-night-border/50"
        }
      `}
    >
      {/* Checkbox */}
      <div className="flex justify-center">
        <input
          type="checkbox"
          defaultChecked={isSelected}
          onClick={handleOnClick}
          className="w-4 h-4 rounded border-night-border bg-night-surface text-night-primary focus:ring-offset-night-main cursor-pointer"
        />
      </div>

      {/* Nombre e Icono */}
      <div className="flex items-center gap-3 overflow-hidden">
        <Icon className="text-xl text-night-muted" />
        <span
          className={`truncate font-medium ${
            isSelected ? "text-white" : "text-night-text"
          }`}
        >
          {node.name}
        </span>
      </div>

      <div className="flex">
        <span className="text-night-muted font-mono text-sm">
          {getHumanFileSize(node.size)}
        </span>
      </div>

      <div className="flex">
        <span className="text-night-muted font-mono text-sm">
          {getHumanFileType(node.mime)}
        </span>
      </div>

      <div className="flex">
        <span className="text-night-muted font-mono text-sm">
          {formatDate(node.updatedAt)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <button className="p-1.5 rounded-full cursor-pointer hover:bg-white/10 text-night-muted hover:text-white transition-colors">
          <BsThreeDots className="text-lg" />
        </button>
      </div>
    </div>
  );
}
