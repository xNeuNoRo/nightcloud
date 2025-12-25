import { useAppStore } from "@/stores/useAppStore";

/**
 * @description Hook para manejar el menú contextual
 * @returns {Object} Estado y funciones del menú contextual
 */
export function useContextMenu() {
  const { isOpen, position, selectedNode, openContextMenu, closeContextMenu } =
    useAppStore();

  return {
    contextMenu: {
      isOpen,
      position,
      selectedNode,
    },
    openContextMenu,
    closeContextMenu,
  };
}
