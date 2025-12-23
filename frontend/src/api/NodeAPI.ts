import { isAxiosError } from "axios";
import { api } from "@/lib/axios";
import {
  ancestorsSchema,
  nodeSchema,
  nodesSchema,
  type AncestorType,
  type NodeFolderFormData,
  type NodeType,
  type UploadProgress,
} from "@/types";
import type { FileWithPath } from "react-dropzone";
import validateApiRes from "@/utils/validateApiRes";

export type NodeAPIType = {
  folderFormData: NodeFolderFormData & { parentId?: NodeType["id"] };
  uploadFiles: {
    files: FileWithPath[];
  };
};

/**
 * @description Obtener los nodos desde la raíz
 * @returns {Promise<NodeType[]>} Lista de nodos
 */
export async function getNodesFromRoot(): Promise<NodeType[]> {
  try {
    const { data } = await api.get("/nodes");
    const apiRes = nodesSchema.safeParse(validateApiRes(data).data);

    if (apiRes.success) {
      return apiRes.data;
    } else {
      throw new Error("Error al obtener el contenido de la carpeta");
    }
  } catch (err) {
    if (isAxiosError(err) && err.response) {
      throw new Error(err.response.data.error.message);
    } else throw err;
  }
}

/**
 * @description Obtener los nodos desde una carpeta específica
 * @param nodeId ID del nodo (carpeta)
 * @returns {Promise<NodeType[]>} Lista de nodos
 */
export async function getNodesFromDir(
  nodeId: NodeType["id"]
): Promise<NodeType[]> {
  try {
    const { data } = await api.get(`/nodes/${nodeId}`);
    const apiRes = nodesSchema.safeParse(validateApiRes(data).data);

    if (apiRes.success) {
      return apiRes.data;
    } else {
      throw new Error("Error al obtener el contenido de la carpeta");
    }
  } catch (err) {
    if (isAxiosError(err) && err.response) {
      throw new Error(err.response.data.error.message);
    } else throw err;
  }
}

/**
 * @description Obtener los ancestros de un nodo específico
 * @param nodeId ID del nodo
 * @returns {Promise<AncestorType[]>} Lista de ancestros
 */
export async function getAncestorsOfNodeById(
  nodeId: NodeType["id"]
): Promise<AncestorType[]> {
  try {
    const { data } = await api.get(`/nodes/${nodeId}/ancestors`);
    const apiRes = ancestorsSchema.safeParse(validateApiRes(data).data);

    if (apiRes.success) {
      return apiRes.data;
    } else {
      throw new Error("Error al obtener los ancestros del nodo");
    }
  } catch (err) {
    if (isAxiosError(err) && err.response) {
      throw new Error(err.response.data.error.message);
    } else throw err;
  }
}

/**
 * @description Crear una nueva carpeta
 * @param param0 Datos del formulario de la carpeta
 * @returns {Promise<NodeType>} Nodo creado
 */
export async function createNodeFolder({
  parentId,
  name,
}: NodeAPIType["folderFormData"]): Promise<NodeType> {
  try {
    const { data } = await api.post("/nodes", {
      parentId,
      name,
      isDir: true,
    });
    const apiRes = nodeSchema.safeParse(validateApiRes(data).data);

    if (apiRes.success) {
      return apiRes.data;
    } else {
      throw new Error("Error al crear la carpeta");
    }
  } catch (err) {
    if (isAxiosError(err) && err.response) {
      throw new Error(err.response.data.error.message);
    } else throw err;
  }
}

export async function uploadFiles(
  formData: FormData,
  signal: AbortSignal,
  cb: (p: UploadProgress) => void
): Promise<NodeType[]> {
  try {
    const { data } = await api.post("/nodes/upload", formData, {
      signal, // AbortSignal para cancelar la petición si el usuario lo desea
      // Función para rastrear el progreso de la subida
      onUploadProgress: (progressEvent) => {
        // Asegurarse de que el total no sea cero para evitar división por cero
        if (!progressEvent.total) return;

        // Llamar el callback con los datos de la subida
        cb({
          loaded: progressEvent.loaded,
          total: progressEvent.total,
          percent: Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          ),
        });
      },
    });

    // Validar la respuesta de la API
    const apiRes = nodesSchema.safeParse(validateApiRes(data).data);

    // Retornar los datos validados
    if (apiRes.success) {
      return apiRes.data;
    } else {
      throw new Error("Error al crear la carpeta");
    }
  } catch (err) {
    if (isAxiosError(err) && err.response) {
      throw new Error(err.response.data.error.message);
    } else throw err;
  }
}
