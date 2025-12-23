import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createNodeSlice, type NodeSliceType } from "./nodeSlice";
import { createUploadSlice, type UploadSliceType } from "./uploadSlice";
import {
  createUploadStaging,
  type UploadStagingType,
} from "./uploadStagingSlice";
import { createListSlice, type ListSliceType } from "./listSlice";

export const useAppStore = create<
  NodeSliceType & UploadSliceType & UploadStagingType & ListSliceType
>()(
  devtools((...args) => ({
    ...createNodeSlice(...args),
    ...createUploadSlice(...args),
    ...createUploadStaging(...args),
    ...createListSlice(...args),
  }))
);
