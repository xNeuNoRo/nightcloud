import { FaArrowUp } from "react-icons/fa6";
import type { NodeType, SortDirection } from "@/types";
import { useAppStore } from "@/stores/useAppStore";
import NodeDir from "@/components/node/NodeDir";
import NodeFile from "@/components/node/NodeFile";
import { toggleNameDirection } from "@/utils/node/sortNodes";
import classNames from "@/utils/classNames";
import { useMemo, useState } from "react";

// TODO: Adaptar el backend para los favoritos, fecha de creacion y modificacion.

type NodeTableProps = {
  nodes: NodeType[];
};

export default function NodeTable({ nodes }: Readonly<NodeTableProps>) {
  const [direction, setDirection] = useState<SortDirection>("asc");
  const { selectedNodes, setSelectedNodes, clearSelectedNodes } = useAppStore();

  // Nodos ordenados segun la direccion
  const sortedNodes = useMemo(() => {
    return toggleNameDirection(direction, [...nodes]);
  }, [nodes, direction]);

  // Alternar la direccion de ordenamiento
  const toggleDirection = () => {
    setDirection((d) => (d === "asc" ? "desc" : "asc"));
  };

  // Alternar seleccion de todos los nodos
  const toggleSelectAll = () => {
    if (selectedNodes.length === nodes.length) {
      clearSelectedNodes();
    } else {
      setSelectedNodes(nodes);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header Tabla - shrink-0 para que no se encoja al hacer scroll */}
      <div className="shrink-0 grid grid-cols-[50px_1fr_100px_100px_180px_50px] gap-4 items-center px-4 py-3 text-xs font-semibold text-night-muted uppercase tracking-wider border-b border-night-border z-10">
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={selectedNodes.length === nodes.length && nodes.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-night-border bg-night-surface text-night-primary focus:ring-offset-night-main cursor-pointer"
          />
        </div>
        <button
          type="button"
          onClick={toggleDirection}
          className="flex items-center gap-2 cursor-pointer hover:text-night-text font-sans transition-colors group"
        >
          <span className="text-xs font-semibold text-night-muted uppercase tracking-wider">
            Name
          </span>
          <FaArrowUp
            className={classNames(
              direction === "asc" ? "rotate-0" : "rotate-180",
              "opacity-60 group-hover:opacity-100 transition-all text-[10px] transform duration-300"
            )}
          />
        </button>
        <div>Size</div>
        <div>Type</div>
        <div>Last modified</div>
      </div>

      {/* Filas */}
      <div className="flex-1 overflow-y-auto mt-2 space-y-1 scrollbar-thin scrollbar-thumb-night-border scrollbar-track-transparent pb-2">
        {sortedNodes.length > 0 ? (
          sortedNodes.map((node) => {
            return node.isDir ? (
              <NodeDir key={node.id} node={node} />
            ) : (
              <NodeFile key={node.id} node={node} />
            );
          })
        ) : (
          <div className="text-center text-night-muted text-xl mt-20">
            No files found
          </div>
        )}
      </div>
    </div>
  );
}
