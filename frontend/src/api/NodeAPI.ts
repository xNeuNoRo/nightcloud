import { isAxiosError } from "axios";
import { api } from "@/lib/axios";
import {
  ancestorsSchema,
  nodesSchema,
  type AncestorType,
  type NodeType,
} from "@/types";
import validateApiRes from "@/utils/validateApiRes";

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
