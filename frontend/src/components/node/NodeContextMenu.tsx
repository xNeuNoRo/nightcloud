import { Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef } from "react";
import {
  HiOutlinePencil,
  HiOutlineFolderOpen,
  HiOutlineDuplicate,
  HiOutlineTrash,
} from "react-icons/hi";
import { useNavigate, useLocation } from "react-router-dom";
import { useContextMenu } from "@/hooks/stores/useContextMenu";
import type { NodeType } from "@/types";
import { useContextMenuPayload } from "@/hooks/stores/useContextMenuPayload";
import { useSelectedNodes } from "@/hooks/stores/useSelectedNodes";

export default function NodeContextMenu() {
  const {
    selectedNodes,
    removeSelectedNode,
    addSelectedNodes,
    clearSelectedNodes,
  } = useSelectedNodes();
  const { closeCtx, isOpen, position } = useContextMenu();
  const payload = useContextMenuPayload("node");
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  // Lógica para cerrar si hacen click fuera (Click Outside manual)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeCtx();
        clearSelectedNodes();
      }
    };

    // Solo añadimos el listener si el menú está abierto
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, clearSelectedNodes, closeCtx]);

  const toggleSelect = (selectedNode: NodeType) => {
    if (selectedNodes.some((node) => node.id === selectedNode.id)) {
      removeSelectedNode(selectedNode.id);
    } else {
      addSelectedNodes([selectedNode]);
    }
  };

  const handleAction = (param: string) => {
    if (!payload) return;
    navigate(`${location.pathname}?${param}=${payload.selectedNode.id}`);
    closeCtx();
    toggleSelect(payload.selectedNode);
  };

  // Renderizado condicional simple
  if (!isOpen) return null;

  return (
    // Z-Index alto para asegurar que se vea encima de cualquier cosa
    <div className="fixed inset-0 z-9999 pointer-events-none">
      <button
        className="fixed inset-0 pointer-events-auto bg-transparent"
        onClick={closeCtx}
      />

      <Transition
        as={Fragment}
        show={isOpen}
        appear={true}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-5"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-5"
      >
        <div
          ref={menuRef}
          className="fixed pointer-events-auto w-56 py-2 bg-night-surface border border-night-border rounded-md shadow-2xl focus:outline-none flex flex-col"
          style={{
            top: position.y,
            left: position.x,
          }}
        >
          {payload?.selectedNode && (
            <>
              {/* <div className="px-3 py-2 text-xs border-b border-night-border/50 text-night-muted mb-2 select-none truncate">
                Options:{" "}
                <span className="text-night-text font-medium">
                  {contextMenu.selectedNode.name}
                </span>
              </div> */}

              <div className="flex flex-col px-1 gap-0.5">
                <button
                  onClick={() => handleAction("renameNode")}
                  className="flex items-center w-full px-3 py-1 overflow-hidden text-sm font-semibold leading-6 text-left text-night-text hover:bg-night-border/50 hover:text-white transition-colors rounded-md hover:cursor-pointer"
                >
                  <HiOutlinePencil className="mr-2 text-lg" />
                  Rename
                </button>

                <button
                  onClick={() => handleAction("moveNode")}
                  className="flex items-center w-full px-3 py-1 overflow-hidden text-sm font-semibold leading-6 text-left text-night-text hover:bg-night-border/50 hover:text-white transition-colors rounded-md hover:cursor-pointer"
                >
                  <HiOutlineFolderOpen className="mr-2 text-lg" />
                  Move
                </button>

                <button
                  onClick={() => handleAction("copyNode")}
                  className="flex items-center w-full px-3 py-1 overflow-hidden text-sm font-semibold leading-6 text-left text-night-text hover:bg-night-border/50 hover:text-white transition-colors rounded-md hover:cursor-pointer"
                >
                  <HiOutlineDuplicate className="mr-2 text-lg" />
                  Copy
                </button>

                <div className="my-2 border-t border-night-border/30" />

                <button
                  onClick={() => handleAction("deleteNode")}
                  className="flex items-center w-full px-3 py-1 overflow-hidden text-sm font-semibold leading-6 text-left text-red-400 hover:bg-night-border/50 hover:text-red-300 transition-colors rounded-md hover:cursor-pointer"
                >
                  <HiOutlineTrash className="mr-2 text-lg" />
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      </Transition>
    </div>
  );
}
