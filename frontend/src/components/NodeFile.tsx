import { useMemo } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaFolder } from "react-icons/fa6";
import type { NodeType } from "@/types";
import getHumanFileType from "@/utils/getHumanFileType";
import getHumanFileSize from "@/utils/getHumanFileSize";
import { getCategoryFromMime } from "@/utils/getCategoryFromExtAndMime";
import { FileCategoryIcons } from "@/data/fileCategoryIcons";
import { useAppStore } from "@/stores/useAppStore";

type NodeFileProps = {
  node: NodeType;
};

export default function NodeFile({ node }: Readonly<NodeFileProps>) {
  const {
    selectedNodes,
    setSelectedNodes,
    addSelectedNodes,
    removeSelectedNode,
  } = useAppStore();
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

  return (
    <button
      className={`
        grid grid-cols-[50px_1fr_100px_100px_140px_50px] gap-4 items-center px-4 py-3 rounded-lg transition-all duration-200 group border border-transparent select-none w-full
        ${
          isSelected
            ? "bg-night-primary/10 border-night-primary/20"
            : "hover:bg-night-surface hover:border-night-border/50"
        }
      `}
      onClick={() => setSelectedNodes([node])}
    >
      {/* Checkbox */}
      <div className="flex justify-center">
        <input
          type="checkbox"
          checked={isSelected}
          onClick={(e) => {
            e.stopPropagation();
            toggleSelect(node);
          }}
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
        <span className="text-night-muted font-mono text-sm">2025-12-20</span>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <button className="p-1.5 rounded-full cursor-pointer hover:bg-white/10 text-night-muted hover:text-white transition-colors">
          <BsThreeDots className="text-lg" />
        </button>
      </div>
    </button>
  );
}
