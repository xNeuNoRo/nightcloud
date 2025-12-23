import {
  getAncestorsOfNodeById,
  getNodeDetails,
  getNodesFromDir,
  getNodesFromRoot,
} from "@/api/NodeAPI";
import type { NodeType } from "@/types";
import { sortNodesByDir } from "@/utils/sortNodes";
import { useQuery } from "@tanstack/react-query";

type UseNodeMode =
  | "node"
  | "children"
  | "ancestors"
  | "node+children"
  | "node+ancestors"
  | "ancestors+children"
  | "all";

type queryConfigType = {
  node: boolean;
  children: boolean;
  ancestors: boolean;
};

const getModeFlags = (mode: UseNodeMode, queryConfig: queryConfigType) => {
  switch (mode) {
    case "node":
      return { ...queryConfig, node: true };
    case "children":
      return { ...queryConfig, children: true };
    case "ancestors":
      return { ...queryConfig, ancestors: true };
    case "node+children":
      return { ...queryConfig, node: true, children: true };
    case "node+ancestors":
      return { ...queryConfig, node: true, ancestors: true };
    case "ancestors+children":
      return { ...queryConfig, ancestors: true, children: true };
    case "all":
      return { node: true, children: true, ancestors: true };
    default:
      return queryConfig;
  }
};

// Función para obtener los hijos de un nodo o desde la raíz
const getChildrenQueryFn = (nodeId?: NodeType["id"]) =>
  nodeId ? () => getNodesFromDir(nodeId) : () => getNodesFromRoot();

/**
 * @description Hook personalizado para obtener datos de un nodo, sus hijos y ancestros
 * @param nodeId ID del nodo
 * @param mode Modo de consulta (qué datos cargar)
 * @returns {object} Datos y estados de carga/error
 */
export function useNode(
  nodeId: NodeType["id"] | undefined,
  mode: UseNodeMode = "all"
) {
  // Configuración para determinar qué datos cargar
  const {
    node: includeNode,
    children: includeChildrens,
    ancestors: includeAncestors,
  } = getModeFlags(mode, {
    node: false,
    children: false,
    ancestors: false,
  });

  // Verificar si hay un nodeId válido
  const hasNodeId = Boolean(nodeId);

  // Datos y estados de la consulta del nodo actual
  const nodeQuery = useQuery({
    queryFn: () => getNodeDetails(nodeId!),
    queryKey: ["nodeDetails", nodeId],
    enabled: hasNodeId && includeNode, // Solo cargar si hay nodeId y se quiere el nodo
  });
  console.log("useNode - nodeQuery:", hasNodeId && includeNode);

  // Consulta para obtener los hijos si es necesario
  const childrenQuery = useQuery({
    queryFn: getChildrenQueryFn(nodeId),
    queryKey: ["nodes", nodeId ?? "root"],
    retry: 1,
    enabled: includeChildrens, // Solo cargar si se quieren hijos, independientemente de nodeId ya que puede ser root
  });

  // Consulta para obtener los ancestros si es necesario
  const ancestorsQuery = useQuery({
    queryFn: () => getAncestorsOfNodeById(nodeId!),
    queryKey: ["ancestors", nodeId],
    enabled: hasNodeId && includeAncestors, // Solo cargar si hay nodeId y se quieren ancestros
  });

  // Retornar los datos y estados de carga/error
  return {
    // Datos y estados del nodo actual
    nodeData: nodeQuery.data,
    nodeDataLoading: nodeQuery.isLoading,
    nodeDataError: nodeQuery.error,

    // Solo incluir datos de hijos si se solicitó
    nodeChildrenData: childrenQuery.data
      ? sortNodesByDir(childrenQuery.data)
      : undefined,
    nodeChildrenLoading: includeChildrens ? childrenQuery.isLoading : false,
    nodeChildrenError: includeChildrens ? childrenQuery.error : undefined,

    // Solo incluir datos de ancestros si se solicitó
    ancestorsData: includeAncestors ? ancestorsQuery.data : undefined,
    ancestorsLoading: includeAncestors ? ancestorsQuery.isLoading : false,
    ancestorsError: includeAncestors ? ancestorsQuery.error : undefined,
  };
}
