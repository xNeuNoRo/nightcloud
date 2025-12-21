import type { StateCreator } from "zustand";
import type { NodeType } from "@/types/index";

export type NodeSliceType = {
  selectedNodes: NodeType[];
  setSelectedNodes: (nodes: NodeType[]) => void;
  removeSelectedNode: (nodeId: NodeType["id"]) => void;
  clearSelectedNodes: () => void;
};

export const createNodeSlice: StateCreator<NodeSliceType> = (set) => ({
  selectedNodes: [],
  setSelectedNodes: (nodes) => {
    set((prev) => ({ selectedNodes: [...prev.selectedNodes, ...nodes] }));
  },
  removeSelectedNode: (nodeId: NodeType["id"]) => {
    set((prev) => ({
      selectedNodes: prev.selectedNodes.filter((n) => n.id !== nodeId),
    }));
  },
  clearSelectedNodes: () => {
    set(() => ({ selectedNodes: [] }));
  },
});
