import { useMemo } from "react";
import { FaFolder } from "react-icons/fa6";
import type { NodeType } from "@/types";
import getHumanFileType from "@/utils/files/getHumanFileType";
import getHumanFileSize from "@/utils/files/getHumanFileSize";
import { Link } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import formatDate from "@/utils/formatDate";
import classNames from "@/utils/classNames";
import NodeActions from "./NodeActions";
import { useContextMenu } from "@/hooks/stores/useContextMenu";

type NodeDirProps = {
  node: NodeType;
};

export default function NodeDir({ node }: Readonly<NodeDirProps>) {
  const { selectedNodes, addSelectedNodes, removeSelectedNode } = useAppStore();
  const { openContextMenu } = useContextMenu();
  const isSelected = useMemo(() => {
    return selectedNodes.some((n) => n.id === node.id);
  }, [selectedNodes, node.id]);

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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu(e.clientX, e.clientY, node);
  };

  return (
    <li
      onContextMenu={handleContextMenu}
      className={classNames(
        isSelected
          ? "bg-night-primary/10 border-night-primary/20"
          : "hover:bg-night-surface hover:border-night-border/50",
        "relative z-10 grid grid-cols-[50px_1fr_100px_100px_180px_50px] gap-4 items-center px-4 py-3 rounded-lg transition-all duration-200 group border border-transparent cursor-default w-full hover:cursor-pointer"
      )}
    >
      <Link
        to={`/directory/${node.id}`}
        className="absolute inset-0 z-20"
        aria-label={`Open ${node.name}`}
      />
      {/* Checkbox */}
      <div className="flex justify-center">
        <input
          type="checkbox"
          checked={isSelected}
          onClick={handleOnClick}
          className="z-30 w-4 h-4 rounded border-night-border bg-night-surface text-night-primary focus:ring-offset-night-main cursor-pointer"
          readOnly
        />
      </div>

      {/* Nombre e Icono */}
      <div className="flex items-center gap-3 overflow-hidden">
        <FaFolder className="text-xl text-night-primary shrink-0" />
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
      <div className="flex z-30 justify-end">
        <NodeActions node={node} />
      </div>
    </li>
  );
}
