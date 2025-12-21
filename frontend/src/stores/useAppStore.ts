import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createNodeSlice, type NodeSliceType } from "./nodeSlice";

export const useAppStore = create<NodeSliceType>()(
  devtools((...args) => ({
    ...createNodeSlice(...args),
  }))
);
