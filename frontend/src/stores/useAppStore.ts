import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createNodeSlice, type NodeSliceType } from "./nodeSlice";
import { createUploadSlice, type UploadSliceType } from "./uploadSlice";
import {
  createUploadStaging,
  type UploadStagingType,
} from "./uploadStagingSlice";
import { createListSlice, type ListSliceType } from "./listSlice";
import { createExplorerSlice, type ExplorerSliceType } from "./explorerSlice";
import {
  createBreadcrumbSlice,
  type BreadcrumbSliceType,
} from "./breadcrumbSlice";

export const useAppStore = create<
  NodeSliceType &
    UploadSliceType &
    UploadStagingType &
    ListSliceType &
    ExplorerSliceType &
    BreadcrumbSliceType
>()(
  devtools((...args) => ({
    ...createNodeSlice(...args),
    ...createUploadSlice(...args),
    ...createUploadStaging(...args),
    ...createListSlice(...args),
    ...createExplorerSlice(...args),
    ...createBreadcrumbSlice(...args),
  }))
);
