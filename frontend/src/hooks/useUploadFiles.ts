import { uploadFiles, type NodeAPIType } from "@/api/NodeAPI";
import { useAppStore } from "@/stores/useAppStore";
import type { NodeType } from "@/types";
import {
  cancelUploadToast,
  createUploadToast,
  errorUploadToast,
  successUploadToast,
  updateUploadToast,
} from "@/utils/toasts/uploadToast";
import { buildUploadFormData } from "@/utils/build/buildUploadFormData";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUploadFiles(parentId: NodeType["id"] | null) {
  const queryClient = useQueryClient();
  const upload = useAppStore();

  return useMutation({
    mutationFn: async ({ files }: NodeAPIType["uploadFiles"]) => {
      // Crear un AbortController para manejar la cancelación de la subida
      const controller = new AbortController();

      // Guardar el controlador en el estado de zustand
      upload.setController(controller);

      // Crear el toast de subida
      const toastId = createUploadToast();

      // Iniciar la subida (actualizar estado de zustand)
      upload.start();

      // Realizar la subida
      try {
        // Construir el FormData para la subida
        const formData = buildUploadFormData(files, parentId);

        // Subir los archivos
        const res = await uploadFiles(formData, controller.signal, async (p) => {
          // Actualizar el estado de zustand
          upload.setProgress(p.percent);

          // Actualizar el toast con el progreso y la función de cancelación
          updateUploadToast(toastId, () => upload.cancel(), p.percent);
        });

        // Finalizar la subida (actualizar estado de zustand)
        upload.finish();

        // Actualizar el toast a éxito
        successUploadToast(toastId);

        // Retornar la respuesta
        return res;
      } catch (err) {
        if (controller.signal.aborted) {
          // Si la subida fue abortada, simplemente resetear el estado
          upload.reset();

          // Actualizar el toast a cancelado
          cancelUploadToast(toastId);
          return;
        } else {
          // En caso de error, actualizar el estado y el toast
          upload.fail();
          errorUploadToast(toastId);
        }
        throw err;
      }
    },
    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["nodes", parentId ?? "root"],
      });
      upload.finish();
    },
  });
}
