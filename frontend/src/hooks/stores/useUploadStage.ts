import { useAppStore } from "@/stores/useAppStore";

export function useUploadStage() {
  const { stageFiles, stagedFiles, removeFileFromStaging, clearStagedFiles } =
    useAppStore();

  return {
    stageFiles,
    stagedFiles,
    removeFileFromStaging,
    clearStagedFiles,
  };
}
