import { useAppStore } from "@/stores/useAppStore";

/**
 * @description Hook para manejar el menú contextual
 * @returns {Object} Estado y funciones del menú contextual
 */
export function useContextMenu() {
  const { isOpen, position, openCtx, closeCtx } = useAppStore();

  return {
    isOpen,
    position,
    openCtx,
    closeCtx,
  };
}
