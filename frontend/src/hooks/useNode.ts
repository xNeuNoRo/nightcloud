import {
  getAncestorsOfNodeById,
  getNodesFromDir,
  getNodesFromRoot,
} from "@/api/NodeAPI";
import type { NodeType } from "@/types";
import { sortNodesByDir } from "@/utils/sortNodes";
import { useQuery } from "@tanstack/react-query";

export function useNode(
  nodeId: NodeType["id"] | undefined,
  params?: { includeAncestors?: boolean }
) {
  // Determinar si se deben incluir los ancestros
  const includeAncestors = params && params.includeAncestors !== false;

  // Función de consulta basada en si hay un nodeId o no
  const queryFn = nodeId
    ? () => getNodesFromDir(nodeId)
    : () => getNodesFromRoot();

  // Consulta para obtener el nodo o nodos
  const {
    data: nodeData,
    isLoading: nodeLoading,
    error: nodeError,
  } = useQuery({
    queryFn,
    queryKey: ["nodes", nodeId ?? "root"],
    retry: 1,
  });

  // Consulta para obtener los ancestros si es necesario
  const {
    data: ancestorsData,
    isLoading: ancestorsLoading,
    error: ancestorsError,
  } = useQuery({
    queryFn: () => getAncestorsOfNodeById(nodeId!),
    queryKey: ["ancestors", nodeId],
    enabled: !!nodeId && includeAncestors,
  });

  // Retornar los datos y estados de carga/error
  return {
    nodeData: nodeData ? sortNodesByDir(nodeData) : undefined,
    nodeLoading,
    nodeError,
    ancestorsData: includeAncestors ? ancestorsData : undefined,
    ancestorsLoading: includeAncestors ? ancestorsLoading : false,
    ancestorsError: includeAncestors ? ancestorsError : undefined,
  };
}
