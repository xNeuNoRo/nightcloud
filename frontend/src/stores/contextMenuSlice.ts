import type { NodeType } from "@/types";
import type { StateCreator } from "zustand";

export type ContextMenuSliceType = {
  isOpen: boolean;
  position: { x: number; y: number };
  selectedNode: NodeType | null;
  openContextMenu: (x: number, y: number, node: NodeType) => void;
  closeContextMenu: () => void;
};

export const createContextMenuSlice: StateCreator<ContextMenuSliceType> = (
  set
) => ({
  // Estado inicial
  isOpen: false,
  position: { x: 0, y: 0 },
  selectedNode: null,

  // Abrir el menú contextual en la posición (x, y) para el nodo dado
  openContextMenu(x, y, node) {
    set(() => ({
      isOpen: true,
      position: { x, y },
      selectedNode: node,
    }));
  },

  // Cerrar el menú contextual
  closeContextMenu() {
    set((prev) => ({
      ...prev,
      isOpen: false,
    }));
  },
});
