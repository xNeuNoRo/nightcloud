import { isAxiosError } from "axios";
import { api } from "@/lib/axios";
import {
  ancestorsSchema,
  nodeSchema,
  nodesSchema,
  type AncestorType,
  type NodeFolderFormData,
  type NodeRenameFormData,
  type NodeType,
  type UploadProgress,
} from "@/types";
import type { FileWithPath } from "react-dropzone";
import validateApiRes from "@/utils/validateApiRes";

export type NodeAPIType = {
  folderFormData: NodeFolderFormData & { parentId?: NodeType["id"] };
  renameFormData: NodeRenameFormData & { nodeId: NodeType["id"] };
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

/**
 * @description Subir archivos al servidor
 * @param formData Datos del formulario (archivos)
 * @param signal AbortSignal para cancelar la petición
 * @param cb Callback para el progreso de la subida
 * @returns {Promise<NodeType[]>} Lista de nodos creados
 */
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

/**
 * @description Renombrar un nodo
 * @param param0 Datos del formulario de renombrado
 * @returns {Promise<NodeType>} Nodo renombrado
 */
export async function renameNode({
  name,
  nodeId,
}: NodeAPIType["renameFormData"]): Promise<NodeType> {
  try {
    const { data } = await api.patch(`/nodes/${nodeId}/rename`, {
      newName: name,
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

/**
 * @description Obtener los detalles de un nodo
 * @param nodeId ID del nodo
 * @returns {Promise<NodeType>} Detalles del nodo
 */
export async function getNodeDetails(
  nodeId: NodeType["id"]
): Promise<NodeType> {
  try {
    const { data } = await api.get(`/nodes/${nodeId}/details`);
    const apiRes = nodeSchema.safeParse(validateApiRes(data).data);

    if (apiRes.success) {
      return apiRes.data;
    } else {
      throw new Error("Error al obtener los detalles del nodo");
    }
  } catch (err) {
    if (isAxiosError(err) && err.response) {
      throw new Error(err.response.data.error.message);
    } else throw err;
  }
}
