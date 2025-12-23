import type { StateCreator } from "zustand";

export type UploadSliceType = {
  isUploading: boolean;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  controller: AbortController | null;
  setProgress: (p: number) => void;
  setController: (c: AbortController) => void;
  start: () => void;
  cancel: () => void;
  finish: () => void;
  fail: () => void;
  reset: () => void;
};

export const createUploadSlice: StateCreator<UploadSliceType> = (set, get) => ({
  isUploading: false,
  progress: 0,
  status: "idle",
  controller: null,
  setProgress: (p: number) => {
    set({ progress: p });
  },
  setController: (controller) => {
    set({ controller });
  },
  start: () => {
    set({ isUploading: true, status: "uploading" });
  },
  cancel: () => {
    // Abortar la subida si hay un controlador
    const controller = get().controller;
    // Si existe, abortar la petición
    if (controller) {
      controller.abort();
    }
    // Resetear el estado de la subida
    set({ isUploading: false, status: "idle", controller: null, progress: 0 });
  },
  finish: () => {
    set({ isUploading: false, status: "idle" });
  },
  fail: () => {
    set({ isUploading: false, status: "error" });
  },
  reset: () => {
    set({ isUploading: false, status: "idle", progress: 0 });
  },
});
